import express from "express";
import {
  registerUser,
  sendOtp,
  verifyOtp,
  loginUser,
  updateProfile,
  getProfile,
  followUser,
  unfollowUser,
  uploadProfilePic,
} from "../controllers/userController.js";

import upload from "../middleware/uploadMiddleware.js";
import { Protect } from "../middleware/authMiddleware.js";

const router = express.Router();

router.post("/register", registerUser);
router.post("/send-otp", sendOtp);
router.post("/verify-otp", verifyOtp);
router.post("/login", loginUser);
router.get("/profile/:id", getProfile);
router.put("/updateProfile/:id", updateProfile);

router.post("/follow/:id", Protect, followUser);
router.post("/unfollow/:id", Protect, unfollowUser);

// ✅ Upload profile pic route
router.post(
  "/uploadProfilePic",
  Protect,
  upload.single("profilePic"),
  /* (req, res, next) => {
    console.log("Route hit: /uploadProfilePic");
    console.log("Request file:", req.file);
    console.log("Request body:", req.body);
    next();
  },*/
  uploadProfilePic
);

export default router;
