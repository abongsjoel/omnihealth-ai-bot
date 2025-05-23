const express = require("express");

const User = require("../models/User");

const router = express.Router();

// POST /api/users/assign-name
router.post("/users/assign-name", async (req, res) => {
  const { userName, userId } = req.body;

  if (!userName || !userId) {
    return res
      .status(400)
      .json({ error: "Both userName and userId are required TJ" });
  }

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

// GET /api/users
router.get("/users", async (req, res) => {
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

module.exports = router;
