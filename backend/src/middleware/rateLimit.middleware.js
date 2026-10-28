const rateLimit = require("express-rate-limit");
const { isTest } = require("../config/env");

// Rate limiting is disabled during automated tests so the suite can hit
// endpoints repeatedly without tripping limits meant for real traffic.
const skip = () => isTest;

const jsonHandler = (req, res) => {
  res.status(429).json({
    success: false,
    error: { code: "RATE_LIMITED", message: "Too many requests, please try again later." },
  });
};

const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 20,
  standardHeaders: true,
  legacyHeaders: false,
  skip,
  handler: jsonHandler,
});

const publicLeadLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: 30,
  standardHeaders: true,
  legacyHeaders: false,
  skip,
  handler: jsonHandler,
});

const webhookLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: 120,
  standardHeaders: true,
  legacyHeaders: false,
  skip,
  handler: jsonHandler,
});

module.exports = { loginLimiter, publicLeadLimiter, webhookLimiter };
