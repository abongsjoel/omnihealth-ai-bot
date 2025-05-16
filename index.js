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
      // Allow loading stylesheets from Google Fonts
      "style-src-elem": ["'self'", "https://fonts.googleapis.com"],
      "font-src": ["'self'", "https://fonts.gstatic.com"],
    },
  })
);

app.post("/ai", async (req, res) => {
  const userMessage = req.body.message;
  const history = req.body.history;

  const historyArray =
    typeof history === "string" && history !== "" ? JSON.parse(history) : "";

  let messages =
    Array.isArray(historyArray) && historyArray.length > 0
      ? [...historyArray]
      : [{ role: "system", content: "You are a helpful health assistant." }];

  if (!userMessage || typeof userMessage !== "string") {
    return res.status(400).json({ reply: "Invalid input." });
  } else {
    const messagesLength = messages.length;
    if (messagesLength > 10) {
      messages.splice(1, messagesLength - 10 < 2 ? 2 : messagesLength - 10);
    }
    messages.push({ role: "user", content: userMessage });
  }

  try {
    // const openaiRes = await axios.post(
    //   "https://api.openai.com/v1/chat/completions",
    //   {
    //     model: "gpt-3.5-turbo",
    //     messages: [{ role: "user", content: userMessage }],
    //   },
    //   {
    //     headers: {
    //       Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
    //       "Content-Type": "application/json",
    //     },
    //   }
    // );

    const openaiRes = await axios.post(
      "https://openrouter.ai/api/v1/chat/completions",
      {
        model: "openai/gpt-3.5-turbo", // or "openai/gpt-4", "anthropic/claude-3-opus", etc.
        messages: [
          { role: "system", content: "You are a helpful health assistant." },
          { role: "user", content: userMessage },
        ],
        messages,
      },
      {
        headers: {
          Authorization: `Bearer ${process.env.OPENROUTER_API_KEY}`,
          "Content-Type": "application/json",
          "HTTP-Referer": "https://yourdomain.com", // any placeholder if you're local
          "X-Title": "OmniHealth Bot",
        },
      }
    );

    // const reply = openaiRes.data.choices[0].message.content;
    const reply = openaiRes.data.choices[0].message.content;

    messages.push({ role: "assistant", content: reply });

    const response = {
      reply,
      previous_responses: messages,
    };

    console.log({ response });

    return res.json({ response });
  } catch (err) {
    console.error("OpenAI error:", err.response?.data || err.message);
    return res.status(500).json({ reply: "Sorry, something went wrong." });
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Bot server running on port ${PORT}`);
});
