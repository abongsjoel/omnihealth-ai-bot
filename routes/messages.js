const express = require("express");
const axios = require("axios");

const Message = require("../models/Message");
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

// POST /api/users/assign-name
router.post("/users/assign-name", async (req, res) => {
  const { username, phone } = req.body;

  if (!username || !phone) {
    return res
      .status(400)
      .json({ error: "Both username and phone are required" });
  }

  try {
    const existing = await User.findOneAndUpdate(
      { phone },
      { username },
      { upsert: true, new: true, setDefaultsOnInsert: true }
    );

    res.status(200).json({ success: true, user: existing });
  } catch (err) {
    console.error("Error assigning username:", err);
    res.status(500).json({ error: "Internal server error" });
  }
});

router.get("/messages/:userId", async (req, res) => {
  const messages = await Message.find({ userId: req.params.userId })
    .sort({ timestamp: 1 })
    .select("role content -_id");
  res.json(messages);
});

// POST /api/send-message
router.post("/send-message", async (req, res) => {
  const { to, message } = req.body;

  if (!to || !message) {
    return res.status(400).json({ error: "Missing 'to' or 'message'" });
  }

  try {
    // 1. Send to Infobip

    await axios.post(
      `${process.env.INFOBIP_BASE_URL}/whatsapp/1/message/text`,
      {
        from: process.env.INFOBIP_WHATSAPP_SENDER,
        to: to,
        content: {
          text: message,
        },
      },
      {
        headers: {
          Authorization: `App ${process.env.INFOBIP_API_KEY}`,
          "Content-Type": "application/json",
        },
      }
    );

    // 2. Save to DB
    await Message.create({
      userId: to,
      content: message,
      role: "assistant",
    });

    res.json({ status: "Message sent" });
  } catch (error) {
    // console.error("Infobip send error:", error.response?.data || error.message);
    res.status(500).json({ error: "Failed to send message via Infobip" });
    console.error(
      "Infobip send error:",
      JSON.stringify(error.response?.data, null, 2)
    );
  }
});

module.exports = router;
