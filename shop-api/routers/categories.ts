/// <reference path="../express.d.ts" />
import express from "express";
import mongoose from "mongoose";
import Category from "../models/Category";
import auth from "../middleware/auth";

const categoriesRouter = express.Router();

categoriesRouter.get("/", auth, async (req, res, next) => {
  try {
    const user = req.user!;
    const isAdmin = user.role === "admin";
    const filter = isAdmin || user.role === "user" ? {} : { user: user._id };

    const categories = await Category.find(filter);
    return res.send(categories);
  } catch (e) {
    return next(e);
  }
});

categoriesRouter.get("/:id", auth, async (req, res, next) => {
  try {
    const user = req.user!;
    const isAdmin = user.role === "admin";
    const filter: mongoose.FilterQuery<typeof Category> = { _id: req.params.id } as any;
    if (!isAdmin && user.role === "seller") (filter as any).user = user._id;

    const category = await Category.findOne(filter);
    if (!category) return res.sendStatus(404);
    return res.send(category);
  } catch (e) {
    return next(e);
  }
});

categoriesRouter.post("/", auth, async (req, res, next) => {
  const user = req.user!;
  if (user.role !== "admin" && user.role !== "seller") {
    return res.sendStatus(403);
  }
  if (!req.body.title || typeof req.body.title !== "string") {
    return res
      .status(400)
      .send({ error: "Title is required and must be a string" });
  }

  const categoryData = {
    title: req.body.title,
    description: req.body.description,
    user: req.user!._id,
  };

  const category = new Category(categoryData);

  try {
    await category.save();
    return res.send(category);
  } catch (e) {
    if (e instanceof mongoose.Error.ValidationError) {
      return res.status(400).send(e);
    } else {
      return next(e);
    }
  }
});

const canModifyCategory = (
  category: { user: mongoose.Types.ObjectId },
  user: { _id: { toString(): string }; role: string },
) => user.role === "admin" || category.user.toString() === user._id.toString();

categoriesRouter.patch("/:id", auth, async (req, res, next) => {
  try {
    const user = req.user!;
    const isAdmin = user.role === "admin";
    const isSeller = user.role === "seller";
    const filter: mongoose.FilterQuery<typeof Category> = { _id: req.params.id } as any;
    if (!isAdmin && isSeller) (filter as any).user = user._id;

    const category = await Category.findOne(filter);
    if (!category) return res.sendStatus(404);
    if (!canModifyCategory(category, user)) return res.sendStatus(403);

    if (req.body.title !== undefined) {
      if (!req.body.title || typeof req.body.title !== "string") {
        return res
          .status(400)
          .send({ error: "Title is required and must be a string" });
      }
      category.title = req.body.title;
    }

    if (req.body.description !== undefined) {
      if (
        req.body.description !== null &&
        typeof req.body.description !== "string"
      ) {
        return res
          .status(400)
          .send({ error: "Description must be a string or null" });
      }
      category.description = req.body.description;
    }
    await category.save();
    return res.send(category);
  } catch (e) {
    if (e instanceof mongoose.Error.ValidationError) return res.status(400).send(e);
    return next(e);
  }
});

categoriesRouter.delete("/:id", auth, async (req, res, next) => {
  try {
    const user = req.user!;
    const isAdmin = user.role === "admin";
    const isSeller = user.role === "seller";
    const filter: mongoose.FilterQuery<typeof Category> = { _id: req.params.id } as any;
    if (!isAdmin && isSeller) (filter as any).user = user._id;

    const category = await Category.findOne(filter);
    if (!category) return res.sendStatus(404);
    if (!canModifyCategory(category, user)) return res.sendStatus(403);

    const Product = (await import("../models/Product")).default;
    const hasProducts = await Product.countDocuments({ category: req.params.id });
    if (hasProducts > 0) {
      return res.status(400).send({ error: "Category has products. Delete or reassign them first." });
    }

    await Category.findByIdAndDelete(req.params.id);
    return res.sendStatus(204);
  } catch (e) {
    return next(e);
  }
});

export default categoriesRouter;
