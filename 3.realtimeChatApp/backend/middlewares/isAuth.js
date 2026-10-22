import jwt from "jsonwebtoken";
import env from "../config/env.js";

const isAuth = async (req, res, next) => {
  const header = req.headers.authorization || "";
  const bearerToken = header.startsWith("Bearer ") ? header.slice(7) : null;
  const token = bearerToken || req.cookies?.token;

  if (!token) {
    return res.status(401).json({ message: "please log in to continue" });
  }

  try {
    const payload = jwt.verify(token, env.jwtSecret);
    req.userId = payload.userId;
    return next();
  } catch {
    return res
      .status(401)
      .json({ message: "session expired, please log in again" });
  }
};

export default isAuth;
