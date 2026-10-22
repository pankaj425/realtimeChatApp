import fs from "node:fs";
import path from "node:path";
import { v2 as cloudinary } from "cloudinary";
import env from "./env.js";

if (env.cloudinary.enabled) {
  cloudinary.config({
    cloud_name: env.cloudinary.cloudName,
    api_key: env.cloudinary.apiKey,
    api_secret: env.cloudinary.apiSecret,
  });
}

const removeLocalFile = (filePath) => {
  try {
    fs.unlinkSync(filePath);
  } catch {
    // file already removed
  }
};

export const storageMode = env.cloudinary.enabled ? "cloudinary" : "local";

const uploadFile = async (filePath) => {
  if (!filePath) return "";

  const fileName = path.basename(filePath);
  const localUrl = `/uploads/${encodeURIComponent(fileName)}`;

  if (!env.cloudinary.enabled) {
    return localUrl;
  }

  try {
    const result = await cloudinary.uploader.upload(filePath, {
      resource_type: "auto",
    });
    removeLocalFile(filePath);
    return result.secure_url;
  } catch (error) {
    console.warn(
      `[storage] Cloudinary upload failed (${error.message}) - keeping the local copy`
    );
    return localUrl;
  }
};

export default uploadFile;
