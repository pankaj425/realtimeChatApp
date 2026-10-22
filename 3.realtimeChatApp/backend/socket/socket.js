import http from "http"
import express from "express"
import dotenv from "dotenv"
import { Server } from "socket.io"

dotenv.config()

let app = express()

const allowedOrigins = (process.env.CLIENT_URL || "http://localhost:5173")
    .split(",")
    .map((origin) => origin.trim().replace(/\/$/, ""))
    .filter(Boolean)

const server=http.createServer(app)
const io=new Server(server,{
    cors:{
        origin: allowedOrigins,
        credentials: true
    }
})
 const userSocketMap ={}
 export const getReceiverSocketId=(receiver)=>{
    return userSocketMap[receiver]
 }
io.on("connection",(socket)=>{
  const userId=socket.handshake.query.userId
  if(userId!=undefined){
    userSocketMap[userId]=socket.id
  }
  io.emit("getOnlineUsers",Object.keys(userSocketMap))

socket.on("disconnect",()=>{
  delete userSocketMap[userId]  
 io.emit("getOnlineUsers",Object.keys(userSocketMap))

})
   
})



export {app,server,io}