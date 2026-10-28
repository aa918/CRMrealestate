const { prisma } = require("../config/database");

function create({ organizationId, integration, event, success, errorMessage, metadata }) {
  return prisma.integrationLog.create({
    data: { organizationId: organizationId || null, integration, event, success, errorMessage: errorMessage || null, metadata },
  });
}

function findLatestByIntegration(organizationId, integration) {
  return prisma.integrationLog.findFirst({
    where: { organizationId, integration },
    orderBy: { createdAt: "desc" },
  });
}

function list(organizationId, { integration, skip, take } = {}) {
  const where = { organizationId, ...(integration ? { integration } : {}) };
  return Promise.all([
    prisma.integrationLog.findMany({ where, orderBy: { createdAt: "desc" }, skip, take }),
    prisma.integrationLog.count({ where }),
  ]);
}

module.exports = { create, findLatestByIntegration, list };
