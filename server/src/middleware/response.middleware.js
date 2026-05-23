/**
 * Response Middleware
 * Injects helper methods into res to follow the standard response pattern
 * defined in 02_ROUTING_ARCHITECTURE.md and 03_CONTROLLER_PATTERN.md
 */

export const responseHelper = (req, res, next) => {
  res.ok = (data, meta = {}) => {
    res.status(200).json({
      data,
      meta,
      requestId: req.id
    });
  };

  res.created = (data, meta = {}) => {
    res.status(201).json({
      data,
      meta,
      requestId: req.id
    });
  };

  res.error = (code, message, status = 400, details = {}) => {
    res.status(status).json({
      error: {
        code,
        message,
        details
      },
      requestId: req.id
    });
  };

  next();
};
