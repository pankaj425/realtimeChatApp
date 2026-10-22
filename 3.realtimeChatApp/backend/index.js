    import express from "express";
    import dotenv from "dotenv";
    import connectDb from "./config/db.js";
    import authRouter from "./routes/auth.routes.js";
    import cookieParser from "cookie-parser";
    import cors from "cors";
    import userRouter from "./routes/user.routes.js";
    import messageRouter from "./routes/message.routes.js";
    import { app, server } from "./socket/socket.js";

    dotenv.config();

    const port = process.env.PORT || 5000;

    const allowedOrigins = (process.env.CLIENT_URL || "http://localhost:5173")
    .split(",")
    .map((origin) => origin.trim().replace(/\/$/, ""))
    .filter(Boolean);

    app.set("trust proxy", 1);

    // Middleware
    app.use(
    cors({
        origin: (origin, callback) => {
        if (!origin || allowedOrigins.includes(origin)) {
            return callback(null, true);
        }
        return callback(new Error("Not allowed by CORS"));
        },
        credentials: true,
    })
    );
    app.use(express.json());
    app.use(cookieParser());

    app.get("/", (req, res) => {
    res.json({ status: "ok", service: "realtime-chat-backend" });
    });

    // Routes
    app.use("/api/auth", authRouter);
    app.use("/api/user", userRouter);
    app.use("/api/message", messageRouter);

    // Start server after DB connects
    const startServer = async () => {
    try {
        await connectDb();
        server.listen(port, () => {
        console.log("MongoDB connected");
        console.log(`Server running on port ${port}`);
        });
    } catch (error) {
        console.error("Server start failed:", error.message);
    }
    };

    startServer();
