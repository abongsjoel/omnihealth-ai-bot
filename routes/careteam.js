const express = require("express");

const { body } = require("express-validator");

const careteamController = require("../controllers/careteam");

const router = express.Router();

// POST /api/careteam/signup
router.post(
  "/careteam/signup",
  [
    body("email")
      .trim()
      .isEmail()
      .notEmpty()
      .withMessage("Invalid email address"),
    body("password")
      .trim()
      .isLength({ min: 8 })
      .matches(/(?=.*[a-z])(?=.*[A-Z])(?=.*[^A-Za-z0-9])/)
      .withMessage(
        "Password must include upper and lower case letters and a special character"
      )
      .notEmpty(),
    body("phone")
      .trim()
      .isLength({ min: 8, max: 15 })
      .notEmpty()
      .withMessage("Invalid phone number"),
    body("fullName")
      .trim()
      .isLength({ min: 2, max: 100 })
      .notEmpty()
      .withMessage("Invalid full name"),
    body("speciality")
      .trim()
      .isLength({ min: 2, max: 100 })
      .notEmpty()
      .withMessage("Invalid speciality"),
  ],
  careteamController.signup
);

// POST /api/care-team/login
router.post(
  "/careteam/login",
  [
    body("email")
      .trim()
      .isEmail()
      .notEmpty()
      .withMessage("Invalid email address"),
    body("password").trim().notEmpty().withMessage("Password is required"),
  ],
  careteamController.login
);

// GET /api/careteam
router.get("/careteam", careteamController.getCareTeamMembers);

module.exports = router;
