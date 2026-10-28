const { prisma } = require("../config/database");
const { SAFE_SELECT: USER_SAFE_SELECT } = require("./user.repository");

const DEFAULT_INCLUDE = {
  user: { select: USER_SAFE_SELECT },
};

function create(data) {
  return prisma.activity.create({ data, include: DEFAULT_INCLUDE });
}

function list(organizationId, { where = {}, skip, take }) {
  return Promise.all([
    prisma.activity.findMany({
      where: { organizationId, ...where },
      include: DEFAULT_INCLUDE,
      orderBy: { createdAt: "desc" },
      skip,
      take,
    }),
    prisma.activity.count({ where: { organizationId, ...where } }),
  ]);
}

function listByContact(contactId, organizationId, { skip, take }) {
  return Promise.all([
    prisma.activity.findMany({
      where: { contactId, organizationId },
      include: DEFAULT_INCLUDE,
      orderBy: { createdAt: "desc" },
      skip,
      take,
    }),
    prisma.activity.count({ where: { contactId, organizationId } }),
  ]);
}

module.exports = { create, list, listByContact };
