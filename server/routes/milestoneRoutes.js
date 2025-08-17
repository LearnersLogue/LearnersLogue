import express from "express";
import {
  getMilestones,
  updateMilestone,
  deleteMilestone,
  addMilestone,
} from "../controllers/milestoneController.js";
//import { generateMilestoneFromAI } from "../controllers/ai/milestone.js";
import multer from "multer";
import milestoneUpload from "../middleware/milestoneUploadMilestone.js";

import { Protect } from "../middleware/authMiddleware.js";

const router = express.Router();

const aiUpload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB limit
  },
  fileFilter: (req, file, cb) => {
    if (
      file.mimetype === "image/png" ||
      file.mimetype === "image/jpg" ||
      file.mimetype === "image/jpeg"
    ) {
      cb(null, true);
    } else {
      cb(new Error("Only .png, .jpg and .jpeg format allowed!"), false);
    }
  },
});

/* router.post(
  "/generateAiMilestone",
  Protect,
  aiUpload.single("image"),
  generateMilestoneFromAI
); */

// Apply Protect middleware to secure routes
router.get("/milestones", Protect, getMilestones);
router.post(
  "/addMilestone",
  Protect,
  milestoneUpload.single("image"),
  addMilestone
);

router.put(
  "/milestones/:milestoneId",
  Protect,
  milestoneUpload.single("image"), // ✅ Added image upload middleware
  updateMilestone
);
router.delete("/deleteMilestone/:milestoneId", Protect, deleteMilestone);

export default router;
