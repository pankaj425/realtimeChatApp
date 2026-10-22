import path from "node:path";
import { fileURLToPath } from "node:url";
import dotenv from "dotenv";
import { parseOrigins } from "../utils/origins.js";

dotenv.config();

const backendDir = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const isProduction = process.env.NODE_ENV === "production";
const port = Number(process.env.PORT) || 5000;
const serverUrl = (process.env.SERVER_URL || `http://localhost:${port}`).replace(/\/$/, "");

const cloudinary = {
  cloudName: process.env.CLOUD_NAME || "",
  apiKey: process.env.API_KEY || "",
  apiSecret: process.env.API_SECRET || "",
};
cloudinary.enabled = Boolean(cloudinary.cloudName && cloudinary.apiKey && cloudinary.apiSecret);

if (isProduction && !process.env.JWT_SECRET) {
  throw new Error("JWT_SECRET must be set when NODE_ENV=production");
}

if (!process.env.JWT_SECRET) {
  console.warn("[env] JWT_SECRET is not set - using an insecure development secret");
}

if (!process.env.MONGO_URI) {
  console.warn(
    "[env] MONGO_URI is not set - falling back to mongodb://127.0.0.1:27017/chatly"
  );
}

if (!cloudinary.enabled) {
  console.warn(
    "[env] Cloudinary is not configured - images will be saved to backend/public/uploads"
  );
}

const env = {
  isProduction,
  port,
  serverUrl,
  clientUrls: parseOrigins(process.env.CLIENT_URL, [
    "http://localhost:5173",
    "http://127.0.0.1:5173",
    "http://localhost:4173",
    "http://127.0.0.1:4173",
  ]),
  mongoUri: process.env.MONGO_URI || "mongodb://127.0.0.1:27017/chatly",
  jwtSecret: process.env.JWT_SECRET || "chatly-insecure-development-secret",
  cloudinary,
  uploadDir: path.join(backendDir, "public", "uploads"),
  cookieMaxAge: 7 * 24 * 60 * 60 * 1000,
};

export default env;
