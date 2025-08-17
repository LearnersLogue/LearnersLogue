import User from "../models/userModel.js";

// 📥 Add Milestone
// 📥 Add Milestone with optional image
export const addMilestone = async (req, res) => {
  try {
    const userId = req.user._id;
    const { title, date, location, type, description, awardedBy, grade } =
      req.body;

    const user = await User.findById(userId);
    if (!user) return res.status(404).json({ message: "User not found" });

    const newMilestone = {
      title,
      date,
      location,
      type,
      description,
      awardedBy,
      grade,
      image: req.file?.location || null, // ✅ store image URL if uploaded
    };

    user.milestones.push(newMilestone);
    await user.save();

    res
      .status(201)
      .json({ message: "Milestone added", milestones: user.milestones });
  } catch (error) {
    res
      .status(500)
      .json({ message: "Failed to add milestone", error: error.message });
  }
};

// 📤 Get All Milestones
export const getMilestones = async (req, res) => {
  try {
    const userId = req.user._id;
    const user = await User.findById(userId).select("milestones");

    if (!user) return res.status(404).json({ message: "User not found" });

    res.status(200).json(user.milestones);
  } catch (error) {
    res
      .status(500)
      .json({ message: "Failed to get milestones", error: error.message });
  }
};

// ✏️ Update a Milestone
export const updateMilestone = async (req, res) => {
  try {
    const userId = req.user._id;
    const { milestoneId } = req.params;
    const updatedFields = req.body;

    const user = await User.findById(userId);
    if (!user) return res.status(404).json({ message: "User not found" });

    const milestone = user.milestones.id(milestoneId);
    if (!milestone)
      return res.status(404).json({ message: "Milestone not found" });

    // Update text fields
    Object.assign(milestone, updatedFields);

    // Handle image update if new image is uploaded
    if (req.file && req.file.location) {
      milestone.image = req.file.location;
    }

    await user.save();

    res.status(200).json({
      message: "Milestone updated",
      milestone,
      milestones: user.milestones,
    });
  } catch (error) {
    res
      .status(500)
      .json({ message: "Failed to update milestone", error: error.message });
  }
};

// 🗑️ Delete a Milestone
export const deleteMilestone = async (req, res) => {
  try {
    const userId = req.user._id;
    const { milestoneId } = req.params;

    const user = await User.findById(userId);
    if (!user) return res.status(404).json({ message: "User not found" });

    const milestone = user.milestones.id(milestoneId);
    if (!milestone)
      return res.status(404).json({ message: "Milestone not found" });

    user.milestones.pull(milestoneId); // ✅ this is the correct way
    await user.save();

    res
      .status(200)
      .json({ message: "Milestone deleted", milestones: user.milestones });
  } catch (error) {
    res
      .status(500)
      .json({ message: "Failed to delete milestone", error: error.message });
  }
};
