const app = require("./app");
const { env, missingIntegrationWarnings } = require("./config/env");
const { connectDatabase, disconnectDatabase } = require("./config/database");
const logger = require("./config/logger");

let server;

async function start() {
  try {
    await connectDatabase();

    server = app.listen(env.PORT, () => {
      logger.info(`RealEstate CRM backend listening on http://localhost:${env.PORT}`);
      logger.info(`Environment: ${env.NODE_ENV}`);
      missingIntegrationWarnings.forEach((warning) => logger.warn(warning));
    });
  } catch (err) {
    logger.error({ err }, "Failed to start server");
    process.exit(1);
  }
}

async function shutdown(signal) {
  logger.info(`${signal} received - shutting down gracefully`);
  if (server) {
    server.close(async () => {
      await disconnectDatabase();
      process.exit(0);
    });
  } else {
    await disconnectDatabase();
    process.exit(0);
  }
  // Force-exit if graceful shutdown hangs.
  setTimeout(() => process.exit(1), 10000).unref();
}

process.on("SIGINT", () => shutdown("SIGINT"));
process.on("SIGTERM", () => shutdown("SIGTERM"));
process.on("unhandledRejection", (reason) => {
  logger.error({ reason }, "Unhandled promise rejection");
});

start();
