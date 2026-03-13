/// <reference path="../express.d.ts" />
import express from "express";
import Order from "../models/Order";
import auth from "../middleware/auth";
import User from "../models/User";

const ordersRouter = express.Router();

ordersRouter.post("/", auth, async (req, res, next) => {
  try {
    const userReq = req.user!;

    const user = await User.findById(userReq._id).populate("cart.product");
    if (!user) {
      return res.status(404).send({ error: "User not found" });
    }

    const cartItems = (user.cart as any[]) || [];
    if (cartItems.length === 0) {
      return res.status(400).send({ error: "Cart is empty" });
    }

    const items = cartItems.map((item) => {
      const product = item.product as any;
      if (!product || typeof product.price !== "number") {
        throw new Error("Invalid product in cart");
      }

      return {
        product: product._id,
        qty: item.qty,
        price: product.price,
      };
    });

    const total = items.reduce(
      (sum, item) => sum + item.price * item.qty,
      0,
    );

    const order = new Order({
      user: user._id,
      items,
      total,
    });

    await order.save();

    // очищаем корзину
    user.cart = [] as any;
    await user.save();

    const populatedOrder = await Order.findById(order._id)
      .populate("user", "username role")
      .populate("items.product");

    return res.status(201).send(populatedOrder);
  } catch (e) {
    return next(e);
  }
});

ordersRouter.get("/", auth, async (req, res, next) => {
  try {
    const user = req.user!;
    const isAdmin = user.role === "admin";

    const filter = isAdmin ? {} : { user: user._id };

    const orders = await Order.find(filter)
      .sort({ createdAt: -1 })
      .populate("user", "username role")
      .populate("items.product");

    return res.send(orders);
  } catch (e) {
    return next(e);
  }
});

ordersRouter.get("/:id", auth, async (req, res, next) => {
  try {
    const user = req.user!;
    const isAdmin = user.role === "admin";

    const order = await Order.findById(req.params.id)
      .populate("user", "username role")
      .populate("items.product");

    if (!order) {
      return res.sendStatus(404);
    }

    if (!isAdmin && order.user.toString() !== user._id.toString()) {
      return res.sendStatus(403);
    }

    return res.send(order);
  } catch (e) {
    return next(e);
  }
});

ordersRouter.patch("/:id/status", auth, async (req, res, next) => {
  try {
    const user = req.user!;
    if (user.role !== "admin") {
      return res.sendStatus(403);
    }

    const { status } = req.body as { status?: string };

    if (
      !status ||
      !["new", "paid", "shipped", "completed", "cancelled"].includes(status)
    ) {
      return res.status(400).send({ error: "Invalid status" });
    }

    const order = await Order.findById(req.params.id)
      .populate("user", "username role")
      .populate("items.product");

    if (!order) {
      return res.sendStatus(404);
    }

    order.status = status as any;
    await order.save();

    return res.send(order);
  } catch (e) {
    return next(e);
  }
});

export default ordersRouter;

