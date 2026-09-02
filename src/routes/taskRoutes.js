const validateTask = require("../middleware/validateTask");
const validateTaskUpdate = require("../middleware/validateTaskUpdate");
const authMiddleware = require("../middleware/authMiddleware");

const express = require("express");

const router = express.Router();

const {
  getTasks,
  getTaskById,
  createTask,
  updateTask,
  deleteTask
} = require("../controllers/taskController");

// Protected routes
router.get("/", authMiddleware, getTasks);

router.get("/:id", authMiddleware, getTaskById);

router.post("/", authMiddleware, validateTask, createTask);

router.patch("/:id", authMiddleware, validateTaskUpdate, updateTask);

router.delete("/:id", authMiddleware, deleteTask);

module.exports = router;