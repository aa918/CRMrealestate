const { prisma } = require("../config/database");
const { SAFE_SELECT: USER_SAFE_SELECT } = require("./user.repository");

const DEFAULT_INCLUDE = {
  contact: true,
  assignedUser: { select: USER_SAFE_SELECT },
};

function create(data) {
  return prisma.lead.create({ data, include: DEFAULT_INCLUDE });
}

function findByIdInOrg(id, organizationId) {
  return prisma.lead.findFirst({ where: { id, organizationId }, include: DEFAULT_INCLUDE });
}

/**
 * Safe update that never crosses tenant boundaries: verifies the row
 * belongs to organizationId before writing.
 */
async function updateInOrg(id, organizationId, data) {
  const existing = await prisma.lead.findFirst({ where: { id, organizationId }, select: { id: true } });
  if (!existing) return null;
  return prisma.lead.update({ where: { id }, data, include: DEFAULT_INCLUDE });
}

function remove(id, organizationId) {
  return prisma.lead.deleteMany({ where: { id, organizationId } });
}

function list(organizationId, { where = {}, orderBy, skip, take }) {
  return Promise.all([
    prisma.lead.findMany({
      where: { organizationId, ...where },
      include: DEFAULT_INCLUDE,
      orderBy,
      skip,
      take,
    }),
    prisma.lead.count({ where: { organizationId, ...where } }),
  ]);
}

function findWaitingPastSla(organizationId, slaDeadline) {
  return prisma.lead.findMany({
    where: {
      ...(organizationId ? { organizationId } : {}),
      responseStatus: "WAITING",
      receivedAt: { lte: slaDeadline },
    },
    include: DEFAULT_INCLUDE,
  });
}

function markOverdue(ids) {
  return prisma.lead.updateMany({
    where: { id: { in: ids } },
    data: { responseStatus: "OVERDUE" },
  });
}

module.exports = {
  DEFAULT_INCLUDE,
  create,
  findByIdInOrg,
  updateInOrg,
  remove,
  list,
  findWaitingPastSla,
  markOverdue,
};
