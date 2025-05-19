const express = require("express");
const axios = require("axios");
const helmet = require("helmet");
const cors = require("cors");
require("dotenv").config();

const connectDB = require("./db");
const Message = require("./models/Message");
const messageRoutes = require("./routes/messages");
const userRoutes = require("./routes/users");

const app = express();
connectDB();

const allowedOrigins = [
  "http://localhost:5173",
  "https://omnihealth-dashboard.vercel.app",
];

app.use(
  cors({
    origin: allowedOrigins,
    credentials: true,
  })
);

app.use(express.json());
app.use("/api", messageRoutes);
app.use("/api", userRoutes);
app.use(
  helmet.contentSecurityPolicy({
    useDefaults: true,
    directives: {
      "style-src-elem": ["'self'", "https://fonts.googleapis.com"],
      "font-src": ["'self'", "https://fonts.gstatic.com"],
    },
  })
);

app.post("/ai", async (req, res) => {
  const userId = req.body.userId || "anonymous";
  const userMessage = req.body.message;
  console.log({ userId, userMessage });

  if (!userMessage || typeof userMessage !== "string") {
    return res.status(400).json({ reply: "Invalid input." });
  }

  const curUserMessage = { role: "user", content: userMessage };

  // Create database entry with user message
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

    // Create database entry with assistant's response
    await Message.create({ userId, content: reply, role: "assistant" });

    return res.json({ reply });
  } catch (err) {
    console.error("OpenAI error:", err.response?.data || err.message);
    return res.status(500).json({ reply: "Sorry, something went wrong." });
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Bot server running on port ${PORT}`);
});
