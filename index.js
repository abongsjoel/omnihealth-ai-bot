const express = require("express");
const axios = require("axios");
require("dotenv").config();

const app = express();
app.use(express.json());

console.log("got here");

app.post("/ai", async (req, res) => {
  const userMessage = req.body.message;
  let messages = req.body.history;

  if (!userMessage || typeof userMessage !== "string") {
    return res.status(400).json({ reply: "Invalid input." });
  } else {
    if (!messages || messages.length === 0 || messages === "") {
      messages = [
        { role: "system", content: "You are a helpful health assistant." },
      ];
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
