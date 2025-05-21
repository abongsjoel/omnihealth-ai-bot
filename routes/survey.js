const express = require("express");
const Survey = require("../models/Survey");
const router = express.Router();

const SURVEY_FIELDS = [
  "age",
  "gender",
  "conditions",
  "duration",
  "caregiver",
  "provider",
  "advice",
  "advice_understood",
  "treatment_explained",
  "clinic_visit",
  "challenge",
  "receive_care",
  "interested",
];

router.post("/survey", async (req, res) => {
  console.log("🚨 Received Survey Data:", JSON.stringify(req.body, null, 2));

  const userId = req.body.userId || "anonymous";
  const content = req.body.message;

  const contentParts = content.split("@:");

  const field = contentParts[0].trim().toLowerCase();

  if (contentParts.length > 1 && SURVEY_FIELDS.includes(field)) {
    const valueRaw = contentParts[1].trim();

    let value = valueRaw;

    // Try to parse it as JSON (for postback button responses)
    try {
      const parsed = JSON.parse(valueRaw);
      if (parsed && parsed.payload) {
        value = parsed.payload;
      }
    } catch (err) {
      // not JSON, keep value as-is
      value = valueRaw;
    }

    const updateFields = {
      [field]: value.includes("@_")
        ? value.split("@_").filter((str) => str.trim() !== "")
        : value,
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
