import http from "node:http";
import express from "express";
import jwt from "jsonwebtoken";
import { Server } from "socket.io";
import env from "../config/env.js";

const app = express();
const server = http.createServer(app);

const allowedOrigins = [...new Set([...env.clientUrls, env.serverUrl])];

const io = new Server(server, {
  cors: {
    origin: allowedOrigins,
    credentials: true,
  },
});

io.use((socket, next) => {
  const token = socket.handshake.auth?.token;

  if (!token) {
    return next(new Error("Authentication required"));
  }

  try {
    const payload = jwt.verify(token, env.jwtSecret);
    socket.userId = String(payload.userId);
    return next();
  } catch {
    return next(new Error("Invalid or expired session"));
  }
});

const userSocketMap = new Map();

export const getReceiverSocketIds = (receiver) => {
  return [...(userSocketMap.get(String(receiver)) || [])];
};

export const getReceiverSocketId = (receiver) => getReceiverSocketIds(receiver)[0];

const broadcastOnlineUsers = () => {
  io.emit("getOnlineUsers", [...userSocketMap.keys()]);
};

io.on("connection", (socket) => {
  const userId = socket.userId;

  if (!userSocketMap.has(userId)) {
    userSocketMap.set(userId, new Set());
  }
  userSocketMap.get(userId).add(socket.id);
  broadcastOnlineUsers();

  socket.on("disconnect", () => {
    const sockets = userSocketMap.get(userId);
    if (!sockets) return;

    sockets.delete(socket.id);
    if (sockets.size === 0) {
      userSocketMap.delete(userId);
    }
    broadcastOnlineUsers();
  });
});

export { app, server, io };
