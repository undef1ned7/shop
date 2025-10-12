import express from "express";
import Product from "../models/Product";
import { imagesUpload } from "../multer";
import { ProductMutation } from "../types";
import mongoose from "mongoose";

const productsRouter = express.Router();

productsRouter.get("/", async (req, res) => {
  try {
    const products = await Product.find().populate("category");
    return res.send(products);
  } catch {
    return res.sendStatus(500);
  }
});

productsRouter.get("/:id", async (req, res) => {
  try {
    const result = await Product.findById(req.params.id);

    if (!result) {
      res.sendStatus(404);
    }

    return res.send(result);
  } catch {
    res.sendStatus(500);
  }
});

productsRouter.post(
  "/",
  imagesUpload.single("image"),
  async (req, res, next) => {
    const productData: ProductMutation = {
      category: req.body.category,
      title: req.body.title,
      description: req.body.description,
      price: parseFloat(req.body.price),
      image: req.file ? req.file.filename : null,
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
  }
);

export default productsRouter;
