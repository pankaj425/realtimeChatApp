import mongoose from "mongoose";
import env from "./env.js";

const states = {
  0: "disconnected",
  1: "connected",
  2: "connecting",
  3: "disconnecting",
};

export const dbState = () => states[mongoose.connection.readyState] || "unknown";

const connectDb = async () => {
  try {
    await mongoose.connect(env.mongoUri, { serverSelectionTimeoutMS: 8000 });
    console.log(
      `MongoDB connected (${mongoose.connection.host}/${mongoose.connection.name})`
    );
  } catch (error) {
    console.error("MongoDB connection error:", error.message);

    if (/127\.0\.0\.1|localhost/.test(env.mongoUri)) {
      console.error(
        "Start MongoDB locally, run `docker compose up -d mongo`, or set MONGO_URI in backend/.env"
      );
    }

    throw error;
  }
};

export default connectDb;
