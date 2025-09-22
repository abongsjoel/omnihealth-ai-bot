const express = require("express");
const nodemailer = require("nodemailer");
const sendgridTransport = require("nodemailer-sendgrid-transport");

const CareTeam = require("../models/CareTeam");

const router = express.Router();

const transporter = nodemailer.createTransport(
  sendgridTransport({
    auth: {
      api_key: process.env.SENDGRID_API_KEY,
    },
  })
);

// POST /api/careteam/signup
router.post("/careteam/signup", async (req, res) => {
  try {
    const { fullName, displayName, speciality, email, phone, password } =
      req.body;

    // Validate required fields
    if (!fullName || !email || !phone || !password || !speciality) {
      return res.status(400).json({ error: "All fields are required." });
    }

    // Check if email is already in use
    const existingUser = await CareTeam.findOne({ email });
    if (existingUser) {
      return res.status(409).json({ error: "Email already in use." });
    }

    // Create and save new CareTeam member
    const careTeamMember = new CareTeam({
      fullName,
      email,
      phone,
      password,
      displayName,
      speciality,
    });
    await careTeamMember.save();

    transporter.sendMail(
      {
        to: email,
        from: "abongsjoel@gmail.com",
        subject: "Welcome to OmniHealth Care Team",
        text: `Hi ${fullName},\n\nThank you for joining the OmniHealth Care Team! We're excited to have you on board.\n\nBest,\nThe OmniHealth Team`,
      },
      (err, info) => {
        if (err) {
          console.error("SendGrid error:", err);
        } else {
          console.log("SendGrid response:", info);
        }
      }
    );

    res.status(201).json({
      message: "CareTeam member created successfully",
      careTeam: {
        id: careTeamMember._id,
        fullName: careTeamMember.fullName,
        displayName: careTeamMember.displayName,
        speciality: careTeamMember.speciality,
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
      displayName: teamMember.displayName,
      speciality: teamMember.speciality,
      email: teamMember.email,
      phone: teamMember.phone,
      createdAt: teamMember.createdAt,
      updatedAt: teamMember.updatedAt,
    });
  } catch (error) {
    res.status(500).json({ error: "Server error" });
  }
});

// GET /api/careteam
router.get("/careteam", async (req, res) => {
  try {
    const members = await CareTeam.find({}, "-password") // exclude passwords
      .sort({ createdAt: -1 }); // optional: sort newest first

    res.status(200).json(members);
  } catch (error) {
    console.error("Error fetching care team members:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

module.exports = router;
