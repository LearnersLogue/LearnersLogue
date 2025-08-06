import mongoose from "mongoose";

const eventSchema = new mongoose.Schema(
  {
    title: { type: String, required: true },
    type: {
      type: String,
      enum: ["webinar", "competitions", "live classes", "study groups"],
      required: true,
    },
    description: { type: String },
    date: { type: Date, required: true },
    time: { type: String },
    duration: { type: String },
    tags: [{ type: String }],
    price: { type: Number, default: 0 },
    videoCallStartLink: { type: String, required: true },
    videoCallLink: { type: String, required: true },
    maxParticipants: { type: Number },
    host: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
  },
  { timestamps: true }
);

const Event = mongoose.model("Event", eventSchema);

export default Event;
