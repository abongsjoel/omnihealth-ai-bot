const express = require("express");

const chatController = require("../controllers/chat");

const router = express.Router();

router.post("/ai", chatController.postAi);

router.post("/chat", chatController.postChat);

//Webhook for Twilio
router.post("/webhook", chatController.postWebhook);

module.exports = router;
