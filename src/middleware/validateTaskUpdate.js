const validateTaskUpdate = (req, res, next) => {
    const allowedFields = ["title", "completed"];
  
    const receivedFields = Object.keys(req.body);
  
    const invalidFields = receivedFields.filter(
      (field) => !allowedFields.includes(field)
    );
  
    if (invalidFields.length > 0) {
      return res.status(400).json({
        message: "Invalid fields",
        fields: invalidFields,
      });
    }
  
    const { title, completed } = req.body;
  
    if (title === undefined && completed === undefined) {
      return res.status(400).json({
        message: "At least one field is required",
      });
    }
  
    if (title !== undefined) {
      if (typeof title !== "string" || title.trim() === "") {
        return res.status(400).json({
          message: "Title must be a non-empty string",
        });
      }
    }
  
    if (completed !== undefined) {
      if (typeof completed !== "boolean") {
        return res.status(400).json({
          message: "Completed must be a boolean",
        });
      }
    }
  
    next();
  };
  
  module.exports = validateTaskUpdate;