const { prisma } = require("../config/database");

function create(data) {
  return prisma.organization.create({ data });
}

function findById(id) {
  return prisma.organization.findUnique({ where: { id } });
}

function findByPublicApiKey(publicApiKey) {
  return prisma.organization.findUnique({ where: { publicApiKey } });
}

module.exports = { create, findById, findByPublicApiKey };
