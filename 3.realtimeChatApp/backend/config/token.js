import jwt from "jsonwebtoken";
import env from "./env.js";

const genToken = (userId) => {
  return jwt.sign({ userId }, env.jwtSecret, { expiresIn: "7d" });
};

export default genToken;
