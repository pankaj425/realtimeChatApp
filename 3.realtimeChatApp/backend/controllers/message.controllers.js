import uploadFile from "../config/cloudinary.js";
import Conversation from "../models/conversation.model.js";
import Message from "../models/message.model.js";
import {
  getReceiverSocketIds,
  io,
} from "../socket/socket.js";

export const sendMessage = async (req, res) => {
  try {
    const sender = req.userId;
    const receiver = req.params.receiver;
    const message = typeof req.body.message === "string" ? req.body.message.trim() : "";

    if (!receiver) {
      return res.status(400).json({ message: "receiver is required" });
    }

    if (String(receiver) === String(sender)) {
      return res.status(400).json({ message: "you cannot message yourself" });
    }

    if (!message && !req.file) {
      return res.status(400).json({ message: "message or image is required" });
    }

    let image = "";
    if (req.file) {
      image = await uploadFile(req.file.path);
    }

    const newMessage = await Message.create({
      sender,
      receiver,
      message,
      image,
    });

    let conversation = await Conversation.findOne({
      partcipants: { $all: [sender, receiver] },
    });

    if (!conversation) {
      conversation = await Conversation.create({
        partcipants: [sender, receiver],
        messages: [newMessage._id],
      });
    } else {
      conversation.messages.push(newMessage._id);
      await conversation.save();
    }

    const receiverSocketIds = getReceiverSocketIds(receiver);
    receiverSocketIds.forEach((socketId) => {
      io.to(socketId).emit("newMessage", newMessage);
    });

    return res.status(201).json(newMessage);
  } catch (error) {
    console.error("[send-message]", error.message);
    return res.status(500).json({ message: "could not send the message" });
  }
};

export const getMessages = async (req, res) => {
  try {
    const sender = req.userId;
    const receiver = req.params.receiver;

    const conversation = await Conversation.findOne({
      partcipants: { $all: [sender, receiver] },
    }).populate("messages");

    return res.status(200).json(conversation?.messages || []);
  } catch (error) {
    console.error("[get-messages]", error.message);
    return res.status(500).json({ message: "could not load messages" });
  }
};
