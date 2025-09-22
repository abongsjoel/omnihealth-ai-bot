const express = require("express");

const surveyController = require("../controllers/surverys");

const router = express.Router();

// POST /api/survey - receive survey response
router.post("/survey", surveyController.postSurvey);

// GET /api/surveys - get all survey results
router.get("/surveys", surveyController.getSurveys);

module.exports = router;
