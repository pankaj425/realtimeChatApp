import bcrypt from "bcryptjs";
import mongoose from "mongoose";
import connectDb from "../config/db.js";
import User from "../models/user.model.js";
import Message from "../models/message.model.js";
import Conversation from "../models/conversation.model.js";

const password = "password123";

const demoUsers = [
  { name: "Alice Sharma", userName: "alice", email: "alice@example.com" },
  { name: "Bob Verma", userName: "bob", email: "bob@example.com" },
  { name: "Charlie Khan", userName: "charlie", email: "charlie@example.com" },
];

const run = async () => {
  await connectDb();

  const hashedPassword = await bcrypt.hash(password, 10);
  const savedUsers = {};

  for (const demo of demoUsers) {
    const user = await User.findOneAndUpdate(
      { $or: [{ email: demo.email }, { userName: demo.userName }] },
      {
        $set: {
          name: demo.name,
          userName: demo.userName,
          email: demo.email,
          password: hashedPassword,
        },
      },
      { upsert: true, new: true, setDefaultsOnInsert: true }
    );
    savedUsers[demo.userName] = user;
  }

  const alice = savedUsers.alice;
  const bob = savedUsers.bob;

  const existingConversation = await Conversation.findOne({
    partcipants: { $all: [alice._id, bob._id] },
  });

  if (!existingConversation) {
    const welcomeMessages = [
      { sender: alice._id, receiver: bob._id, message: "Hey Bob! Welcome to Chatly." },
      { sender: bob._id, receiver: alice._id, message: "Hi Alice! This is realtime messaging." },
      { sender: alice._id, receiver: bob._id, message: "Try the emoji picker and image upload." },
    ];

    const created = [];
    for (const item of welcomeMessages) {
      created.push(await Message.create(item));
    }

    await Conversation.create({
      partcipants: [alice._id, bob._id],
      messages: created.map((message) => message._id),
    });
  }

  console.log("Demo data is ready.\n");
  for (const demo of demoUsers) {
    console.log(`  ${demo.email.padEnd(20)} ${password}`);
  }
  console.log("\nStart the app with: npm run dev");

  await mongoose.connection.close();
};

run().catch(async (error) => {
  console.error("Seeding failed:", error.message);
  await mongoose.connection.close();
  process.exit(1);
});
