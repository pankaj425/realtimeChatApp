import http from "node:http";
import express from "express";
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

const userSocketMap = new Map();

export const getReceiverSocketIds = (receiver) => {
  return [...(userSocketMap.get(String(receiver)) || [])];
};

export const getReceiverSocketId = (receiver) => getReceiverSocketIds(receiver)[0];

const broadcastOnlineUsers = () => {
  io.emit("getOnlineUsers", [...userSocketMap.keys()]);
};

io.on("connection", (socket) => {
  const userId = socket.handshake.query.userId;

  if (userId) {
    const key = String(userId);
    if (!userSocketMap.has(key)) {
      userSocketMap.set(key, new Set());
    }
    userSocketMap.get(key).add(socket.id);
    broadcastOnlineUsers();
  }

  socket.on("disconnect", () => {
    if (!userId) return;

    const key = String(userId);
    const sockets = userSocketMap.get(key);
    if (!sockets) return;

    sockets.delete(socket.id);
    if (sockets.size === 0) {
      userSocketMap.delete(key);
    }
    broadcastOnlineUsers();
  });
});

export { app, server, io };
