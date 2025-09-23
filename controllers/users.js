const { validationResult } = require("express-validator");

const User = require("../models/User");
const Message = require("../models/Message");

const asyncHandler = (fn) => (req, res, next) => {
  Promise.resolve(fn(req, res, next)).catch(next);
};

exports.postAssignName = asyncHandler(async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res
      .status(422)
      .json({ message: "Validation failed", errors: errors.array() });
  }

  const { userName, userId } = req.body;

  try {
    const existing = await User.findOneAndUpdate(
      { userId },
      { userName },
      { upsert: true, new: true, setDefaultsOnInsert: true }
    );

    res.status(200).json({ success: true, user: existing });
  } catch (err) {
    console.error("Error assigning userName:", err);
    res.status(500).json({ error: "Internal server error" });
  }
});

exports.getUsers = asyncHandler(async (req, res) => {
  try {
    const users = await User.find()
      .sort({ userName: 1 })
      .select({ userName: 1, userId: 1, _id: 0 }); // optional: sort alphabetically
    res.status(200).json(users);
  } catch (err) {
    console.error("Failed to fetch users:", err);
    res.status(500).json({ error: "Internal server error" });
  }
});

exports.deleteUser = asyncHandler(async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res
      .status(422)
      .json({ message: "Validation failed", errors: errors.array() });
  }

  try {
    const { userId } = req.params;

    // Delete all messages for this userId
    const messageDelete = await Message.deleteMany({ userId });

    // Delete the user if they exist (saved in User collection)
    const userDelete = await User.deleteOne({ userId });

    if (messageDelete.acknowledged && userDelete.acknowledged) {
      res.status(200).json({ success: true });
    }
  } catch (err) {
    console.error("Error deleting user:", err);
    res.status(500).json({ error: "Internal server error" });
  }
});
