import Event from "../models/EventModel.js";
import User from "../models/userModel.js";
import { createZoomMeeting } from "../utils/zoom.js";
import nodemailer from "nodemailer";

async function createEvent(req, res) {
  console.log("create event function called");

  try {
    const user = req.user;

    if (user.role !== "school") {
      return res.status(403).json({ message: "Only schools can host events." });
    }

    const { title, date, time, duration } = req.body;

    // Combine date + time into a proper ISO timestamp
    const start_time = new Date(`${date}T${time}:00`);

    // Call Zoom API
    const zoomMeeting = await createZoomMeeting({
      topic: title,
      start_time,
      duration: parseInt(duration || 60), // fallback to 60 mins
    });

    const { join_url, start_url } = zoomMeeting;

    const newEvent = new Event({
      ...req.body,
      host: user._id,
      videoCallStartLink: start_url,
      videoCallLink: join_url,
    });

    await newEvent.save();

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
      subject: `Your Zoom Event Created: ${title}`,
      html: `
    <h2>Your event has been created: ${title}</h2>
    <p><strong>Date:</strong> ${date} at ${time}</p>
    <p><strong>Start Meeting Link (for you):</strong> <a href="${start_url}">${start_url}</a></p>
    <br/>
    <p>Please do not share this link with attendees.</p>
  `,
    });

    res.status(201).json({
      message: "Event created successfully",
      event: newEvent,
    });
  } catch (error) {
    console.error("❌ Error creating Zoom meeting:", error);
    res.status(500).json({
      message: "Error creating event",
      error: error.message,
    });
  }
}
async function getAllEvents(req, res) {
  console.log("get all events triggered");

  try {
    const events = await Event.find().populate("host", "fullName email");
    res.status(200).json(events);
  } catch (error) {
    res
      .status(500)
      .json({ message: "Error fetching events", error: error.message });
  }
}

async function getMyHostedEvents(req, res) {
  console.log("getMyHostedEvents triggered");

  try {
    const user = req.user;

    if (user.role !== "school") {
      return res
        .status(403)
        .json({ message: "Only schools have hosted events" });
    }

    const events = await Event.find({ host: user._id });
    res.status(200).json(events);
  } catch (error) {
    res.status(500).json({
      message: "Error fetching your events",
      error: error.message,
    });
  }
}

async function deleteEvent(req, res) {
  console.log("deleteEvent got triggered", req.user, req.params.id);

  try {
    const user = req.user;
    const eventId = req.params.id;

    if (user.role !== "school") {
      return res
        .status(403)
        .json({ message: "Only schools have hosted events." });
    }

    const deleteEvent = await Event.findByIdAndDelete(eventId);

    res
      .status(200)
      .json({ message: "Event deleted successfully", deleteEvent });
  } catch (error) {
    res.status(500).json({
      message: "Error deleting your event",
      error: error.message,
    });
  }
}

async function registerForEvent(req, res) {
  try {
    const user = req.user;
    const eventId = req.params.id;

    const event = await Event.findById(eventId);
    if (!event) return res.status(404).json({ message: "Event not found." });

    const email = user.email;
    if (!email)
      return res.status(400).json({ message: "User email not found." });

    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
    });

    await transporter.sendMail({
      from: `"Learners Logue" <${process.env.EMAIL_USER}>`,
      to: email,
      subject: `Meeting Link: ${event.title}`,
      html: `
        <h2>You have successfully registered for: ${event.title}</h2>
        <p><strong>When:</strong> ${event.date} at ${event.time}</p>
        <p><strong>Link:</strong> <a href="${event.videoCallLink}">${event.videoCallLink}</a></p>
        <br/>
        <p>See you there!</p>
      `,
    });

    console.log(`✅ Sent meeting link to ${email}`);
    return res
      .status(200)
      .json({ message: "Meeting link sent to your email." });
  } catch (error) {
    console.error("❌ Error in registerForEvent:", error);
    return res
      .status(500)
      .json({ message: "Failed to register for event", error: error.message });
  }
}

export {
  createEvent,
  getAllEvents,
  getMyHostedEvents,
  deleteEvent,
  registerForEvent,
};
