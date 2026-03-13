/// <reference path="../express.d.ts" />
import express from "express";
import mongoose from "mongoose";
import Product from "../models/Product";
import { imagesUpload } from "../multer";
import { ProductMutation } from "../types";
import auth from "../middleware/auth";

const productsRouter = express.Router();

productsRouter.get("/", auth, async (req, res) => {
  try {
    const user = req.user!;
    const isAdmin = user.role === "admin";
    const isSeller = user.role === "seller";

    const {
      search,
      category,
      minPrice,
      maxPrice,
      page = "1",
      limit = "12",
      sort = "createdAt_desc",
    } = req.query as {
      search?: string;
      category?: string;
      minPrice?: string;
      maxPrice?: string;
      page?: string;
      limit?: string;
      sort?: string;
    };

    const filter: mongoose.FilterQuery<typeof Product> = {} as any;

    if (isSeller) {
      (filter as any).user = user._id;
    }

    if (category) {
      (filter as any).category = category;
    }

    if (search) {
      const regex = new RegExp(search, "i");
      (filter as any).$or = [{ title: regex }, { description: regex }];
    }

    const priceFilter: Record<string, number> = {};
    const min = minPrice ? parseFloat(minPrice) : undefined;
    const max = maxPrice ? parseFloat(maxPrice) : undefined;
    if (min !== undefined && !Number.isNaN(min)) priceFilter.$gte = min;
    if (max !== undefined && !Number.isNaN(max)) priceFilter.$lte = max;
    if (Object.keys(priceFilter).length > 0) {
      (filter as any).price = priceFilter;
    }

    const pageNum = Math.max(parseInt(page, 10) || 1, 1);
    const limitNum = Math.max(parseInt(limit, 10) || 12, 1);
    const skip = (pageNum - 1) * limitNum;

    let sortOption: Record<string, 1 | -1>;
    switch (sort) {
      case "price_asc":
        sortOption = { price: 1 };
        break;
      case "price_desc":
        sortOption = { price: -1 };
        break;
      case "title_asc":
        sortOption = { title: 1 };
        break;
      case "title_desc":
        sortOption = { title: -1 };
        break;
      case "createdAt_asc":
        sortOption = { createdAt: 1 };
        break;
      case "createdAt_desc":
      default:
        sortOption = { createdAt: -1 };
        break;
    }

    const totalCount = await Product.countDocuments(filter);
    const products = await Product.find(filter)
      .sort(sortOption)
      .skip(skip)
      .limit(limitNum)
      .populate("category");

    const rawFavorites = (user as any).favorites as
      | mongoose.Types.ObjectId[]
      | undefined;
    const favoriteIds = new Set(
      (rawFavorites || []).map((fav) => fav.toString()),
    );

    const results = products.map((product) => {
      const obj = product.toObject();
      return {
        ...obj,
        isFavorite: favoriteIds.has(product._id.toString()),
      };
    });

    const buildUrl = (targetPage: number) => {
      const params = new URLSearchParams();
      if (search) params.set("search", search);
      if (category) params.set("category", category);
      if (minPrice) params.set("minPrice", minPrice);
      if (maxPrice) params.set("maxPrice", maxPrice);
      if (sort) params.set("sort", sort);
      params.set("page", String(targetPage));
      params.set("limit", String(limitNum));

      return `${req.protocol}://${req.get("host")}${req.path}?${params.toString()}`;
    };

    const hasNext = skip + products.length < totalCount;
    const hasPrev = pageNum > 1;

    return res.send({
      count: totalCount,
      next: hasNext ? buildUrl(pageNum + 1) : null,
      previous: hasPrev ? buildUrl(pageNum - 1) : null,
      results,
    });
  } catch {
    return res.sendStatus(500);
  }
});

productsRouter.get("/:id", auth, async (req, res) => {
  try {
    const user = req.user!;
    const isAdmin = user.role === "admin";
    const isSeller = user.role === "seller";
    const filter: mongoose.FilterQuery<typeof Product> = {
      _id: req.params.id,
    } as any;
    if (isSeller) (filter as any).user = user._id;

    const result = await Product.findOne(filter).populate("category");

    if (!result) {
      return res.sendStatus(404);
    }

    return res.send(result);
  } catch {
    return res.sendStatus(500);
  }
});

productsRouter.post(
  "/",
  auth,
  imagesUpload.single("image"),
  async (req, res, next) => {
    const currentUser = req.user!;
    if (currentUser.role !== "admin" && currentUser.role !== "seller") {
      return res.sendStatus(403);
    }
    if (!req.body.category || !req.body.title || !req.body.price) {
      return res.status(400).send({
        error: "category, title and price are required",
      });
    }

    const priceNumber = parseFloat(req.body.price);
    if (Number.isNaN(priceNumber) || priceNumber <= 0) {
      return res.status(400).send({ error: "Price must be a positive number" });
    }

    const productData: ProductMutation = {
      category: req.body.category,
      title: req.body.title,
      description: req.body.description,
      price: priceNumber,
      image: req.file ? req.file.filename : null,
      user: req.user!._id.toString(),
    };

    const product = new Product(productData);

    try {
      await product.save();
      return res.send(product);
    } catch (e) {
      if (e instanceof mongoose.Error.ValidationError) {
        return res.status(400).send(e);
      } else {
        return next(e);
      }
    }
  },
);

const canModifyProduct = (
  product: { user: mongoose.Types.ObjectId },
  user: { _id: { toString(): string }; role: string },
) => user.role === "admin" || product.user.toString() === user._id.toString();

productsRouter.patch(
  "/:id",
  auth,
  imagesUpload.single("image"),
  async (req, res, next) => {
    try {
      const user = req.user!;
      const isAdmin = user.role === "admin";
      const isSeller = user.role === "seller";
      const filter: mongoose.FilterQuery<typeof Product> = {
        _id: req.params.id,
      } as any;
      if (isSeller) (filter as any).user = user._id;

      const product = await Product.findOne(filter);
      if (!product) return res.sendStatus(404);
      if (!canModifyProduct(product, user)) return res.sendStatus(403);

      if (req.body.category !== undefined) {
        if (!req.body.category) {
          return res
            .status(400)
            .send({ error: "Category must not be empty" });
        }
        product.category = req.body.category as any;
      }

      if (req.body.title !== undefined) {
        if (!req.body.title || typeof req.body.title !== "string") {
          return res
            .status(400)
            .send({ error: "Title must be a non-empty string" });
        }
        product.title = req.body.title;
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
        product.description = req.body.description;
      }

      if (req.body.price !== undefined) {
        const priceNumber = parseFloat(req.body.price);
        if (Number.isNaN(priceNumber) || priceNumber <= 0) {
          return res
            .status(400)
            .send({ error: "Price must be a positive number" });
        }
        product.price = priceNumber;
      }
      if (req.file) product.image = req.file.filename;

      await product.save();
      const updated = await Product.findById(product._id).populate("category");
      return res.send(updated);
    } catch (e) {
      if (e instanceof mongoose.Error.ValidationError)
        return res.status(400).send(e);
      return next(e);
    }
  },
);

productsRouter.delete("/:id", auth, async (req, res, next) => {
  try {
    const user = req.user!;
    const isAdmin = user.role === "admin";
    const isSeller = user.role === "seller";
    const filter: mongoose.FilterQuery<typeof Product> = {
      _id: req.params.id,
    } as any;
    if (isSeller) (filter as any).user = user._id;

    const product = await Product.findOne(filter);
    if (!product) return res.sendStatus(404);
    if (!canModifyProduct(product, user)) return res.sendStatus(403);

    await Product.findByIdAndDelete(req.params.id);
    return res.sendStatus(204);
  } catch (e) {
    return next(e);
  }
});

export default productsRouter;
