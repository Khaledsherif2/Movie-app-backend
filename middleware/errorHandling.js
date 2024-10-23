const errorHandler = (err, req, res, next) => {
  let statusCode = err.statusCode || 500;

  if (err.name === "ValidationError") {
    statusCode = 400;
  }

  return res.status(statusCode).json({
    message: err.message || "Server Error",
  });
};

module.exports = errorHandler;
