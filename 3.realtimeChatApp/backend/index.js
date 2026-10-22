import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import express from "express";
import cookieParser from "cookie-parser";
import cors from "cors";
import mongoose from "mongoose";
import env from "./config/env.js";
import connectDb, { dbState } from "./config/db.js";
import { storageMode } from "./config/cloudinary.js";
import authRouter from "./routes/auth.routes.js";
import userRouter from "./routes/user.routes.js";
import messageRouter from "./routes/message.routes.js";
import { app, server } from "./socket/socket.js";
import { isOriginAllowed } from "./utils/origins.js";

const backendDir = path.dirname(fileURLToPath(import.meta.url));
const frontendDist = path.resolve(backendDir, "../frontend/dist");
const allowedOrigins = [...new Set([...env.clientUrls, env.serverUrl])];

app.set("trust proxy", 1);
app.disable("x-powered-by");

app.use(
  cors({
    origin: (origin, callback) => {
      if (isOriginAllowed(origin, allowedOrigins)) {
        return callback(null, true);
      }
      return callback(new Error("Not allowed by CORS"));
    },
    credentials: true,
  })
);
app.use(express.json({ limit: "1mb" }));
app.use(cookieParser());
app.use("/uploads", express.static(env.uploadDir, { maxAge: "1d" }));

app.get("/api/health", (req, res) => {
  res.json({
    status: "ok",
    service: "chatly-backend",
    database: dbState(),
    storage: storageMode,
    uptime: Math.round(process.uptime()),
    timestamp: new Date().toISOString(),
  });
});

app.use("/api/auth", authRouter);
app.use("/api/user", userRouter);
app.use("/api/message", messageRouter);

app.use("/api", (req, res) => {
  res.status(404).json({ message: "API route not found" });
});

const hasFrontendBuild = fs.existsSync(frontendDist);

if (hasFrontendBuild) {
  app.use(express.static(frontendDist));
  app.use((req, res, next) => {
    if (req.method !== "GET" || req.path.startsWith("/uploads")) {
      return next();
    }
    if (!req.accepts("html")) {
      return next();
    }
    return res.sendFile(path.join(frontendDist, "index.html"));
  });
} else {
  app.get("/", (req, res) => {
    res.json({ status: "ok", service: "chatly-backend" });
  });
}

app.use((err, req, res, next) => {
  if (res.headersSent) return next(err);

  if (err.name === "MulterError") {
    return res.status(400).json({ message: err.message });
  }

  console.error("[error]", err.message);
  return res.status(err.status || 500).json({
    message: err.message || "Something went wrong",
  });
});

const startServer = async () => {
  try {
    await connectDb();

    server.listen(env.port, () => {
      console.log(`API ready on ${env.serverUrl}`);
      console.log(`Storage mode: ${storageMode}`);
      if (fs.existsSync(frontendDist)) {
        console.log("Serving built frontend from frontend/dist");
      }
    });
  } catch (error) {
    console.error("Server start failed:", error.message);
    process.exit(1);
  }
};

const shutdown = async (signal) => {
  console.log(`\n${signal} received - shutting down`);
  server.close(() => {
    mongoose.connection.close().finally(() => process.exit(0));
  });
  setTimeout(() => process.exit(1), 5000).unref();
};

process.on("SIGINT", () => shutdown("SIGINT"));
process.on("SIGTERM", () => shutdown("SIGTERM"));

startServer();
