const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");

const CareTeamSchema = new mongoose.Schema(
  {
    fullName: {
      type: String,
      required: true,
    },
    displayName: {
      type: String,
    },
    speciality: {
      type: String,
      required: true,
    },
    phone: {
      type: String,
      required: true,
      unique: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
    },
    password: {
      type: String,
      required: true,
    },
  },
  { timestamps: true }
);

// Hash password before saving
CareTeamSchema.pre("save", async function (next) {
  if (!this.isModified("password")) return next();

  try {
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
    next();
  } catch (err) {
    next(err);
  }
});

CareTeamSchema.methods.comparePassword = async function (candidatePassword) {
  return bcrypt.compare(candidatePassword, this.password);
};

module.exports = mongoose.model("CareTeam", CareTeamSchema);
