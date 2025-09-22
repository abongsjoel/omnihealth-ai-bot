const express = require("express");

const messagesController = require("../controllers/messages");

const router = express.Router();

// GET /api/users
router.get("/user-ids", messagesController.getUserIds);

// GET /api/messages/last-messages
router.get("/messages/last-messages", messagesController.getLastMessages);

// GET /api/messages/:userId
router.get("/messages/:userId", messagesController.getMessagesByUserId);

// Sent using Infobip API
// router.post("/send-message", messagesController.postSendMessageInfobip);

// Sent using Twilio API
router.post("/send-message", messagesController.postSendMessageTwilio);

// Mark messages as read
router.patch("/messages/:userId/mark-read", messagesController.patchMarkRead);

module.exports = router;
