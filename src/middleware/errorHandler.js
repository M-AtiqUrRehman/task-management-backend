const errorHandler = (err, req, res, next) => {
  console.error(err.stack);

  // Mongoose validation error
  if (err.name === "ValidationError") {
    return res.status(400).json({
      message: "Validation error",
      errors: Object.values(err.errors).map((error) => error.message),
    });
  }

  // Duplicate key error
  if (err.code === 11000) {
    return res.status(400).json({
      message: "Duplicate value already exists",
    });
  }

  // Invalid MongoDB ObjectId
  if (err.name === "CastError") {
    return res.status(400).json({
      message: "Invalid ID format",
    });
  }

  // Default server error
  res.status(500).json({
    message: "Internal Server Error",
  });
};

module.exports = errorHandler;