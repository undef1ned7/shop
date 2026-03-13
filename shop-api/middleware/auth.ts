import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import User from "../models/User";
import config from "../config";

interface JwtPayload {
  id: string;
}

const auth = async (req: Request, res: Response, next: NextFunction) => {
  const authHeader = req.header("Authorization");

  if (!authHeader) {
    return res.status(401).send({ error: "No authorization header" });
  }

  const [scheme, token] = authHeader.split(" ");

  if (scheme !== "Bearer" || !token) {
    return res.status(401).send({ error: "Invalid authorization header" });
  }

  try {
    const payload = jwt.verify(token, config.jwtAccessSecret) as JwtPayload;

    const user = await User.findById(payload.id);

    if (!user) {
      return res.status(401).send({ error: "User not found" });
    }

    req.user = user;

    return next();
  } catch {
    return res.status(401).send({ error: "Invalid token" });
  }
};

export default auth;

