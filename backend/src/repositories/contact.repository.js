const { prisma } = require("../config/database");

function findByOrgAndPhone(organizationId, phone) {
  return prisma.contact.findUnique({
    where: { organizationId_phone: { organizationId, phone } },
  });
}

function findByIdInOrg(id, organizationId) {
  return prisma.contact.findFirst({ where: { id, organizationId } });
}

function create(data) {
  return prisma.contact.create({ data });
}

function update(id, organizationId, data) {
  return prisma.contact.updateMany({ where: { id, organizationId }, data });
}

function remove(id, organizationId) {
  return prisma.contact.deleteMany({ where: { id, organizationId } });
}

function list(organizationId, { where = {}, skip, take }) {
  return Promise.all([
    prisma.contact.findMany({
      where: { organizationId, ...where },
      orderBy: { createdAt: "desc" },
      skip,
      take,
    }),
    prisma.contact.count({ where: { organizationId, ...where } }),
  ]);
}

module.exports = { findByOrgAndPhone, findByIdInOrg, create, update, remove, list };
