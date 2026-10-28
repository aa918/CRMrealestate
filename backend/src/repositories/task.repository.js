const { prisma } = require("../config/database");
const { SAFE_SELECT: USER_SAFE_SELECT } = require("./user.repository");

const DEFAULT_INCLUDE = {
  contact: true,
  lead: true,
  assignedUser: { select: USER_SAFE_SELECT },
};

function create(data) {
  return prisma.task.create({ data, include: DEFAULT_INCLUDE });
}

function findByIdInOrg(id, organizationId) {
  return prisma.task.findFirst({ where: { id, organizationId }, include: DEFAULT_INCLUDE });
}

async function updateInOrg(id, organizationId, data) {
  const existing = await prisma.task.findFirst({ where: { id, organizationId }, select: { id: true } });
  if (!existing) return null;
  return prisma.task.update({ where: { id }, data, include: DEFAULT_INCLUDE });
}

function remove(id, organizationId) {
  return prisma.task.deleteMany({ where: { id, organizationId } });
}

function list(organizationId, { where = {}, skip, take }) {
  return Promise.all([
    prisma.task.findMany({
      where: { organizationId, ...where },
      include: DEFAULT_INCLUDE,
      orderBy: { dueAt: "asc" },
      skip,
      take,
    }),
    prisma.task.count({ where: { organizationId, ...where } }),
  ]);
}

module.exports = { DEFAULT_INCLUDE, create, findByIdInOrg, updateInOrg, remove, list };
