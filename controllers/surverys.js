const Survey = require("../models/Survey");

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

const asyncHandler = (fn) => (req, res, next) => {
  Promise.resolve(fn(req, res, next)).catch(next);
};

exports.postSurvey = asyncHandler(async (req, res) => {
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

    await Survey.findOneAndUpdate(
      { userId },
      { $set: updateFields },
      { upsert: true, new: true, setDefaultsOnInsert: true }
    );

    console.log("✅ WhatsApp Message Received:", userId, content);
  }

  res.sendStatus(200);
});

exports.getSurveys = asyncHandler(async (req, res) => {
  try {
    const results = await Survey.find().sort({ timestamp: -1 });
    res.status(200).json(results);
  } catch (error) {
    console.error("Error fetching survey results:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});
