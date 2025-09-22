const express = require("express");

const careteamController = require("../controllers/careteam");

const router = express.Router();

// POST /api/careteam/signup
router.post("/careteam/signup", careteamController.postSignup);

// POST /api/care-team/login
router.post("/careteam/login", careteamController.postLogin);

// GET /api/careteam
router.get("/careteam", careteamController.postCareTeam);

module.exports = router;
