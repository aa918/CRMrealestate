const { Prisma } = require("@prisma/client");
const ApiError = require("../utils/ApiError");
const logger = require("../config/logger");
const { isProduction } = require("../config/env");

function notFoundHandler(req, res, next) {
  next(ApiError.notFound(`Route not found: ${req.method} ${req.originalUrl}`, "ROUTE_NOT_FOUND"));
}

function mapPrismaError(err) {
  if (err instanceof Prisma.PrismaClientKnownRequestError) {
    if (err.code === "P2002") {
      return ApiError.conflict(
        `A record with this ${(err.meta && err.meta.target) || "value"} already exists`,
        "DUPLICATE_RECORD"
      );
    }
    if (err.code === "P2025") {
      return ApiError.notFound("Record not found", "NOT_FOUND");
    }
    if (err.code === "P2003") {
      return ApiError.badRequest("Related record does not exist", "INVALID_REFERENCE");
    }
  }
  return null;
}

// eslint-disable-next-line no-unused-vars
function errorHandler(err, req, res, next) {
  let apiError = err instanceof ApiError ? err : mapPrismaError(err);

  if (!apiError) {
    apiError = ApiError.internal(isProduction ? "Internal server error" : err.message);
  }

  const logPayload = {
    err: { message: err.message, code: apiError.code, statusCode: apiError.statusCode },
    path: req.originalUrl,
    method: req.method,
  };

  if (apiError.statusCode >= 500) {
    logger.error(logPayload, "Unhandled error");
  } else {
    logger.warn(logPayload, "Request error");
  }

  const body = {
    success: false,
    error: {
      code: apiError.code,
      message: apiError.message,
    },
  };

  if (apiError.details) {
    body.error.details = apiError.details;
  }

  if (!isProduction && apiError.statusCode >= 500) {
    body.error.stack = err.stack;
  }

  res.status(apiError.statusCode).json(body);
}

module.exports = { errorHandler, notFoundHandler };
