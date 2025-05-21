const mongoose = require("mongoose");

const SurveySchema = new mongoose.Schema({
  userId: { type: String, required: true, unique: true },
  age: String,
  gender: String,
  conditions: [String],
  duration: String,
  caregiver: String,
  provider: String,
  advice: String,
  advice_understood: String,
  treatment_explained: String,
  clinic_visit: String,
  challenge: String,
  receive_care: String,
  interested: String,
  role: String,
  timestamp: { type: Date, default: Date.now },
});

module.exports = mongoose.model("Survey", SurveySchema);
