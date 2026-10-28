const { prisma } = require("../config/database");

function create(data) {
  return prisma.property.create({ data });
}

function findByIdInOrg(id, organizationId) {
  return prisma.property.findFirst({ where: { id, organizationId } });
}

async function updateInOrg(id, organizationId, data) {
  const existing = await prisma.property.findFirst({ where: { id, organizationId }, select: { id: true } });
  if (!existing) return null;
  return prisma.property.update({ where: { id }, data });
}

function remove(id, organizationId) {
  return prisma.property.deleteMany({ where: { id, organizationId } });
}

function list(organizationId, { where = {}, skip, take }) {
  return Promise.all([
    prisma.property.findMany({
      where: { organizationId, ...where },
      orderBy: { createdAt: "desc" },
      skip,
      take,
    }),
    prisma.property.count({ where: { organizationId, ...where } }),
  ]);
}

module.exports = { create, findByIdInOrg, updateInOrg, remove, list };
