import * as  authController from "../controller/auth.controller.js";
import express from "express";

let authRouter = express.Router();
authRouter.post("/register", authController.registerUser);
authRouter.get("/login", authController.login);
authRouter.get("/getme", authController.getme);
authRouter.post("/refresh-token", authController.refreshToken);
authRouter.post("/logout", authController.logout);
authRouter.post("/logout-all", authController.logoutAll);
authRouter.post("/verify-email", authController.verifyEmail);

export default authRouter;
