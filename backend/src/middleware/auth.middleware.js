const jwt = require("jsonwebtoken");
const { env } = require("../config/env");
const { prisma } = require("../config/database");
const ApiError = require("../utils/ApiError");
const asyncHandler = require("../utils/asyncHandler");
const logger = require("../config/logger");

/**
 * Verifies the Bearer JWT, loads the current user (so deactivated/deleted
 * users are rejected even with a still-valid token) and attaches a minimal,
 * safe user object to req.user. Never exposes passwordHash.
 */
const requireAuth = asyncHandler(async (req, res, next) => {
  const header = req.headers.authorization || "";
  const [scheme, token] = header.split(" ");

  if (scheme !== "Bearer" || !token) {
    throw ApiError.unauthorized("Missing or invalid Authorization header", "AUTH_MISSING_TOKEN");
  }

  let payload;
  try {
    payload = jwt.verify(token, env.JWT_SECRET);
  } catch (err) {
    logger.warn({ reason: err.message }, "JWT verification failed");
    throw ApiError.unauthorized("Invalid or expired token", "AUTH_INVALID_TOKEN");
  }

  const user = await prisma.user.findUnique({
    where: { id: payload.userId },
    select: {
      id: true,
      organizationId: true,
      firstName: true,
      lastName: true,
      email: true,
      role: true,
      isActive: true,
    },
  });

  if (!user || !user.isActive) {
    throw ApiError.unauthorized("User not found or inactive", "AUTH_USER_INACTIVE");
  }

  req.user = user;
  next();
});

module.exports = { requireAuth };
