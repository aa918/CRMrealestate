const pino = require("pino");
const { isProduction, isTest } = require("./env");

const redactPaths = [
  "req.headers.authorization",
  "req.headers['x-internal-api-key']",
  "req.headers['x-public-api-key']",
  "req.headers.cookie",
  "*.password",
  "*.passwordHash",
  "*.token",
  "*.accessToken",
  "*.secret",
];

const logger = pino({
  level: isTest ? "silent" : process.env.LOG_LEVEL || "info",
  redact: { paths: redactPaths, censor: "[REDACTED]" },
  transport:
    !isProduction && !isTest
      ? {
          target: "pino-pretty",
          options: { colorize: true, translateTime: "SYS:standard", ignore: "pid,hostname" },
        }
      : undefined,
});

module.exports = logger;
