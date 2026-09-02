const Task = require("../models/taskModel");

const getAllTasks = async (userId, page = 1, limit = 10, completed) => {
  const skip = (page - 1) * limit;

  const filter = {
    user: userId,
  };

  if (completed !== undefined) {
    filter.completed = completed;
  }

  const tasks = await Task.find(filter)
    .skip(skip)
    .limit(limit)
    .sort({ createdAt: -1 });

  const totalTasks = await Task.countDocuments(filter);

  return {
    tasks,
    pagination: {
      page,
      limit,
      totalTasks,
      totalPages: Math.ceil(totalTasks / limit),
    },
  };
};

const getTaskById = async (id, userId) => {
  return await Task.findOne({
    _id: id,
    user: userId,
  });
};

const createTask = async (title, userId) => {
  const newTask = await Task.create({
    title,
    user: userId,
  });

  return newTask;
};

const updateTask = async (id, userId, updates) => {
  const task = await Task.findOneAndUpdate(
    {
      _id: id,
      user: userId,
    },
    {
      $set: updates,
    },
    {
      returnDocument: "after",
      runValidators: true,
    }
  );

  return task;
};

const deleteTask = async (id, userId) => {
  const deletedTask = await Task.findOneAndDelete({
    _id: id,
    user: userId,
  });

  return deletedTask;
};

module.exports = {
  getAllTasks,
  getTaskById,
  createTask,
  updateTask,
  deleteTask,
};