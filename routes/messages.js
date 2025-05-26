const express = require("express");
const axios = require("axios");

const Message = require("../models/Message");

const router = express.Router();

// GET /api/users
router.get("/user-ids", async (req, res) => {
  const userIds = await Message.distinct("userId");
  res.json(userIds);
});

router.get("/messages/:userId", async (req, res) => {
  const messages = await Message.find({ userId: req.params.userId })
    .sort({ timestamp: 1 })
    .select("role content agent timestamp -_id");
  res.json(messages);
});

// POST /api/send-message
router.post("/send-message", async (req, res) => {
  const { to, message, agent } = req.body;

  if (!to || !message || !agent) {
    return res
      .status(400)
      .json({ error: "Missing 'to' or 'message' or 'agent'" });
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
      agent: agent,
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
