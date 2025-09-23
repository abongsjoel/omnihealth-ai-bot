const express = require("express");
const { body } = require("express-validator");

const chatController = require("../controllers/chat");

const router = express.Router();

router.post(
  "/ai",
  [
    body("message")
      .exists()
      .withMessage("Message is required")
      .bail() // If message doesn't exist, stop here
      .isString()
      .withMessage("Message must be a string")
      .bail() // If message doesn't exist, stop here
      .trim()
      .notEmpty()
      .withMessage("Message content is required"),
  ],
  chatController.postAi
);

router.post("/chat", chatController.postChat);

//Webhook for Twilio
router.post("/webhook", chatController.postWebhook);

module.exports = router;
