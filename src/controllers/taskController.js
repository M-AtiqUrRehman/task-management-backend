const taskService = require("../services/taskService");

const getTasks = async (req, res, next) => {
  try {
    const userId = req.user.userId;

    const page = Number(req.query.page) || 1;
    const limit = Number(req.query.limit) || 10;

    if (page < 1 || !Number.isInteger(page)) {
      return res.status(400).json({
        message: "Page must be a positive integer",
      });
    }

    if (limit < 1 || limit > 50 || !Number.isInteger(limit)) {
      return res.status(400).json({
        message: "Limit must be an integer between 1 and 50",
      });
    }

    let completed;

    if (req.query.completed !== undefined) {
      if (
        req.query.completed !== "true" &&
        req.query.completed !== "false"
      ) {
        return res.status(400).json({
          message: "Completed must be true or false",
        });
      }

      completed = req.query.completed === "true";
    }

    const result = await taskService.getAllTasks(
      userId,
      page,
      limit,
      completed
    );

    res.json(result);
  } catch (error) {
    next(error);
  }
};

const getTaskById = async (req, res, next) => {
  try {
    const userId = req.user.userId;
    const id = req.params.id;

    const task = await taskService.getTaskById(id, userId);

    if (!task) {
      return res.status(404).json({
        message: "Task not found",
      });
    }

    res.json({
      task,
    });
  } catch (error) {
    next(error);
  }
};

const createTask = async (req, res, next) => {
  try {
    const userId = req.user.userId;
    const { title } = req.body;

    const newTask = await taskService.createTask(title, userId);

    res.status(201).json({
      task: newTask,
    });
  } catch (error) {
    next(error);
  }
};

const updateTask = async (req, res, next) => {
  try {
    const userId = req.user.userId;
    const id = req.params.id;

    const task = await taskService.updateTask(id, userId, req.body);

    if (!task) {
      return res.status(404).json({
        message: "Task not found",
      });
    }

    res.json({
      task,
    });
  } catch (error) {
    next(error);
  }
};

const deleteTask = async (req, res, next) => {
  try {
    const userId = req.user.userId;
    const id = req.params.id;

    const deletedTask = await taskService.deleteTask(id, userId);

    if (!deletedTask) {
      return res.status(404).json({
        message: "Task not found",
      });
    }

    res.json({
      message: "Task deleted successfully",
      task: deletedTask,
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getTasks,
  getTaskById,
  createTask,
  updateTask,
  deleteTask,
};