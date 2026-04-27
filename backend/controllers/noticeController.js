const Notice = require("../models/Notice");

// --- FOR TEACHERS/PARENTS ---
exports.getActiveNotices = async (req, res) => {
  try {
    const notices = await Notice.find({
      school: req.user.school,
      audience: { $in: [req.user.role.toLowerCase(), 'all'] } 
    }).sort({ createdAt: -1 }); // Sorted by newest first

    res.json(notices);
  } catch (error) {
    res.status(500).json({ message: "Error fetching notices" });
  }
};

// Post a new notice (Works for both Admin and Teacher)
exports.createNotice = async (req, res) => {
  try {
    const { title, content, audience } = req.body;
    
    // We fetch the name of the sender from the request user (attached by protect middleware)
    const senderName = req.user.name; 
    const senderRole = req.user.role; // e.g., 'Admin' or 'Teacher'

    const notice = await Notice.create({
      title,
      content,
      audience,
      school: req.user.school,
      postedBy: req.user._id,
      authorName: senderName, // Added to track who posted it
      authorRole: senderRole  // Added to track role
    });

    res.status(201).json(notice);
  } catch (error) {
    res.status(500).json({ message: "Failed to create notice", error: error.message });
  }
};

// Get all notices for Admin (History)
exports.getAllNoticesAdmin = async (req, res) => {
  try {
    const notices = await Notice.find({ school: req.user.school }).sort({ createdAt: -1 });
    res.json(notices);
  } catch (error) {
    res.status(500).json({ message: "Error fetching notices" });
  }
};

// Update
exports.updateNotice = async (req, res) => {
  try {
    const updated = await Notice.findByIdAndUpdate(req.params.id, req.body, { new: true });
    res.json(updated);
  } catch (error) {
    res.status(500).json({ message: "Update failed" });
  }
};

// Delete
exports.deleteNotice = async (req, res) => {
  try {
    await Notice.findByIdAndDelete(req.params.id);
    res.json({ message: "Deleted" });
  } catch (error) {
    res.status(500).json({ message: "Delete failed" });
  }
};