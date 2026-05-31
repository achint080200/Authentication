import * as  authController from "../controller/auth.controller.js";
import express from "express";

let authRouter = express.Router();
authRouter.post("/register", authController.registerUser);
authRouter.get("/getme", authController.getme);
authRouter.post("/refresh-token", authController.refreshToken);

export default authRouter;
