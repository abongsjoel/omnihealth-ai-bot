const { validationResult } = require("express-validator");

const Message = require("../models/Message");
const { asyncHandler } = require("../utils/utils");

exports.getUserIds = asyncHandler(async (req, res) => {
  const userIds = await Message.distinct("userId");
  res.json(userIds);
});

exports.getLastMessages = asyncHandler(async (req, res) => {
  try {
    const lastMessages = await Message.aggregate([
      {
        $sort: { timestamp: -1 }, // Sort by timestamp descending
      },
      {
        $group: {
          _id: "$userId",
          lastMessage: { $first: "$$ROOT" }, // Get the first document in each group (which is the latest due to sorting)
        },
      },
      {
        $replaceRoot: { newRoot: "$lastMessage" }, // Replace root to have a flat structure
      },
      {
        $sort: { timestamp: -1 }, // Optional: Sort the final results by timestamp descending
      },
    ]);

    res.json(lastMessages);
  } catch (error) {
    console.error("Error fetching last messages:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

exports.getMessagesByUserId = asyncHandler(async (req, res) => {
  const messages = await Message.find({ userId: req.params.userId })
    .sort({ timestamp: 1 })
    .select("role content agent timestamp createdAt updatedAt read -_id");
  res.json(messages);
});

// Sent using Twilio API
exports.postSendMessageTwilio = asyncHandler(async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res
      .status(422)
      .json({ message: "Validation failed", errors: errors.array() });
  }

  const { to, message, agent } = req.body;

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
  const toWhatsAppUnformatted = `whatsapp:+${to}`;

  const client = require("twilio")(accountSid, authToken);

  try {
    // 1. Send to Twilio (number formatted)
    await client.messages.create({
      body: message,
      from,
      to: toWhatsApp,
    });
    // 1b. Sent to Twillo (number not formatted)
    await client.messages.create({
      body: message,
      from,
      to: toWhatsAppUnformatted,
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

// Sent using Infobip API
// exports.postSendMessageInfobip = asyncHandler(async (req, res) => {
//   const errors = validationResult(req);
//   if (!errors.isEmpty()) {
//     return res
//       .status(422)
//       .json({ message: "Validation failed", errors: errors.array() });
//   }

//   const { to, message, agent } = req.body;
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

exports.patchMarkRead = asyncHandler(async (req, res) => {
  try {
    const { userId } = req.params;

    const result = await Message.updateMany(
      { userId: userId },
      { $set: { read: true } }
    );

    res.json({
      status: "Messages marked as read",
      modifiedCount: result.modifiedCount,
    });
  } catch (error) {
    console.error("Error marking messages as read:", error);
    res.status(500).json({ error: "Failed to mark messages as read" });
  }
});
