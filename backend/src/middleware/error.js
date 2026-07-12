const notFound = (req, res, next) => {
  const error = new Error(`Not Found - ${req.originalUrl}`);
  res.status(404);
  next(error);
};

const errorHandler = (err, req, res, next) => {
  const statusCode = err.statusCode || (res.statusCode === 200 ? 500 : res.statusCode);
  res.status(statusCode);
  res.json({
    success: false,
    message: err.message || 'Server Error',
    errors: process.env.NODE_ENV === 'production' ? undefined : [{ stack: err.stack }]
  });
};

module.exports = { notFound, errorHandler };
