const express = require("express");
const Message = require("../models/Message");

const router = express.Router();

// GET /api/users
router.get("/users", async (req, res) => {
  const users = await Message.distinct("userId");
  res.json(users);
});

router.get("/messages/:userId", async (req, res) => {
  const messages = await Message.find({ userId: req.params.userId })
    .sort({ timestamp: 1 })
    .select("role message -_id");
  res.json(messages);
});

// POST /api/send-message
router.post("/send-message", async (req, res) => {
  const { to, message } = req.body;
  // Send to Infobip, then save to Mongo
  res.json({ status: "Message sent" });
});

module.exports = router;
