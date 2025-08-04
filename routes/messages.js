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

// Sent using Infobip API
// router.post("/send-message", async (req, res) => {
//   const { to, message, agent } = req.body;

//   if (!to || !message || !agent) {
//     return res
//       .status(400)
//       .json({ error: "Missing 'to' or 'message' or 'agent'" });
//   }

//   try {
//     // 1. Send to Infobip
//     await axios.post(
//       `${process.env.INFOBIP_BASE_URL}/whatsapp/1/message/text`,
//       {
//         from: process.env.INFOBIP_WHATSAPP_SENDER,
//         to: to,
//         content: {
//           text: message,
//         },
//       },
//       {
//         headers: {
//           Authorization: `App ${process.env.INFOBIP_API_KEY}`,
//           "Content-Type": "application/json",
//         },
//       }
//     );

//     // 2. Save to DB
//     await Message.create({
//       userId: to,
//       content: message,
//       role: "assistant",
//       agent: agent,
//     });

//     res.json({ status: "Message sent" });
//   } catch (error) {
//     // console.error("Infobip send error:", error.response?.data || error.message);
//     res.status(500).json({ error: "Failed to send message via Infobip" });
//     console.error(
//       "Infobip send error:",
//       JSON.stringify(error.response?.data, null, 2)
//     );
//   }
// });

// Sent using Twilio API
router.post("/send-message", async (req, res) => {
  console.log("🚨 Received Send Message Request:", req.body);
  const { to, message, agent } = req.body;

  if (!to || !message || !agent) {
    return res
      .status(400)
      .json({ error: "Missing 'to', 'message', or 'agent'" });
  }

  const accountSid = process.env.TWILIO_ACCOUNT_SID;
  const authToken = process.env.TWILIO_AUTH_TOKEN;
  const from = "whatsapp:+14155238886"; // Twilio sandbox number

  let formattedTo = to;
  if (
    formattedTo.startsWith("237") &&
    formattedTo.length >= 4 &&
    formattedTo[3] === "6"
  ) {
    formattedTo = formattedTo.slice(0, 3) + formattedTo.slice(4);
  }

  const toWhatsApp = `whatsapp:+${formattedTo}`;
  // const toWhatsApp = `whatsapp:+${to}`;

  const client = require("twilio")(accountSid, authToken);

  try {
    console.log("📩 Sending message via Twilio:", {
      body: message,
      from,
      to: toWhatsApp,
    });
    // 1. Send to Twilio
    await client.messages.create({
      body: message,
      from,
      to: toWhatsApp,
    });

    // 2. Save to DB
    await Message.create({
      userId: to,
      content: message,
      role: "assistant",
      agent,
    });

    res.json({ status: "Message sent" });
  } catch (error) {
    console.error(
      "Twilio send error:",
      JSON.stringify(error.response?.data || error.message, null, 2)
    );
    res.status(500).json({ error: "Failed to send message via Twilio" });
  }
});


module.exports = router;
