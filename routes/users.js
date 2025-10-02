const express = require("express");
const { body } = require("express-validator");
const isAuth = require("../middleware/is-auth");

const usersController = require("../controllers/users");

const router = express.Router();

// POST /api/users/assign-name
router.post(
  "/users/assign-name",
  isAuth,
  [
    body("userId").trim().notEmpty().withMessage("UserID is required"),
    body("userName").trim().notEmpty().withMessage("UserName is required"),
  ],
  usersController.postAssignName
);

// GET /api/users
router.get("/users", isAuth, usersController.getUsers);

// DELETE /api/users/:userId
router.delete("/users/:userId", isAuth, usersController.deleteUser);

module.exports = router;
