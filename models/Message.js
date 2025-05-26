const mongoose = require("mongoose");

const MessageSchema = new mongoose.Schema({
  userId: String,
  content: String,
  agent: String,
  role: { type: String, enum: ["user", "assistant"] },
  timestamp: { type: Date, default: Date.now },
});

MessageSchema.pre("save", function (next) {
  if (this.role === "assistant" && !this.agent) {
    this.agent = "unknown"; // fallback agent if none was set manually
  }
  next();
});

module.exports = mongoose.model("Message", MessageSchema);
