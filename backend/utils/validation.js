const { validationResult } = require('express-validator');

const handleValidationErrors = (req, res, next) => {
  const validationErrors = validationResult(req);

  if (!validationErrors.isEmpty()) { 
    const errors = {};
    validationErrors.array().forEach(error => {
      errors[error.param] = error.msg;
    });

    return res.status(400).json({
      title: "Validation Error",
      message: "There were validation errors.",
      errors
    });
  }
  next();
};

module.exports = { handleValidationErrors };
