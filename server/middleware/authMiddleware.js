import jwt from "jsonwebtoken";
import User from "../models/userModel.js";

async function Protect(req, res, next) {
  let token;

  // Check for token in Authorization header
  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith("Bearer")
  ) {
    try {
      token = req.headers.authorization.split(" ")[1]; // Get the token

      // Verify token
      const decoded = jwt.verify(
        token,
        process.env.JWT_SECRET || "your_jwt_secret_key"
      );

      // Attach user to request (excluding password, otp)
      req.user = await User.findById(decoded.id).select(
        "-password -otp -otpExpiry"
      );

      if (!req.user) {
        return res.status(401).json({ message: "User not found" });
      }

      next(); // Proceed to controller
    } catch (err) {
      console.error("Token verification failed:", err);
      res.status(401).json({ message: "Not authorized, token failed" });
    }
  } else {
    res.status(401).json({ message: "Not authorized, no token" });
  }
}

export { Protect };
