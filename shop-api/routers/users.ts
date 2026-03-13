import express from "express";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import mongoose from "mongoose";
import User from "../models/User";
import config from "../config";
import auth from "../middleware/auth";
import Product from "../models/Product";
import Category from "../models/Category";
import Order from "../models/Order";

const usersRouter = express.Router();

type LoginAttemptInfo = {
  count: number;
  blockedUntil: number | null;
};

const loginAttempts = new Map<string, LoginAttemptInfo>();
const MAX_LOGIN_ATTEMPTS = 5;
const BLOCK_TIME_MS = 15 * 60 * 1000; // 15 минут

const generateTokens = (userId: string, role: string) => {
  const payload = { id: userId, role };

  const accessToken = (jwt as typeof jwt & { sign: any }).sign(
    payload,
    config.jwtAccessSecret,
    {
      expiresIn: config.jwtAccessExpiresIn,
    },
  );

  const refreshToken = (jwt as typeof jwt & { sign: any }).sign(
    payload,
    config.jwtRefreshSecret,
    {
      expiresIn: config.jwtRefreshExpiresIn,
    },
  );

  return { accessToken, refreshToken };
};

const getCartResponse = async (userId: mongoose.Types.ObjectId | string) => {
  const user = await User.findById(userId).populate("cart.product");
  if (!user) {
    return { items: [], total: 0 };
  }

  const items = (user.cart as any[]) || [];

  const total = items.reduce((sum, item) => {
    const product = item.product as any;
    if (!product || typeof product.price !== "number") return sum;
    return sum + product.price * item.qty;
  }, 0);

  return { items, total };
};

usersRouter.post("/register", async (req, res, next) => {
  try {
    const { username, password } = req.body;

    if (!username || !password) {
      return res
        .status(400)
        .send({ error: "Username and password are required" });
    }

    if (typeof username !== "string" || username.trim().length < 3) {
      return res
        .status(400)
        .send({ error: "Username must be at least 3 characters long" });
    }

    if (typeof password !== "string" || password.length < 6) {
      return res
        .status(400)
        .send({ error: "Password must be at least 6 characters long" });
    }

    const existingUser = await User.findOne({ username });

    if (existingUser) {
      return res.status(400).send({ error: "User already exists" });
    }

    const saltRounds = 10;
    const passwordHash = await bcrypt.hash(password, saltRounds);

    const user = new User({
      username,
      password: passwordHash,
    });

    await user.save();

    const { accessToken, refreshToken } = generateTokens(
      user._id.toString(),
      user.role,
    );

    user.refreshToken = refreshToken;
    await user.save();

    return res.status(201).send({
      id: user._id,
      username: user.username,
      accessToken,
      refreshToken,
    });
  } catch (e) {
    if (e instanceof mongoose.Error.ValidationError) {
      return res.status(400).send(e);
    }

    return next(e);
  }
});

usersRouter.post("/login", async (req, res) => {
  const { username, password } = req.body;

  if (!username || !password) {
    return res
      .status(400)
      .send({ error: "Username and password are required" });
  }

  if (typeof username !== "string" || typeof password !== "string") {
    return res.status(400).send({ error: "Invalid credentials format" });
  }

  const key = username.toLowerCase().trim();
  const now = Date.now();
  const attempt = loginAttempts.get(key);

  if (attempt && attempt.blockedUntil && attempt.blockedUntil > now) {
    return res.status(429).send({
      error: "Too many login attempts. Try again later.",
    });
  }

  const user = await User.findOne({ username });

  if (!user) {
    const info: LoginAttemptInfo = attempt || { count: 0, blockedUntil: null };
    info.count += 1;
    if (info.count >= MAX_LOGIN_ATTEMPTS) {
      info.blockedUntil = now + BLOCK_TIME_MS;
    }
    loginAttempts.set(key, info);
    return res.status(400).send({ error: "Invalid username or password" });
  }

  const isMatch = await bcrypt.compare(password, user.password);

  if (!isMatch) {
    const info: LoginAttemptInfo = attempt || { count: 0, blockedUntil: null };
    info.count += 1;
    if (info.count >= MAX_LOGIN_ATTEMPTS) {
      info.blockedUntil = now + BLOCK_TIME_MS;
    }
    loginAttempts.set(key, info);
    return res.status(400).send({ error: "Invalid username or password" });
  }

  // успешный логин — сбрасываем попытки
  loginAttempts.delete(key);

  const { accessToken, refreshToken } = generateTokens(
    user._id.toString(),
    user.role,
  );

  user.refreshToken = refreshToken;
  await user.save();

  return res.send({
    id: user._id,
    username: user.username,
    role: user.role,
    accessToken,
    refreshToken,
  });
});

usersRouter.get("/me", auth, async (req, res, next) => {
  try {
    const user = await User.findById(req.user!._id).populate("favorites");

    if (!user) {
      return res.status(404).send({ error: "User not found" });
    }

    const [products, categories] = await Promise.all([
      Product.find({ user: user._id }).populate("category"),
      Category.find({ user: user._id }),
    ]);

    return res.send({
      id: user._id,
      username: user.username,
      role: user.role,
      sellerStatus: user.sellerStatus,
      products,
      categories,
      favorites: user.favorites || [],
    });
  } catch (e) {
    return next(e);
  }
});

usersRouter.get("/favorites", auth, async (req, res, next) => {
  try {
    const user = await User.findById(req.user!._id).populate("favorites");

    if (!user) {
      return res.status(404).send({ error: "User not found" });
    }

    return res.send(user.favorites || []);
  } catch (e) {
    return next(e);
  }
});

usersRouter.post("/favorites", auth, async (req, res, next) => {
  try {
    const { productId } = req.body as { productId?: string };

    if (!productId) {
      return res.status(400).send({ error: "productId is required" });
    }

    const product = await Product.findById(productId);
    if (!product) {
      return res.status(404).send({ error: "Product not found" });
    }

    const user = await User.findById(req.user!._id);
    if (!user) {
      return res.status(404).send({ error: "User not found" });
    }

    const favorites = (user.favorites as mongoose.Types.ObjectId[]) || [];
    const exists = favorites.some(
      (fav) => fav.toString() === productId.toString(),
    );

    if (!exists) {
      favorites.push(product._id);
      user.favorites = favorites as any;
      await user.save();
    }

    const populated = await User.findById(user._id).populate("favorites");
    return res.send(populated?.favorites || []);
  } catch (e) {
    return next(e);
  }
});

usersRouter.delete("/favorites", auth, async (req, res, next) => {
  try {
    const { productId } = req.body as { productId?: string };

    const user = await User.findById(req.user!._id);
    if (!user) {
      return res.status(404).send({ error: "User not found" });
    }

    if (productId) {
      user.favorites = ((user.favorites as mongoose.Types.ObjectId[]) || []).filter(
        (fav) => fav.toString() !== productId.toString(),
      ) as any;
    } else {
      user.favorites = [] as any;
    }

    await user.save();

    const populated = await User.findById(user._id).populate("favorites");
    return res.send(populated?.favorites || []);
  } catch (e) {
    return next(e);
  }
});

usersRouter.get("/", auth, async (req, res, next) => {
  try {
    const currentUser = req.user!;

    if (currentUser.role !== "admin") {
      return res.sendStatus(403);
    }

    const users = await User.find().populate("cart.product");

    const result = await Promise.all(
      users.map(async (u) => {
        const [sellerProducts, allOrders, cart] = await Promise.all([
          Product.find({ user: u._id }).populate("category"),
          Order.find({ user: u._id })
            .sort({ createdAt: -1 })
            .populate("items.product"),
          getCartResponse(u._id),
        ]);

        const purchasedProductsMap = new Map<string, any>();

        for (const order of allOrders as any[]) {
          const items = order.items || [];
          for (const item of items) {
            const product = item.product as any;
            if (product && product._id) {
              purchasedProductsMap.set(product._id.toString(), product);
            }
          }
        }

        const sellerProductIds = new Set(
          (sellerProducts as any[]).map((p) => p._id.toString()),
        );

        const purchasedOnlyProducts = Array.from(
          purchasedProductsMap.values(),
        ).filter((p: any) => !sellerProductIds.has(p._id.toString()));

        const products = [...(sellerProducts as any[]), ...purchasedOnlyProducts];

        return {
          id: u._id,
          username: u.username,
          role: u.role,
          sellerStatus: u.sellerStatus,
          products,
          cart,
          orders: allOrders,
        };
      }),
    );

    return res.send(result);
  } catch (e) {
    return next(e);
  }
});

usersRouter.post("/change-password", auth, async (req, res) => {
  const user = req.user!;
  const { oldPassword, newPassword } = req.body;

  if (!oldPassword || !newPassword) {
    return res
      .status(400)
      .send({ error: "Old password and new password are required" });
  }

  if (typeof newPassword !== "string" || newPassword.length < 6) {
    return res
      .status(400)
      .send({ error: "New password must be at least 6 characters long" });
  }

  const dbUser = await User.findById(user._id);

  if (!dbUser) {
    return res.status(404).send({ error: "User not found" });
  }

  const isMatch = await bcrypt.compare(oldPassword, dbUser.password);

  if (!isMatch) {
    return res.status(400).send({ error: "Old password is incorrect" });
  }

  const saltRounds = 10;
  const newHash = await bcrypt.hash(newPassword, saltRounds);
  dbUser.password = newHash;
  await dbUser.save();

  return res.sendStatus(200);
});

usersRouter.post("/seller-request", auth, async (req, res) => {
  const current = await User.findById(req.user!._id);

  if (!current) {
    return res.status(404).send({ error: "User not found" });
  }

  if (current.role === "seller") {
    return res.status(400).send({ error: "You are already a seller" });
  }

  if (current.sellerStatus === "pending") {
    return res.status(400).send({ error: "Seller request is already pending" });
  }

  current.sellerStatus = "pending";
  await current.save();

  return res.send({
    id: current._id,
    username: current.username,
    role: current.role,
    sellerStatus: current.sellerStatus,
  });
});

usersRouter.patch("/:id/seller-status", auth, async (req, res) => {
  const admin = req.user!;

  if (admin.role !== "admin") {
    return res.sendStatus(403);
  }

  const { status } = req.body as { status?: string };

  if (!status || !["approved", "rejected"].includes(status)) {
    return res.status(400).send({ error: "Invalid status" });
  }

  const user = await User.findById(req.params.id);

  if (!user) {
    return res.status(404).send({ error: "User not found" });
  }

  user.sellerStatus = status as any;
  if (status === "approved") {
    user.role = "seller";
  } else if (status === "rejected" && user.role === "seller") {
    user.role = "user";
  }

  await user.save();

  return res.send({
    id: user._id,
    username: user.username,
    role: user.role,
    sellerStatus: user.sellerStatus,
  });
});

usersRouter.get("/cart", auth, async (req, res, next) => {
  try {
    const user = req.user!;
    const cart = await getCartResponse(user._id.toString());
    return res.send(cart);
  } catch (e) {
    return next(e);
  }
});

usersRouter.post("/cart", auth, async (req, res, next) => {
  try {
    const userReq = req.user!;
    const { productId, qty } = req.body as { productId?: string; qty?: number };

    if (!productId) {
      return res.status(400).send({ error: "productId is required" });
    }

    const quantity = qty && qty > 0 ? qty : 1;

    const product = await Product.findById(productId);
    if (!product) {
      return res.status(404).send({ error: "Product not found" });
    }

    const user = await User.findById(userReq._id);
    if (!user) {
      return res.status(404).send({ error: "User not found" });
    }

    const existing = (user.cart as any[]).find(
      (item) => item.product.toString() === productId,
    );

    if (existing) {
      existing.qty += quantity;
    } else {
      (user.cart as any[]).push({
        product: product._id,
        qty: quantity,
      });
    }

    await user.save();

    const cart = await getCartResponse(user._id);
    return res.send(cart);
  } catch (e) {
    return next(e);
  }
});

usersRouter.delete("/cart", auth, async (req, res, next) => {
  try {
    const userReq = req.user!;
    const { productId } = req.body as { productId?: string };

    const user = await User.findById(userReq._id);
    if (!user) {
      return res.status(404).send({ error: "User not found" });
    }

    if (productId) {
      user.cart = (user.cart as any[]).filter(
        (item) => item.product.toString() !== productId,
      ) as any;
    } else {
      user.cart = [] as any;
    }

    await user.save();

    const cart = await getCartResponse(user._id);
    return res.send(cart);
  } catch (e) {
    return next(e);
  }
});

usersRouter.post("/refresh", async (req, res) => {
  const { refreshToken } = req.body;

  if (!refreshToken) {
    return res.status(400).send({ error: "Refresh token is required" });
  }

  try {
    const payload = jwt.verify(
      refreshToken,
      config.jwtRefreshSecret,
    ) as jwt.JwtPayload;

    const user = await User.findById(payload.id);

    if (!user || user.refreshToken !== refreshToken) {
      return res.status(401).send({ error: "Invalid refresh token" });
    }

    const { accessToken, refreshToken: newRefreshToken } = generateTokens(
      user._id.toString(),
      user.role,
    );

    user.refreshToken = newRefreshToken;
    await user.save();

    return res.send({
      accessToken,
      refreshToken: newRefreshToken,
    });
  } catch {
    return res.status(401).send({ error: "Invalid refresh token" });
  }
});

usersRouter.post("/logout", async (req, res) => {
  const { refreshToken } = req.body;

  if (!refreshToken) {
    return res.status(400).send({ error: "Refresh token is required" });
  }

  try {
    const payload = jwt.verify(
      refreshToken,
      config.jwtRefreshSecret,
    ) as jwt.JwtPayload;

    const user = await User.findById(payload.id);

    if (user && user.refreshToken === refreshToken) {
      user.refreshToken = "";
      await user.save();
    }

    return res.sendStatus(200);
  } catch {
    // Если токен невалиден, всё равно возвращаем 200,
    // чтобы клиент мог считать, что сессия завершена
    return res.sendStatus(200);
  }
});

export default usersRouter;
