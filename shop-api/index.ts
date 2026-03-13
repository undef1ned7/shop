/// <reference path="./express.d.ts" />
import cors from "cors";
import express from "express";
import mongoose from "mongoose";
import swaggerUi from "swagger-ui-express";
import productsRouter from "./routers/products";
import categoriesRouter from "./routers/categories";
import usersRouter from "./routers/users";
import ordersRouter from "./routers/orders";
import swaggerSpec from "./swagger";

const app = express();
const PORT = 8000;

app.use(cors());
app.use(express.static("public"));
app.use(express.json());

app.use("/products", productsRouter);
app.use("/categories", categoriesRouter);
app.use("/users", usersRouter);
app.use("/orders", ordersRouter);

app.use("/swagger", swaggerUi.serve, swaggerUi.setup(swaggerSpec));

app.get("/", (req, res) => {
  res.send("Welcome to the Shop API");
});

const run = async () => {
  mongoose.set("strictQuery", false);
  const mongoUri = process.env.MONGODB_URI || "mongodb://localhost/shop";
  await mongoose.connect(mongoUri);

  app.listen(PORT, () => {
    console.log(`We are live on ${PORT}`);
  });

  process.on("exit", () => {
    mongoose.disconnect();
  });
};

run().catch(console.log);
