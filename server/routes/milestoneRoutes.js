import express from "express";
import {
  getMilestones,
  updateMilestone,
  deleteMilestone,
  addMilestone,
} from "../controllers/milestoneController.js";
import { Protect } from "../middleware/authMiddleware.js";

const router = express.Router();

// Apply Protect middleware to secure routes
router.get("/milestones", Protect, getMilestones);
router.post("/addMilestone", Protect, addMilestone);
router.put("/milestones/:milestoneId", Protect, updateMilestone);
router.delete("/deleteMilestone/:milestoneId", Protect, deleteMilestone);

export default router;
