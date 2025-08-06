// models/jobModel.js

import mongoose from "mongoose";

const jobSchema = new mongoose.Schema(
  {
    title: { type: String, required: true },
    company: { type: String, required: true },
    type: {
      type: String,
      enum: ["internship", "full-time"],
      default: "internship",
    },
    description: { type: String, required: true },
    location: { type: String },
    duration: { type: String }, // for internships
    deadline: { type: String },
    applicants: { type: String },
    stipend: { type: String },
    requirements: [String],
    tags: [String],
  },
  { timestamps: true }
);

const Job = mongoose.model("Job", jobSchema);

export default Job;
