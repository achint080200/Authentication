import bcrypt from "bcrypt";

import { User } from "../models/user.models.js";
import { Session } from "../models/session.models.js";
import jwt from "jsonwebtoken";
import { env } from "../config/env.js";
import crypto from "crypto";
import Otp from "../models/otp.models.js";
import { generateOtp, generateHtmlOtp } from "../utils/email.util.js";
import { sendEmail } from "../services/email.service.js";

export const registerUser = async (req, res) => {
  try {
    const { userName, emailId, password } = req.body;
    console.log(userName, emailId, password);
    const hashedPassword = await crypto
      .createHash("sha256")
      .update(password)
      .digest("hex");

    const newUser = new User({
      userName: userName,
      emailId,
      password: hashedPassword,
    });
    await newUser.save();
    let otp = generateOtp();
    let hashOtp = await crypto.createHash("sha256").update(otp).digest("hex");
    const newOtp = new Otp({
      email: emailId,
      userId: newUser._id,
      otpHash: hashOtp,
    });
    await newOtp.save();
    const htmlContent = generateHtmlOtp(otp);
    await sendEmail(
      emailId,
      "Your OTP Code for Registration",
      htmlContent,
    );

    
    res
      .status(201)
      .json({ message: "User registered successfully", verified: newUser.verified });
  } catch (err) {
    res.status(500).send("Internal Server Error");
  }
};
export const getme = async (req, res) => {
  try {
    if (!req.headers?.authorization) {
      return res.status(401).json({ message: "Unauthorized" });
    }
    const authToken = req.headers?.authorization.split(" ")[1];
    const decodedToken = jwt.verify(authToken, env.JWT_SECRET);
    console.log(decodedToken);
    const user = await User.findById(decodedToken.userId);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }
    res.status(200).json({ userName: user.userName, emailId: user.emailId });
  } catch (err) {
    res.status(500).send("Internal Server Error");
  }
};
export const refreshToken = async (req, res) => {
  try {
    const refreshToken = req.cookies.refreshToken;
    if (!refreshToken) {
      return res.status(401).json({ message: "Unauthorized" });
    }
    const refreshTokenHash = crypto
      .createHash("sha256")
      .update(refreshToken)
      .digest("hex");
    const existedSession = await Session.findOne({
      refreshTokenHash: refreshTokenHash,
      revoked: false,
    });
    if (!existedSession) {
      return res.status(404).json({ message: "you logged out" });
    }
    const decodedToken = jwt.verify(refreshToken, env.JWT_SECRET);
    const user = await User.findById(decodedToken.userId);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }
    let accessToken = jwt.sign(
      {
        userId: user._id,
        emailId: user.emailId,
      },
      env.JWT_SECRET,
      { expiresIn: "1h" },
    );
    res.status(200).json({ accessToken });
  } catch (err) {
    res.status(500).send("Internal Server Error");
  }
};
export const logout = async (req, res) => {
  try {
    const refreshToken = req.cookies.refreshToken;
    if (!refreshToken) {
      return res.status(401).json({
        message: "Refresh token missing",
      });
    }
    const refreshTokenHash = crypto
      .createHash("sha256")
      .update(refreshToken)
      .digest("hex");

    const existedSession = await Session.findOne({
      refreshTokenHash: refreshTokenHash,
      revoked: false,
    });

    if (!existedSession) {
      return res.status(404).json({
        message: "Token is not valid.",
      });
    }
    existedSession.revoked = true;
    res.clearCookie("refreshToken", {
      httpOnly: true,
      secure: true,
      sameSite: "strict",
    });
    await existedSession.save();
    return res.status(200).json({
      message: "Logout successfully.",
    });
  } catch (err) {
    return res.status(500).send("Internal Server Error");
  }
};
export const login = async (req, res) => {
  try{

    const { emailId, password } = req.body;
    const hashPassword = crypto
      .createHash("sha256")
      .update(password)
      .digest("hex");
    const existingUser = await User.findOne({
      emailId: emailId,
      password: hashPassword,
    });
    if (!existingUser) {
      res.status(404).json({ message: "User is not exist" });
    }
    if(!existingUser.verified){
      res.status(403).json({ message: "Please verify your email before logging in." });
    }
    let accessToken = jwt.sign(
      {
        emailId: emailId,
        userId: existingUser._id,
      },
      env.JWT_SECRET,
      { expiresIn: "15m" },
    );
    let refreshToken = jwt.sign(
      {
        emailId: emailId,
        userId: existingUser._id,
      },
      env.JWT_SECRET,
      { expiresIn: "1d" },
    );
    let refreshTokenHash = crypto
      .createHash("sha256")
      .update(refreshToken)
      .digest("hex");
      
    let session = await Session.create({
      userId: existingUser._id,
      refreshTokenHash,
      ip: req.ip,
      userAgent: req.headers["user-agent"],
      revoked: false,
    });
  
    res.cookie("refreshToken", refreshToken, {
      httpOnly: true,
      secure: true,
      sameSite: "strict",
    });
    return res
      .status(200)
      .json({
        message: "User is exist",
        accessToken: accessToken,
        user: existingUser,
      });
  }catch(error){
    return res.status(500).json({message : error})
  }
};
export const logoutAll = async (req, res) => {
  try {
    const refreshToken = req.cookies.refreshToken;
    if (!refreshToken) {
      return res.status(401).json({
        message: "Refresh token missing",
      });
    }
    const refreshTokenHash = crypto
      .createHash("sha256")
      .update(refreshToken)
      .digest("hex");

    const existedSession = await Session.findOne({
      refreshTokenHash: refreshTokenHash,
      revoked: false,
    });

    if (!existedSession) {
      return res.status(404).json({
        message: "Token is not valid.",
      });
    }
    await Session.updateMany(
      { userId: existedSession.userId },
      { revoked: true },
    );
    res.clearCookie("refreshToken", {
      httpOnly: true,
      secure: true,
      sameSite: "strict",
    });
    return res.status(200).json({
      message: "Logout from all devices successfully.",
    });
  } catch (err) {
    return res.status(500).send("Internal Server Error");
  }
};
export const verifyEmail = async (req, res) => {  
  try {
    const { emailId, otp } = req.body;
    if (!emailId || !otp) {
      return res.status(400).json({ message: "Email and OTP are required" });
    }
    const otpHash = crypto.createHash("sha256").update(otp).digest("hex");
    const existingOtp = await Otp.findOne({ email: emailId, otpHash });
    if (!existingOtp) {
      return res.status(400).json({ message: "Invalid OTP" });
    }
    const user = await User.findById(existingOtp.userId);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }
    user.verified = true;
    await user.save();
    await Otp.deleteMany({ email: emailId });
    res.status(200).json({ message: "Email verified successfully" });
  } catch (err) {
    console.error(err);
    res.status(500).send("Internal Server Error");
  }
}