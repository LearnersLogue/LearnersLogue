import express from "express";
import {
  createPost,
  deletePost,
  getAllPosts,
  toggleLikePost,
  addComment,
  getComments,
  voteOnPoll,
  getMyPost,
} from "../controllers/postController.js";
import { Protect } from "../middleware/authMiddleware.js";

const router = express.Router();

router.post("/create", Protect, createPost);
router.get("/all", getAllPosts);
router.delete("/:postId/delete", Protect, deletePost);
router.put("/:postId/like", Protect, toggleLikePost);
router.post("/:postId/comments", Protect, addComment);
router.get("/:postId/getComments", Protect, getComments);
router.get("/myPosts", Protect, getMyPost);
// routes/postRoutes.js
router.put("/poll/vote", Protect, voteOnPoll);

export default router;
