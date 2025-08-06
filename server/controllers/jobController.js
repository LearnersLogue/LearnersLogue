import Job from "../models/JobModel.js";
import nodemailer from "nodemailer";

// Create Job
async function createJob(req, res) {
  try {
    const user = req.user;

    if (user.role !== "school") {
      return res
        .status(403)
        .json({ message: "Only companies can create jobs." });
    }

    console.log(req.body);

    const job = await Job.create(req.body);

    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
    });

    await transporter.sendMail({
      from: `"Learners Logue" <${process.env.EMAIL_USER}>`,
      to: user.email,
      subject: `You Created A Job: ${req.body.title}`,
      html: `
        <h2>Your job has been created: ${req.body.title}</h2>`,
    });

    res.status(201).json({ message: "Job created", job });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Error creating job" });
  }
}

// Get All Jobs
async function getAllJobs(req, res) {
  try {
    const jobs = await Job.find().sort({ createdAt: -1 });
    res.json(jobs);
  } catch (err) {
    res.status(500).json({ message: "Failed to fetch jobs" });
  }
}

// Get Job by ID
async function getJobById(req, res) {
  try {
    const job = await Job.findById(req.params.id);
    if (!job) return res.status(404).json({ message: "Job not found" });
    res.json(job);
  } catch (err) {
    res.status(500).json({ message: "Error fetching job" });
  }
}

export { createJob, getAllJobs, getJobById };
