const express = require("express");

const User = require("../models/User");
const router = express.Router();

// GET /api/users
router.get("/users", async (req, res) => {
  const users = await Message.distinct("userId");
  res.json(users);
});

// POST /api/users/assign-name
router.post("/users/assign-name", async (req, res) => {
  const { username, userId } = req.body;

  if (!username || !userId) {
    return res
      .status(400)
      .json({ error: "Both username and phone are required" });
  }

  try {
    const existing = await User.findOneAndUpdate(
      { userId },
      { username },
      { upsert: true, new: true, setDefaultsOnInsert: true }
    );

    res.status(200).json({ success: true, user: existing });
  } catch (err) {
    console.error("Error assigning username:", err);
    res.status(500).json({ error: "Internal server error" });
  }
});

module.exports = router;
