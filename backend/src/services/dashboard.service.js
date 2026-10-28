const dashboardRepository = require("../repositories/dashboard.repository");
const { env } = require("../config/env");
const { computeResponseTime, isSlaBreached } = require("../utils/responseTime");

function startOfToday() {
  const now = new Date();
  return new Date(now.getFullYear(), now.getMonth(), now.getDate());
}

function endOfToday() {
  const now = new Date();
  return new Date(now.getFullYear(), now.getMonth(), now.getDate(), 23, 59, 59, 999);
}

function startOfMonth() {
  const now = new Date();
  return new Date(now.getFullYear(), now.getMonth(), 1);
}

function average(numbers) {
  if (numbers.length === 0) return null;
  return Math.round((numbers.reduce((a, b) => a + b, 0) / numbers.length) * 100) / 100;
}

function median(numbers) {
  if (numbers.length === 0) return null;
  const sorted = [...numbers].sort((a, b) => a - b);
  const mid = Math.floor(sorted.length / 2);
  const value = sorted.length % 2 === 0 ? (sorted[mid - 1] + sorted[mid]) / 2 : sorted[mid];
  return Math.round(value * 100) / 100;
}

async function getSummary(organizationId) {
  const today = startOfToday();
  const todayEnd = endOfToday();
  const monthStart = startOfMonth();

  const [
    newLeadsToday,
    waitingLeads,
    overdueLeads,
    respondedToday,
    openDeals,
    wonDealsThisMonth,
    tasksDueToday,
    overdueTasks,
    respondedTimestamps,
  ] = await Promise.all([
    dashboardRepository.countLeads(organizationId, { createdAt: { gte: today } }),
    dashboardRepository.countLeads(organizationId, { responseStatus: "WAITING" }),
    dashboardRepository.countLeads(organizationId, { responseStatus: "OVERDUE" }),
    dashboardRepository.countLeads(organizationId, { firstResponseAt: { gte: today, lte: todayEnd } }),
    dashboardRepository.countDeals(organizationId, { stage: { notIn: ["WON", "LOST"] } }),
    dashboardRepository.countDeals(organizationId, { stage: "WON", closedAt: { gte: monthStart } }),
    dashboardRepository.countTasks(organizationId, {
      status: { notIn: ["DONE", "CANCELLED"] },
      dueAt: { gte: today, lte: todayEnd },
    }),
    dashboardRepository.countTasks(organizationId, {
      status: { notIn: ["DONE", "CANCELLED"] },
      dueAt: { lt: new Date() },
    }),
    dashboardRepository.respondedLeadTimestamps(organizationId),
  ]);

  const responseMinutes = respondedTimestamps
    .map((l) => computeResponseTime(l.receivedAt, l.firstResponseAt)?.responseTimeMinutes)
    .filter((v) => v !== undefined && v !== null);

  return {
    newLeadsToday,
    waitingLeads,
    overdueLeads,
    respondedToday,
    openDeals,
    wonDealsThisMonth,
    tasksDueToday,
    overdueTasks,
    averageResponseTimeMinutes: average(responseMinutes),
  };
}

async function getRecentLeads(organizationId, limit = 10) {
  return dashboardRepository.recentLeads(organizationId, limit);
}

async function getResponsePerformance(organizationId) {
  const respondedTimestamps = await dashboardRepository.respondedLeadTimestamps(organizationId);
  const slaMinutes = env.LEAD_RESPONSE_SLA_MINUTES;

  const minutes = [];
  let respondedUnderSla = 0;

  for (const lead of respondedTimestamps) {
    const rt = computeResponseTime(lead.receivedAt, lead.firstResponseAt);
    if (rt) {
      minutes.push(rt.responseTimeMinutes);
      if (rt.responseTimeMinutes <= slaMinutes) respondedUnderSla++;
    }
  }

  const overdueCount = await dashboardRepository.countLeads(organizationId, { responseStatus: "OVERDUE" });

  return {
    slaMinutes,
    sampleSize: minutes.length,
    averageResponseTimeMinutes: average(minutes),
    medianResponseTimeMinutes: median(minutes),
    respondedUnderSla,
    numberOverdue: overdueCount,
  };
}

module.exports = { getSummary, getRecentLeads, getResponsePerformance, isSlaBreached };
