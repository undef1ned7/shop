import path from "node:path";

const rootPath = __dirname;

const config = {
  rootPath,
  publicPath: path.join(rootPath, "public"),
  jwtAccessSecret: process.env.JWT_ACCESS_SECRET || "access_secret_key",
  jwtRefreshSecret: process.env.JWT_REFRESH_SECRET || "refresh_secret_key",
  jwtAccessExpiresIn: "15m",
  jwtRefreshExpiresIn: "7d",
};

export default config;
