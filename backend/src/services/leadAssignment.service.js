const { prisma } = require("../config/database");
const userRepository = require("../repositories/user.repository");
const logger = require("../config/logger");

/**
 * Round-robin strategy: assigns to the active AGENT who least recently
 * received a lead (or has never received one). This needs no separate
 * "cursor" table and self-heals when agents are added/deactivated.
 *
 * Designed to be swapped out later for smarter strategies (by region,
 * language, property type, performance, availability) without touching
 * any caller - see `assignAgent` below, which is the only exported entry
 * point the rest of the app should use.
 */
async function roundRobinStrategy(organizationId) {
  const agents = await userRepository.findActiveAgents(organizationId);
  if (agents.length === 0) return null;

  const lastAssignedRows = await prisma.lead.groupBy({
    by: ["assignedUserId"],
    where: { organizationId, assignedUserId: { in: agents.map((a) => a.id) } },
    _max: { assignedAt: true },
  });

  const lastAssignedAt = new Map(lastAssignedRows.map((r) => [r.assignedUserId, r._max.assignedAt]));

  let chosen = agents[0];
  let chosenTime = lastAssignedAt.get(chosen.id) ?? null;

  for (const agent of agents.slice(1)) {
    if (chosenTime === null) break; // an unassigned agent is already the best possible pick
    const time = lastAssignedAt.get(agent.id) ?? null;
    if (time === null || time < chosenTime) {
      chosen = agent;
      chosenTime = time;
    }
  }

  return chosen;
}

/**
 * Strategy registry - future assignment rules can be registered here and
 * selected per-organization (e.g. via an Organization settings field)
 * without changing lead.service.js.
 */
const strategies = {
  ROUND_ROBIN: roundRobinStrategy,
};

async function assignAgent(organizationId, { strategy = "ROUND_ROBIN" } = {}) {
  const strategyFn = strategies[strategy] || roundRobinStrategy;
  const agent = await strategyFn(organizationId);
  if (!agent) {
    logger.info({ organizationId }, "No active agents available - lead will remain unassigned");
  }
  return agent;
}

module.exports = { assignAgent };
