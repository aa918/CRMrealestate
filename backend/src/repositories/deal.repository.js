const { prisma } = require("../config/database");
const { SAFE_SELECT: USER_SAFE_SELECT } = require("./user.repository");

const DEFAULT_INCLUDE = {
  contact: true,
  property: true,
  owner: { select: USER_SAFE_SELECT },
};

function create(data) {
  return prisma.deal.create({ data, include: DEFAULT_INCLUDE });
}

function findByIdInOrg(id, organizationId) {
  return prisma.deal.findFirst({ where: { id, organizationId }, include: DEFAULT_INCLUDE });
}

async function updateInOrg(id, organizationId, data) {
  const existing = await prisma.deal.findFirst({ where: { id, organizationId }, select: { id: true } });
  if (!existing) return null;
  return prisma.deal.update({ where: { id }, data, include: DEFAULT_INCLUDE });
}

function remove(id, organizationId) {
  return prisma.deal.deleteMany({ where: { id, organizationId } });
}

function list(organizationId, { where = {}, skip, take }) {
  return Promise.all([
    prisma.deal.findMany({
      where: { organizationId, ...where },
      include: DEFAULT_INCLUDE,
      orderBy: { createdAt: "desc" },
      skip,
      take,
    }),
    prisma.deal.count({ where: { organizationId, ...where } }),
  ]);
}

function countWonThisMonth(organizationId, monthStart) {
  return prisma.deal.count({
    where: { organizationId, stage: "WON", closedAt: { gte: monthStart } },
  });
}

function countOpen(organizationId) {
  return prisma.deal.count({
    where: { organizationId, stage: { notIn: ["WON", "LOST"] } },
  });
}

module.exports = { DEFAULT_INCLUDE, create, findByIdInOrg, updateInOrg, remove, list, countWonThisMonth, countOpen };
