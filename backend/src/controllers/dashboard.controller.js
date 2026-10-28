const asyncHandler = require("../utils/asyncHandler");
const { ok } = require("../utils/apiResponse");
const dashboardService = require("../services/dashboard.service");

const summary = asyncHandler(async (req, res) => {
  const data = await dashboardService.getSummary(req.user.organizationId);
  ok(res, data);
});

const recentLeads = asyncHandler(async (req, res) => {
  const limit = req.query.limit ? Number(req.query.limit) : 10;
  const data = await dashboardService.getRecentLeads(req.user.organizationId, limit);
  ok(res, data);
});

const responsePerformance = asyncHandler(async (req, res) => {
  const data = await dashboardService.getResponsePerformance(req.user.organizationId);
  ok(res, data);
});

module.exports = { summary, recentLeads, responsePerformance };
