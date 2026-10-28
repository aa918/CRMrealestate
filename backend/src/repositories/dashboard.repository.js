const { prisma } = require("../config/database");
const { SAFE_SELECT: USER_SAFE_SELECT } = require("./user.repository");

function countLeads(organizationId, where) {
  return prisma.lead.count({ where: { organizationId, ...where } });
}

function countTasks(organizationId, where) {
  return prisma.task.count({ where: { organizationId, ...where } });
}

function countDeals(organizationId, where) {
  return prisma.deal.count({ where: { organizationId, ...where } });
}

function recentLeads(organizationId, take = 10) {
  return prisma.lead.findMany({
    where: { organizationId },
    orderBy: { receivedAt: "desc" },
    take,
    include: { contact: true, assignedUser: { select: USER_SAFE_SELECT } },
  });
}

/**
 * Every lead that has received a first response, for response-time math.
 * Only fetches the two timestamps needed - kept lean since this can scan
 * a lot of rows as the org grows.
 */
function respondedLeadTimestamps(organizationId, since) {
  return prisma.lead.findMany({
    where: {
      organizationId,
      firstResponseAt: { not: null },
      ...(since ? { receivedAt: { gte: since } } : {}),
    },
    select: { receivedAt: true, firstResponseAt: true },
  });
}

module.exports = { countLeads, countTasks, countDeals, recentLeads, respondedLeadTimestamps };
