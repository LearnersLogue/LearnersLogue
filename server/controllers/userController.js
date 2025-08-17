import User from "../models/userModel.js";
import otpGenerator from "otp-generator";
import nodemailer from "nodemailer";
import twilio from "twilio";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";

// Twilio setup

// In-memory OTP store (temp)
let otpStore = {};

// ✅ Register user
async function registerUser(req, res) {
  try {
    const {
      role,
      fullName,
      dob,
      email,
      phone,
      password,
      gender,
      school,
      city,
      state,
      profilePic,
    } = req.body;

    const existingUser = await User.findOne({ $or: [{ email }, { phone }] });
    if (existingUser) {
      return res.status(400).json({ message: "User already exists." });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const newUser = await User.create({
      role,
      fullName,
      dob,
      email: email.trim().toLowerCase(),
      phone,
      password: hashedPassword, // ⚠️ should hash before production
      gender,
      school,
      city,
      state,
      profilePic,
    });

    res.status(201).json({ message: "User created successfully", newUser });
  } catch (error) {
    console.error("Register User Error:", error);
    res.status(500).json({ message: "Something went wrong" });
  }
}

// ✅ Send OTP to email + phone
// ✅ Send OTP to email only (Twilio removed)
async function sendOtp(req, res) {
  const { email } = req.body;

  const otp = otpGenerator.generate(6, {
    digits: true,
    lowerCaseAlphabets: false, // Add this line
    upperCaseAlphabets: false, // Recommended to use this instead of upperCase
    specialChars: false,
  });

  otpStore[email] = {
    otp,
    expiresAt: Date.now() + 5 * 60 * 1000,
  };

  try {
    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
    });

    await transporter.sendMail({
      from: `"Learners Logue" <${process.env.EMAIL_USER}>`,
      to: email,
      subject: "Your OTP - Learners Logue",
      text: `Your OTP is: ${otp}. It will expire in 5 minutes.`,
    });

    console.log(`📧 OTP email sent to ${email}`);
    res.status(200).json({ message: "OTP sent to email" });
  } catch (err) {
    console.error("❌ Email send failed:", err);
    res.status(500).json({ message: "Failed to send OTP email" });
  }
}

// ✅ Verify OTP
async function verifyOtp(req, res) {
  const { email, otp } = req.body;

  const record = otpStore[email];
  if (!record) return res.status(400).json({ message: "OTP not found" });

  if (Date.now() > record.expiresAt) {
    delete otpStore[email];
    return res.status(400).json({ message: "OTP expired" });
  }

  if (otp !== record.otp) {
    return res.status(400).json({ message: "Invalid OTP" });
  }

  delete otpStore[email]; // one-time use
  res.status(200).json({ message: "OTP verified" });
}

async function loginUser(req, res) {
  console.log("login called");
  try {
    const { emailOrPhone, password } = req.body;

    // 🔍 Find user by email or phone
    const user = await User.findOne({
      $or: [
        { email: emailOrPhone.trim().toLowerCase() },
        { phone: emailOrPhone },
      ],
    });

    if (!user) {
      return res.status(400).json({ message: "User not found" });
    }

    // 🔐 Compare password with hashed one
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({ message: "Invalid credentials" });
    }

    // ✅ Optional: generate JWT token
    const token = jwt.sign(
      { id: user._id, email: user.email, role: user.role },
      process.env.JWT_SECRET || "your_jwt_secret_key", // add this to .env in production
      { expiresIn: "7d" }
    );

    res.status(200).json({
      message: "Login successful",
      user: {
        _id: user._id,
        fullName: user.fullName,
        email: user.email,
        phone: user.phone,
        dob: user.dob,
        gender: user.gender,
        role: user.role,
        school: user.school,
        city: user.city,
        state: user.state,
        profilePic: user.profilePic,
        pointsEarned: user.pointsEarned,
        followers: user.followers,
        following: user.following,
        milestones: user.milestones,
        createdAt: user.createdAt,
        updatedAt: user.updatedAt,
      },
      token, // send token to store in frontend if needed
    });
  } catch (err) {
    console.error("Login Error:", err);
    res.status(500).json({ message: "Something went wrong" });
  }
}

// ✅ Reset Password after OTP verification
async function resetPassword(req, res) {
  try {
    const { email, newPassword } = req.body;

    if (!email || !newPassword) {
      return res
        .status(400)
        .json({ message: "Email and new password required" });
    }

    // 🔍 Find user
    const user = await User.findOne({ email: email.trim().toLowerCase() });
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // 🔐 Hash new password
    const hashedPassword = await bcrypt.hash(newPassword, 10);

    user.password = hashedPassword;
    await user.save();

    res.status(200).json({ message: "Password reset successful" });
  } catch (err) {
    console.error("Reset Password Error:", err);
    res.status(500).json({ message: "Something went wrong" });
  }
}

// UPDATE profile for logged-in user
// GET /api/users/profile
async function getProfile(req, res) {
  try {
    const user = await User.findById(req.user.id)
      .select("-password -otp -otpExpiry")
      .populate("followers", "fullName profilePic")
      .populate("following", "fullName profilePic");

    if (!user) return res.status(404).json({ message: "User not found" });
    res.json(user);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
}

// PUT /api/users/profile
async function updateProfile(req, res) {
  console.log("update profile called");
  const userId = req.params.id; // ✅ This will work

  try {
    const updates = {
      fullName: req.body.fullName,
      dob: req.body.dob,
      gender: req.body.gender,
      school: req.body.school,
      city: req.body.city,
      state: req.body.state,
      profilePic: req.body.profilePic,
      role: req.body.role,
      phone: req.body.phone,
    };
    const user = await User.findByIdAndUpdate(userId, updates, {
      new: true,
    }).select("-password -otp -otpExpiry");
    res.json(user);
    console.log(user);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
}

// POST /api/users/:id/follow
async function followUser(req, res) {
  const currentUserId = req.user.id;
  const targetUserId = req.params.id;

  console.log("followUser initiated", currentUserId, targetUserId);

  if (currentUserId === targetUserId) {
    return res.status(400).json({ message: "You cannot follow yourself." });
  }

  try {
    const currentUser = await User.findById(currentUserId);
    const targetUser = await User.findById(targetUserId);

    if (!targetUser || !currentUser) {
      return res.status(404).json({ message: "User not found" });
    }

    console.log("current and target user", currentUser, targetUser);

    if (currentUser.following.includes(targetUserId)) {
      return res.status(400).json({ message: "Already following this user." });
    }

    currentUser.following.push(targetUserId);
    targetUser.followers.push(currentUserId);

    await currentUser.save();
    await targetUser.save();

    const user = await User.findById(req.user.id);

    return res.status(200).json({ message: "Followed", updatedUser: user });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
}

// POST /api/users/:id/unfollow
async function unfollowUser(req, res) {
  const currentUserId = req.user.id;
  const targetUserId = req.params.id;

  try {
    const currentUser = await User.findById(currentUserId);
    const targetUser = await User.findById(targetUserId);

    if (!targetUser || !currentUser) {
      return res.status(404).json({ message: "User not found" });
    }

    currentUser.following = currentUser.following.filter(
      (id) => id.toString() !== targetUserId
    );
    targetUser.followers = targetUser.followers.filter(
      (id) => id.toString() !== currentUserId
    );

    await currentUser.save();
    await targetUser.save();

    const user = await User.findById(req.user.id);

    return res.status(200).json({ message: "unfollowed", updatedUser: user });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
}

// POST /api/users/upload-profile-pic
// POST /api/users/upload-profile-pic
async function uploadProfilePic(req, res) {
  console.log("upload profile pic");

  try {
    const userId = req.user.id;

    if (!req.file || !req.file.location) {
      return res.status(400).json({ message: "No file uploaded" });
    }

    const profilePicUrl = req.file.location;

    const updatedUser = await User.findByIdAndUpdate(
      userId,
      { profilePic: profilePicUrl },
      { new: true }
    ).select("-password -otp -otpExpiry");

    res.status(200).json({
      message: "Profile picture updated",
      user: updatedUser,
    });
  } catch (error) {
    console.error("Upload Profile Pic Error:", error);
    res.status(500).json({ message: "Server error" });
  }
}

export {
  registerUser,
  sendOtp,
  verifyOtp,
  loginUser,
  getProfile,
  updateProfile,
  followUser,
  unfollowUser,
  uploadProfilePic,
  resetPassword,
};
