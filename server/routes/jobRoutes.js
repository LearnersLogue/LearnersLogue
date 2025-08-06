// routes/jobRoutes.js

import express from "express";
import {
  createJob,
  getAllJobs,
  getJobById,
} from "../controllers/jobController.js";
import { Protect } from "../middleware/authMiddleware.js";

const router = express.Router();

router.post("/create", Protect, createJob); // POST /job
router.get("/getAllJobs", getAllJobs); // GET /job
router.get("/getJob/:id", getJobById); // GET /job/:id

export default router;
