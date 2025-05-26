const express = require("express");

const CareTeam = require("../models/CareTeam");

const router = express.Router();

// POST /api/careteam/signup
router.post("/careteam/signup", async (req, res) => {
  try {
    const { fullName, email, phone, password } = req.body;

    // Validate required fields
    if (!fullName || !email || !phone || !password) {
      return res.status(400).json({ error: "All fields are required." });
    }

    // Check if email is already in use
    const existingUser = await CareTeam.findOne({ email });
    if (existingUser) {
      return res.status(409).json({ error: "Email already in use." });
    }

    // Create and save new CareTeam member
    const careTeamMember = new CareTeam({ fullName, email, phone, password });
    await careTeamMember.save();

    res.status(201).json({
      message: "CareTeam member created successfully",
      careTeam: {
        id: careTeamMember._id,
        fullName: careTeamMember.fullName,
        email: careTeamMember.email,
        phone: careTeamMember.phone,
      },
    });
  } catch (error) {
    console.error("Signup error:", error);
    res.status(500).json({ error: "Internal server error." });
  }
});

module.exports = router;
