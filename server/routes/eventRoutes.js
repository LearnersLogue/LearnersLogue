import express from "express";
import {
  createEvent,
  deleteEvent,
  getAllEvents,
  getMyHostedEvents,
  registerForEvent,
  unregisterFromEvent,
} from "../controllers/eventController.js";

import { Protect } from "../middleware/authMiddleware.js";

const router = express.Router();

router.post("/create", Protect, createEvent);
router.get("/getEvents", Protect, getAllEvents);
router.get("/myEvents", Protect, getMyHostedEvents);
router.post("/register/:id", Protect, registerForEvent);
router.delete("/delete/:id", Protect, deleteEvent);

router.delete("/unregister/:id", Protect, unregisterFromEvent);

export default router;
