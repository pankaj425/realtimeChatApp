import express from "express";
import {
  login,
  logOut,
  refreshToken,
  signUp,
} from "../controllers/auth.controllers.js";
import isAuth from "../middlewares/isAuth.js";

const authRouter = express.Router();

authRouter.post("/signup", signUp);
authRouter.post("/login", login);
authRouter.get("/refresh", isAuth, refreshToken);
authRouter.get("/logout", logOut);
authRouter.post("/logout", logOut);

export default authRouter;
