import mongoose from "mongoose";

const milestoneSchema = new mongoose.Schema({
  title: { type: String, required: true },
  date: { type: Date, required: true },
  location: { type: String },
  type: { type: String }, // e.g., 'Award', 'Certificate'
  description: { type: String },
  awardedBy: { type: String },
  grade: { type: String },
  image: { type: String },
});

const userSchema = new mongoose.Schema(
  {
    role: {
      type: String,
      enum: ["student", "teacher", "school"],
      required: true,
    },
    fullName: { type: String },
    dob: { type: Date },
    email: { type: String },
    phone: { type: String },
    password: { type: String },
    gender: { type: String },
    school: { type: String },
    city: { type: String },
    state: { type: String },
    profilePic: { type: String },

    // 🔽 New fields for profile screen
    pointsEarned: { type: Number, default: 0 },
    milestones: [milestoneSchema],
    following: [
      { type: mongoose.Schema.Types.ObjectId, ref: "User", default: [] },
    ],
    followers: [
      { type: mongoose.Schema.Types.ObjectId, ref: "User", default: [] },
    ],

    otp: { type: String },
    otpExpiry: { type: Date },
  },
  { timestamps: true } // ⬅️ corrected key: should be `timestamps`, not `timestamp`
);

const User = mongoose.model("User", userSchema);

export default User;
