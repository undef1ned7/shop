import cors from "cors";
import express from "express";
import mongoose from "mongoose";
import productsRouter from "./routers/products";
import categoriesRouter from "./routers/categories";

const app = express();
const PORT = 8000;
app.use(cors());
app.use(express.static("public"));
app.use(express.json());
app.use("/products", productsRouter);
app.use("/categories", categoriesRouter);
app.get("/", (req, res) => {
  res.send("Welcome to the Shop API");
});

const run = async () => {
  mongoose.set("strictQuery", false);
  await mongoose.connect("mongodb://localhost/shop");

  app.listen(PORT, () => {
    console.log(`We are live on ${PORT}`);
  });

  process.on("exit", () => {
    mongoose.disconnect();
  });
};

run().catch(console.log);
