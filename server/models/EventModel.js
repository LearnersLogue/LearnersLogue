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
    // NEW: Track registrations
    registrations: [
      {
        user: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "User",
          required: true,
        },
        registeredAt: {
          type: Date,
          default: Date.now,
        },
      },
    ],
  },
  { timestamps: true }
);

// Virtual field to get registration count
eventSchema.virtual("registrationCount").get(function () {
  return this.registrations.length;
});

// Method to check if user is registered
eventSchema.methods.isUserRegistered = function (userId) {
  return this.registrations.some(
    (reg) => reg.user.toString() === userId.toString()
  );
};

const Event = mongoose.model("Event", eventSchema);

export default Event;
