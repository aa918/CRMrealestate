const { prisma } = require("../config/database");

const SAFE_SELECT = {
  id: true,
  organizationId: true,
  firstName: true,
  lastName: true,
  email: true,
  phone: true,
  role: true,
  isActive: true,
  createdAt: true,
  updatedAt: true,
};

function findByEmail(email) {
  return prisma.user.findUnique({ where: { email } });
}

function findById(id) {
  return prisma.user.findUnique({ where: { id } });
}

function findByIdSafe(id) {
  return prisma.user.findUnique({ where: { id }, select: SAFE_SELECT });
}

function findByIdInOrg(id, organizationId) {
  return prisma.user.findFirst({ where: { id, organizationId }, select: SAFE_SELECT });
}

function create(data) {
  return prisma.user.create({ data, select: SAFE_SELECT });
}

function update(id, organizationId, data) {
  return prisma.user.update({ where: { id, organizationId }, data, select: SAFE_SELECT });
}

function listByOrganization(organizationId, { where = {}, skip, take }) {
  return Promise.all([
    prisma.user.findMany({
      where: { organizationId, ...where },
      select: SAFE_SELECT,
      orderBy: { createdAt: "asc" },
      skip,
      take,
    }),
    prisma.user.count({ where: { organizationId, ...where } }),
  ]);
}

/**
 * Active agents in an organization, ordered by id for a stable round-robin
 * rotation (see lead-assignment.service.js).
 */
function findActiveAgents(organizationId) {
  return prisma.user.findMany({
    where: { organizationId, role: "AGENT", isActive: true },
    orderBy: { id: "asc" },
    select: SAFE_SELECT,
  });
}

module.exports = {
  SAFE_SELECT,
  findByEmail,
  findById,
  findByIdSafe,
  findByIdInOrg,
  create,
  update,
  listByOrganization,
  findActiveAgents,
};
