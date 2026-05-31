import bcrypt from "bcrypt";
import { User } from "../models/user.models.js";
import jwt from "jsonwebtoken";
import { env } from "../config/env.js";

export const registerUser = async (req, res) => {
  try {
    const { userName, emailId, password } = req.body;
    console.log(userName, emailId, password);
    const hashedPassword = await bcrypt.hash(password, 10);

    const newUser = new User({
      userName: userName,
      emailId,
      password: hashedPassword,
    });
    await newUser.save();
    let accessToken = jwt.sign(
      {
        userId: newUser._id,
        emailId: newUser.emailId,
      },
      env.JWT_SECRET,
      { expiresIn: "1h" },
    );
    let refreshToken = jwt.sign(
      {
        userId: newUser._id,
        emailId: newUser.emailId,
      },
      env.JWT_SECRET,
      { expiresIn: "15d" },
    );
    res.cookie("refreshToken", refreshToken, {
      httpOnly: true,
      secure: true,
      sameSite: "strict",
    });

    res
      .status(201)
      .json({ message: "User registered successfully", accessToken });
  } catch (err) {
    res.status(500).send("Internal Server Error");
  }
};
export const getme = async (req, res) => {
  try {
    if(!req.headers?.authorization){
      return res.status(401).json({ message: "Unauthorized" });
    }
    const authToken = req.headers?.authorization.split(" ")[1];
    const decodedToken = jwt.verify(authToken, env.JWT_SECRET);
    const user = await User.findById(decodedToken.userId);
    if(!user){
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
  }}
  
