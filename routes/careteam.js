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

// POST /api/care-team/login
router.post("/careteam/login", async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password)
    return res.status(400).json({ error: "Email and password required." });

  try {
    const teamMember = await CareTeam.findOne({ email });
    if (!teamMember)
      return res.status(401).json({ error: "Invalid credentials" });

    const isMatch = await teamMember.comparePassword(password);
    if (!isMatch) return res.status(401).json({ error: "Invalid credentials" });

    res.status(200).json({
      _id: teamMember._id,
      fullName: teamMember.fullName,
      email: teamMember.email,
      phone: teamMember.phone,
      createdAt: teamMember.createdAt,
      updatedAt: teamMember.updatedAt,
    });
  } catch (error) {
    res.status(500).json({ error: "Server error" });
  }
});

module.exports = router;
