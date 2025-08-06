import Post from "../models/postModel.js";

export const createPost = async (req, res) => {
  try {
    const { title, description, tags, type, pollOptions, pollExpiresAt } =
      req.body;

    console.log("create post called", req.body);

    // Handle poll validation
    if (type === "poll") {
      if (!pollOptions || pollOptions.length < 3) {
        return res
          .status(400)
          .json({ message: "Poll must have at least 3 options." });
      }
    }

    const allowedTypes = [
      "question",
      "idea",
      "poll",
      "homework help",
      "post",
      "normal",
    ];
    if (!allowedTypes.includes(type)) {
      return res.status(400).json({ message: "Invalid post type." });
    }

    const post = await Post.create({
      user: req.user._id,
      title,
      description,
      tags,
      type,
      pollOptions,
      pollExpiresAt,
    });

    res.status(201).json({ success: true, post });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const getAllPosts = async (req, res) => {
  try {
    const posts = await Post.find()
      .populate("user", "fullName profilePic school") // only public info
      .sort({ createdAt: -1 });
    console.log(posts.length);

    res.status(200).json({ success: true, posts });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const deletePost = async (req, res) => {
  console.log("delete post triggered", req.params.postId);

  try {
    const postId = req.params.postId;
    const userId = req.user._id; // coming from auth middleware

    const post = await Post.findById(postId);

    if (!post) {
      return res
        .status(404)
        .json({ success: false, message: "Post not found" });
    }

    if (post.user.toString() !== userId.toString()) {
      return res.status(403).json({
        success: false,
        message: "Not authorized to delete this post",
      });
    }

    await post.deleteOne();

    res
      .status(200)
      .json({ success: true, message: "Post deleted successfully" });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// controllers/postController.js

export const toggleLikePost = async (req, res) => {
  try {
    const postId = req.params.postId;
    const userId = req.user._id;

    console.log("toggle like called", userId);

    const post = await Post.findById(postId);
    if (!post) return res.status(404).json({ message: "Post not found" });

    const index = post.likes.indexOf(userId);

    if (index === -1) {
      post.likes.push(userId);
    } else {
      post.likes.splice(index, 1);
    }

    await post.save();
    res.status(200).json({ success: true, likes: post.likes });
    console.log("Updated likes:", post.likes);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const addComment = async (req, res) => {
  const { postId } = req.params;
  const { text } = req.body;
  const userId = req.user.id;

  if (!text) {
    return res.status(400).json({ error: "Comment text is required" });
  }

  try {
    const post = await Post.findById(postId);
    if (!post) {
      return res.status(404).json({ error: "post not found" });
    }

    const newComment = {
      user: userId,
      text,
    };

    post.comments.push(newComment);
    await post.save();

    const updatedPost = await Post.findById(post).populate(
      "comments.user",
      "fullName email"
    );

    res.status(200).json({
      message: "Comment added successfully",
      comments: updatedPost.comments,
    });
  } catch (error) {
    console.error("Error adding comment: ", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

export const getComments = async (req, res) => {
  const { postId } = req.params;

  try {
    const post = await Post.findById(postId).populate(
      "comments.user",
      "fullName email"
    );

    if (!post) {
      return res.status(404).json({ error: "Post Not Found" });
    }

    res.status(200).json({
      success: true,
      comments: post.comments,
    });
  } catch (error) {
    console.error(`Error fetching comments for post ${postId}: `, error);
    res.status(500).json({ error: "Internal server error" });
  }
};

// controllers/postController.js
export const voteOnPoll = async (req, res) => {
  try {
    const { postId, optionIndex } = req.body;
    const userId = req.user._id.toString(); // always treat as string

    console.log(`voteOnPoll triggered ${postId}, ${optionIndex}`);

    // 1️⃣ Fetch the poll
    const post = await Post.findById(postId);
    if (!post || post.type !== "poll") {
      return res.status(404).json({ message: "Poll post not found" });
    }

    // 2️⃣ Guard clauses
    if (post.pollExpiresAt && Date.now() > post.pollExpiresAt) {
      return res.status(400).json({ message: "Poll has expired" });
    }
    if (optionIndex < 0 || optionIndex >= post.pollOptions.length) {
      return res.status(400).json({ message: "Invalid option index" });
    }
    const alreadyVoted = post.pollOptions.some((opt) =>
      opt.votes.map(String).includes(userId)
    );
    if (alreadyVoted) {
      return res.status(400).json({ message: "User already voted" });
    }

    // 3️⃣ Record the vote (store as string)
    post.pollOptions[optionIndex].votes.push(userId);
    await post.save();

    // 4️⃣ Re‑fetch & convert to plain object
    const updatedPost = await Post.findById(postId).populate([
      { path: "user", select: "fullName image school" },
      { path: "pollOptions.votes", select: "_id" }, // Optional: to ensure votes are user references
    ]);

    // 5️⃣ 🔑 Convert every ObjectId in votes → string for frontend
    updatedPost.pollOptions.forEach((opt) => {
      opt.votes = opt.votes.map((v) => v.toString());
    });

    // 6️⃣ Optional aggregated result (if your UI needs it)
    const pollResult = updatedPost.pollOptions.map((opt) => ({
      option: opt.option,
      voteCount: opt.votes.length,
    }));

    return res.status(200).json({
      success: true,
      post: updatedPost,
      pollResult,
    });
  } catch (error) {
    console.error("voteOnPoll error:", error);
    return res.status(500).json({ message: error.message });
  }
};

export const getMyPost = async (req, res) => {
  console.log("get my post triggered");

  try {
    const userId = req.user._id; // assuming authentication middleware sets req.user
    const posts = await Post.find({ user: userId })
      .populate("user", "fullName profilePic school")
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: posts.length,
      posts,
    });
  } catch (error) {
    console.error("Error fetching user posts:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch posts.",
    });
  }
};
