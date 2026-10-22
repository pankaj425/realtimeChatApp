import bcrypt from "bcryptjs";
import genToken from "../config/token.js";
import User from "../models/user.model.js";
import env from "../config/env.js";

const cookieOptions = {
  httpOnly: true,
  maxAge: env.cookieMaxAge,
  sameSite: env.isProduction ? "none" : "lax",
  secure: env.isProduction,
  path: "/",
};

const text = (value) => (typeof value === "string" ? value.trim() : "");

export const signUp = async (req, res) => {
  try {
    const userName = text(req.body.userName);
    const email = text(req.body.email).toLowerCase();
    const password = typeof req.body.password === "string" ? req.body.password : "";

    if (!userName || !email || !password) {
      return res
        .status(400)
        .json({ message: "userName, email and password are required" });
    }

    if (userName.length < 3) {
      return res
        .status(400)
        .json({ message: "userName must be at least 3 characters" });
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return res.status(400).json({ message: "please enter a valid email" });
    }

    if (password.length < 6) {
      return res
        .status(400)
        .json({ message: "password must be at least 6 characters" });
    }

    const [userNameTaken, emailTaken] = await Promise.all([
      User.findOne({ userName }),
      User.findOne({ email }),
    ]);

    if (userNameTaken) {
      return res.status(400).json({ message: "userName already exists" });
    }

    if (emailTaken) {
      return res.status(400).json({ message: "email already exists" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const user = await User.create({ userName, email, password: hashedPassword });
    const token = genToken(user._id);

    res.cookie("token", token, cookieOptions);
    return res.status(201).json({ user, token });
  } catch (error) {
    console.error("[signup]", error.message);
    if (error.code === 11000) {
      return res
        .status(400)
        .json({ message: "userName or email already exists" });
    }
    return res.status(500).json({ message: "could not create the account" });
  }
};

export const login = async (req, res) => {
  try {
    const email = text(req.body.email).toLowerCase();
    const password = typeof req.body.password === "string" ? req.body.password : "";

    if (!email || !password) {
      return res.status(400).json({ message: "email and password are required" });
    }

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({ message: "user does not exist" });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ message: "incorrect password" });
    }

    const token = genToken(user._id);
    res.cookie("token", token, cookieOptions);
    return res.status(200).json({ user, token });
  } catch (error) {
    console.error("[login]", error.message);
    return res.status(500).json({ message: "could not log in" });
  }
};

export const refreshToken = async (req, res) => {
  try {
    const token = genToken(req.userId);
    res.cookie("token", token, cookieOptions);
    return res.status(200).json({ token });
  } catch (error) {
    console.error("[refresh-token]", error.message);
    return res.status(500).json({ message: "could not refresh the session" });
  }
};

export const logOut = async (req, res) => {
  try {
    res.clearCookie("token", { ...cookieOptions, maxAge: undefined });
    return res.status(200).json({ message: "logged out successfully" });
  } catch (error) {
    return res.status(500).json({ message: "could not log out" });
  }
};
