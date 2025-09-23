const express = require("express");

const usersController = require("../controllers/users");

const router = express.Router();

// POST /api/users/assign-name
router.post("/users/assign-name", usersController.postAssignName);

// GET /api/users
router.get("/users", usersController.getUsers);

// DELETE /api/users/:userId
router.delete("/users/:userId", usersController.deleteUser);

module.exports = router;
