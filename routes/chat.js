const express = require("express");
const axios = require("axios");

const Message = require("../models/Message");
const User = require("../models/User");

const router = express.Router();

router.post("/ai", async (req, res) => {
  const userId = req.body.userId || "anonymous";
  const userMessage = req.body.message;

  if (!userMessage || typeof userMessage !== "string") {
    return res.status(400).json({ reply: "Invalid input." });
  }

  const curUserMessage = { role: "user", content: userMessage };

  // // Create database entry with user message
  await Message.create({ userId, ...curUserMessage });

  // Fetch chat history from DB
  const history = await Message.find({ userId })
    .sort({ timestamp: -1 })
    .limit(20)
    .select("role content -_id");

  const orderedHistory = history.reverse();

  const messages = [
    { role: "system", content: "You are a helpful health assistant." },
    ...orderedHistory
      .filter(
        (msg) => typeof msg.content === "string" && msg.content.trim() !== ""
      )
      .map((msg) => ({
        role: msg.role,
        content: msg.content,
      })),
    curUserMessage,
  ];

  try {
    const openaiRes = await axios.post(
      "https://openrouter.ai/api/v1/chat/completions",
      {
        model: "openai/gpt-3.5-turbo",
        messages,
      },
      {
        headers: {
          Authorization: `Bearer ${process.env.OPENROUTER_API_KEY}`,
          "Content-Type": "application/json",
          "HTTP-Referer": "https://yourdomain.com",
          "X-Title": "OmniHealth Bot",
        },
      }
    );

    const reply = openaiRes.data.choices[0].message.content;
    console.log({ reply });

    // Create database entry with assistant's response
    await Message.create({
      userId,
      content: reply,
      role: "assistant",
      agent: "openai",
    });

    return res.json({ reply });
  } catch (err) {
    console.error("OpenAI error:", err.response?.data || err.message);
    return res.status(500).json({ reply: "Sorry, something went wrong." });
  }
});

router.post("/chat", async (req, res) => {
  const userId = req.body.userId || "anonymous";
  const content = req.body.message;

  if (userId && content) {
    await Message.create({
      userId,
      content,
      role: "user",
    });
    console.log("✅ WhatsApp Message Received:", userId, content);
  }
  res.sendStatus(200);
});

//Webhook for Twilio
router.post("/webhook", async (req, res) => {
  const userId = req.body.WaId || "anonymous";

  let formattedUserId = userId;

  // Check if userId starts with "237" and 4th character is not "6"
  if (
    userId !== "anonymous" &&
    userId.startsWith("237") &&
    userId.length >= 4 &&
    userId[3] !== "6"
  ) {
    formattedUserId = userId.slice(0, 3) + "6" + userId.slice(3);
  }

  const userMessage = req.body.Body;

  if (userId && userMessage) {
    const lastMessage = await Message.find({ userId: formattedUserId })
      .sort({ timestamp: -1 })
      .limit(1);

    let itsBeenAWhile = false;

    if (lastMessage.length > 0) {
      const lastMessageTime = new Date(lastMessage[0].timestamp);
      const currentTime = new Date();
      const timeDifference = currentTime - lastMessageTime;
      const aWhile = 6 * 60 * 60 * 1000; // 6 hours in milliseconds
      itsBeenAWhile = timeDifference > aWhile;
    } else {
      itsBeenAWhile = true;
    }

    await Message.create({
      userId: formattedUserId,
      content: userMessage,
      role: "user",
    });

    const accountSid = process.env.TWILIO_ACCOUNT_SID;
    const authToken = process.env.TWILIO_AUTH_TOKEN;
    const from = "whatsapp:+14155238886";
    const to = `whatsapp:+${userId}`;

    const client = require("twilio")(accountSid, authToken);

    if (
      lastMessage.length > 0 &&
      !itsBeenAWhile &&
      lastMessage[0].agent === "auto-welcome" &&
      userMessage.toLowerCase() !== "ai" &&
      userMessage.toLowerCase() !== "human"
    ) {
      const message =
        "RESPONSE NOT UNDERSTOOD. \n\nWould you like to talk to an AI 🤖 or a human 👩🏽‍⚕️?\n\nPlease reply with *AI* or *Human*.";

      await client.messages.create({
        from,
        to,
        body: message,
      });

      await Message.create({
        userId: formattedUserId,
        content: message,
        role: "assistant",
        agent: "auto-welcome",
      });
    } else if (itsBeenAWhile) {
      // Get user's name if available
      let userName = "";
      const user = await User.findOne({ userId: formattedUserId });
      if (user && user.userName) {
        // Use only the first name
        userName = `, ${user.userName.split(" ")[0]}`;
      }

      const message = `Hi 👋${userName}, Welcome to OmniHealth, your personal health assistant. \n\nWould you like to talk to an AI 🤖 or a human 👩🏽‍⚕️?\n\nPlease reply with *AI* or *Human*.`;

      await client.messages.create({
        from,
        to,
        body: message,
      });

      await Message.create({
        userId: formattedUserId,
        content: message,
        role: "assistant",
        agent: "auto-welcome",
      });
    } else if (userMessage.toLowerCase() === "ai") {
      // Auto-reply with AI response
      const aiResponse =
        "You chose AI 🤖. \n\nIf at any point you want to switch to a human, just type 'Human'. \n\nHow can I assist you today?";

      await client.messages.create({
        from,
        to,
        body: aiResponse,
      });

      await Message.create({
        userId: formattedUserId,
        content: aiResponse,
        role: "assistant",
        agent: "auto-ai",
      });
    } else if (userMessage.toLowerCase() === "human") {
      // Auto-reply with human response
      const humanResponse =
        "You chose Human 👩🏽‍⚕️. \n\nIf at any point you want to switch to AI, just type 'AI'. \n\nA care team member will assist you shortly.";

      await client.messages.create({
        from,
        to,
        body: humanResponse,
      });

      await Message.create({
        userId: formattedUserId,
        content: humanResponse,
        role: "assistant",
        agent: "auto-human",
      });
    } else if (
      lastMessage &&
      lastMessage.length > 0 &&
      (lastMessage[0].agent === "auto-ai" || lastMessage[0].agent === "openai")
    ) {
      if (!userMessage || typeof userMessage !== "string") {
        return res.status(400).json({ reply: "Invalid input." });
      }

      // Fetch chat history from DB
      const history = await Message.find({ userId })
        .sort({ timestamp: -1 })
        .limit(20)
        .select("role content -_id");

      const orderedHistory = history.reverse();

      const curUserMessage = { role: "user", content: userMessage };

      const messages = [
        { role: "system", content: "You are a helpful health assistant." },
        ...orderedHistory
          .filter(
            (msg) =>
              typeof msg.content === "string" && msg.content.trim() !== ""
          )
          .map((msg) => ({
            role: msg.role,
            content: msg.content,
          })),
        curUserMessage,
      ];

      try {
        const openaiRes = await axios.post(
          "https://openrouter.ai/api/v1/chat/completions",
          {
            model: "openai/gpt-3.5-turbo",
            messages,
          },
          {
            headers: {
              Authorization: `Bearer ${process.env.OPENROUTER_API_KEY}`,
              "Content-Type": "application/json",
              "HTTP-Referer": "https://yourdomain.com",
              "X-Title": "OmniHealth Bot",
            },
          }
        );

        const reply = openaiRes.data.choices[0].message.content;
        console.log({ reply });

        await client.messages.create({
          from,
          to,
          body: reply,
        });

        // Create database entry with assistant's response
        await Message.create({
          userId: formattedUserId,
          content: reply,
          role: "assistant",
          agent: "openai",
        });
      } catch (err) {
        console.error("OpenAI error:", err.response?.data || err.message);
        return res.status(500).json({ reply: "Sorry, something went wrong." });
      }
    }
  }

  res.set("Content-Type", "text/xml");
  res.send(`<Response></Response>`); // required by Twilio
});

// router.post("/webhook", async (req, res) => {
//   const userId = req.body.userId || "anonymous";
//   const content = req.body.message;
//   console.log({ userId, content });

//   if (userId && content) {
//     await Message.create({
//       userId,
//       content,
//       role: "user",
//     });

//     console.log("✅ WhatsApp Message Received (Webhook):", userId, content);
//   }

//   res.sendStatus(200);
// });

// app.post("/webhook", async (req, res) => {
//   const message = req.body?.results?.[0];

//   const from = message?.from;
//   const text = message?.message?.text;

//   if (from && text) {
//     await Message.create({
//       userId: from,
//       content: text,
//       role: "user",
//     });

//     console.log("✅ WhatsApp Message Received:", from, text);
//   }

//   res.sendStatus(200);
// });

module.exports = router;
