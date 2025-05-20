// const mongoose = require("mongoose");

// const SurveySchema = new mongoose.Schema({
//   userId: { type: String, required: true, unique: true },
//   age: { type: String, required: false },
//   gender: { type: String, required: false },
//   timestamp: { type: Date, default: Date.now },
// });

// module.exports = mongoose.model("Survey", SurveySchema);

const mongoose = require("mongoose");

const SurveySchema = new mongoose.Schema({
  userId: { type: String, required: true, unique: true },
  age: String,
  gender: String,
  condition: String,
  content: String,
  role: String,
  timestamp: { type: Date, default: Date.now },
});

module.exports = mongoose.model("Survey", SurveySchema);
