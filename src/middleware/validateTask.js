const validateTask = (req, res, next) => {
    const { title } = req.body;
  
    if (title === undefined) {
      return res.status(400).json({
        message: "Title is required",
      });
    }
  
    if (typeof title !== "string" || title.trim() === "") {
      return res.status(400).json({
        message: "Title must be a non-empty string",
      });
    }
  
    next();
  };
  
  module.exports = validateTask;