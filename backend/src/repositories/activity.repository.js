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

/**
 * First-ever activity of one of the "response" types (CALL/WHATSAPP/EMAIL)
 * for a given lead, used to detect whether an incoming activity is truly
 * the agent's *first* response (speed-to-lead).
 */
function findFirstResponseActivity(leadId, responseTypes) {
  return prisma.activity.findFirst({
    where: { leadId, type: { in: responseTypes } },
    orderBy: { createdAt: "asc" },
  });
}

module.exports = { create, list, listByContact, findFirstResponseActivity };
