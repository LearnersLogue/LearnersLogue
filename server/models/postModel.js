import mongoose from "mongoose";

const commentSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  text: { type: String, required: true },
  createdAt: { type: Date, default: Date.now },
});

const answerSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  text: { type: String, required: true },
  createdAt: { type: Date, default: Date.now },
});

const pollOptionSchema = new mongoose.Schema({
  option: { type: String, required: true },
  votes: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
});

const postSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },

    // 🔹 Post Types
    type: {
      type: String,
      enum: ["question", "idea", "poll", "homework help", "normal"],
      default: "normal",
    },

    title: { type: String, required: true },
    description: { type: String },

    // 🔹 Tags for search/filter
    tags: [{ type: String }],

    // 🔹 Poll-specific
    pollOptions: [pollOptionSchema],
    pollExpiresAt: { type: Date },

    // 🔹 User interactions
    likes: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
    comments: [commentSchema],
    answers: [answerSchema], // Only for questions

    visibility: {
      type: String,
      enum: ["public", "private"],
      default: "public",
    },
  },
  { timestamps: true }
);

export default mongoose.model("Post", postSchema);
