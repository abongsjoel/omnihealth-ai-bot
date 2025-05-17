const mongoose = require("mongoose");

const MessageSchema = new mongoose.Schema({
  userId: String,
  content: String,
  role: { type: String, enum: ["user", "assistant"] },
  timestamp: { type: Date, default: Date.now },
});

module.exports = mongoose.model("Message", MessageSchema);
