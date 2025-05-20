const express = require("express");
const Survey = require("../models/Survey");
const router = express.Router();

const SURVEY_FIELDS = ["age", "gender"];

router.post("/survey", async (req, res) => {
  console.log("🚨 Received Survey Data:", JSON.stringify(req.body, null, 2));

  const userId = req.body.userId || "anonymous";
  const content = req.body.message;
  console.log({ userId, content });

  const contentParts = content.split("@:");

  const field = contentParts[0].trim().toLowerCase();

  if (contentParts.length > 1 && SURVEY_FIELDS.includes(field)) {
    const value = contentParts[1].trim();

    const updateFields = {
      [field]: value,
    };

    console.log("Update Fields:", updateFields);
    await Survey.findOneAndUpdate(
      { userId },
      { $set: updateFields },
      { upsert: true, new: true, setDefaultsOnInsert: true }
    );

    console.log("✅ WhatsApp Message Received:", userId, content);
  }

  res.sendStatus(200);
});

module.exports = router;
