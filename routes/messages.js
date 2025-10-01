const express = require("express");
const { body } = require("express-validator");
const isAuth = require("../middleware/is-auth");

const messagesController = require("../controllers/messages");

const router = express.Router();

// GET /api/users
router.get("/user-ids", messagesController.getUserIds);

// GET /api/messages/last-messages
router.get("/messages/last-messages", messagesController.getLastMessages);

// GET /api/messages/:userId
router.get("/messages/:userId", isAuth, messagesController.getMessagesByUserId);

// Sent using Infobip API
// router.post(
//   "/send-message",
//   [
//     body("to").trim().notEmpty().withMessage("Recipient number is required"),
//     body("message")
//       .trim()
//       .notEmpty()
//       .withMessage("Message content is required"),
//     body("agent").trim().notEmpty().withMessage("Agent identifier is required"),
//   ],
//   messagesController.postSendMessageInfobip
// );

// Sent using Twilio API
router.post(
  "/send-message",
  [
    body("to").trim().notEmpty().withMessage("Recipient number is required"),
    body("message")
      .trim()
      .notEmpty()
      .withMessage("Message content is required"),
    body("agent").trim().notEmpty().withMessage("Agent identifier is required"),
  ],
  messagesController.postSendMessageTwilio
);

// Mark messages as read
router.patch("/messages/:userId/mark-read", messagesController.patchMarkRead);

module.exports = router;
