import express from "express";
import Category from "../models/Category";
import { Error } from "mongoose";
import mongoose from "mongoose";

const categoriesRouter = express.Router();

categoriesRouter.get("/", async (req, res, next) => {
  try {
    const categories = await Category.find();
    return res.send(categories);
  } catch (e) {
    return next(e);
  }
});

categoriesRouter.post("/", async (req, res, next) => {
  const categoryData = {
    title: req.body.title,
    description: req.body.description,
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

export default categoriesRouter;
