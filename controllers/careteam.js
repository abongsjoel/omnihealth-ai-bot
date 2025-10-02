const nodemailer = require("nodemailer");
const sendgridTransport = require("nodemailer-sendgrid-transport");
const { validationResult } = require("express-validator");
const jwt = require("jsonwebtoken");

const CareTeam = require("../models/CareTeam");
const { asyncHandler } = require("../utils/utils");

const transporter = nodemailer.createTransport(
  sendgridTransport({
    auth: {
      api_key: process.env.SENDGRID_API_KEY,
    },
  })
);

exports.signup = asyncHandler(async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res
      .status(422)
      .json({ message: "Validation failed", errors: errors.array() });
  }

  try {
    const { fullName, displayName, speciality, email, phone, password } =
      req.body;

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

exports.login = asyncHandler(async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res
      .status(422)
      .json({ message: "Validation failed", errors: errors.array() });
  }

  const { email, password } = req.body;

  try {
    const teamMember = await CareTeam.findOne({ email });
    if (!teamMember)
      return res.status(401).json({ error: "Invalid credentials" });

    const isMatch = await teamMember.comparePassword(password);
    if (!isMatch) return res.status(401).json({ error: "Invalid credentials" });

    const token = jwt.sign(
      { id: teamMember._id, email: teamMember.email },
      process.env.JWT_SECRET,
      { expiresIn: "30d" }
    );

    res.status(200).json({
      token,
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

exports.getCareTeamMembers = asyncHandler(async (req, res) => {
  try {
    const members = await CareTeam.find({}, "-password") // exclude passwords
      .sort({ createdAt: -1 }); // optional: sort newest first

    res.status(200).json(members);
  } catch (error) {
    console.error("Error fetching care team members:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});
