const asyncHandler = require("../utils/asyncHandler");
const { ok } = require("../utils/apiResponse");
const speedToLeadService = require("../services/speedToLead.service");

/**
 * Meant to be called on a schedule by n8n (Cron node -> HTTP Request node
 * with X-Internal-Api-Key). Deliberately organization-agnostic (checks
 * across all tenants) since it runs as a trusted server-to-server job, not
 * on behalf of any single logged-in user.
 */
const checkOverdueLeads = asyncHandler(async (req, res) => {
  const result = await speedToLeadService.checkOverdueLeads();
  ok(res, result);
});

module.exports = { checkOverdueLeads };
