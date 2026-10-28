const { prisma } = require("../config/database");

// Organization creation always happens inside auth.service.js's register()
// transaction (tx.organization.create), so there is no standalone create()
// here - a non-transactional version would be unsafe to use by mistake.

function findById(id) {
  return prisma.organization.findUnique({ where: { id } });
}

function findByPublicApiKey(publicApiKey) {
  return prisma.organization.findUnique({ where: { publicApiKey } });
}

module.exports = { findById, findByPublicApiKey };
