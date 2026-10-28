const { PrismaClient } = require("@prisma/client");
const logger = require("./logger");
const { isProduction } = require("./env");

// Reuse a single PrismaClient instance across the app (and across
// nodemon hot-reloads) to avoid exhausting Postgres connections.
const globalForPrisma = globalThis;

const prisma =
  globalForPrisma.__prisma ||
  new PrismaClient({
    log: isProduction ? ["error", "warn"] : ["warn", "error"],
  });

if (!isProduction) {
  globalForPrisma.__prisma = prisma;
}

async function connectDatabase() {
  await prisma.$connect();
  logger.info("Database connected");
}

async function disconnectDatabase() {
  await prisma.$disconnect();
}

async function isDatabaseHealthy() {
  try {
    await prisma.$queryRaw`SELECT 1`;
    return true;
  } catch (err) {
    logger.error({ err }, "Database health check failed");
    return false;
  }
}

module.exports = { prisma, connectDatabase, disconnectDatabase, isDatabaseHealthy };
