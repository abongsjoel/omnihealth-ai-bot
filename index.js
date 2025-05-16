const express = require("express");
const axios = require("axios");
const helmet = require("helmet");
require("dotenv").config();

const app = express();
app.use(express.json());

app.use(
  helmet.contentSecurityPolicy({
    useDefaults: true,
    directives: {
      "style-src-elem": ["'self'", "https://fonts.googleapis.com"],
      "font-src": ["'self'", "https://fonts.gstatic.com"],
    },
  })
);

// Simulate basic in-memory message log (replace with DB in production)
const messageLog = {}; // { userId: [messages] }
console.log({ messageLog });

function getChatHistory(userId, userMessage) {
  return (
    messageLog[userId] || [
      { role: "system", content: "You are a helpful health assistant." },
      { role: "user", content: userMessage },
    ]
  );
}

function saveMessage(userId, role, content) {
  if (!messageLog[userId]) {
    messageLog[userId] = [
      { role: "system", content: "You are a helpful health assistant." },
    ];
  }
  messageLog[userId].push({ role, content });
  // Trim to last 10 messages
  if (messageLog[userId].length > 12) {
    messageLog[userId] = [
      messageLog[userId][0],
      ...messageLog[userId].slice(-10),
    ];
  }
}

app.post("/ai", async (req, res) => {
  const userId = req.body.userId || "anonymous";
  const userMessage = req.body.message;
  console.log({ userId, userMessage });

  if (!userMessage || typeof userMessage !== "string") {
    return res.status(400).json({ reply: "Invalid input." });
  }

  const messages = getChatHistory(userId, userMessage);
  console.log({ messages });
  saveMessage(userId, "user", userMessage);

  try {
    console.log("within try", { messages });
    const openaiRes = await axios.post(
      "https://openrouter.ai/api/v1/chat/completions",
      {
        model: "openai/gpt-3.5-turbo",
        messages: messages,
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
    saveMessage(userId, "assistant", reply);

    const response = {
      reply,
      previous_responses: messageLog[userId],
    };

    console.log({ response });
    console.log({ messageLog });

    return res.json({ response });

    // return res.json({ reply, history: messageLog[userId] });
  } catch (err) {
    console.error("OpenAI error:", err.response?.data || err.message);
    return res.status(500).json({ reply: "Sorry, something went wrong." });
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Bot server running on port ${PORT}`);
});
