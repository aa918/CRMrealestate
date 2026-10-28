const asyncHandler = require("../utils/asyncHandler");
const { created } = require("../utils/apiResponse");
const leadService = require("../services/lead.service");
const logger = require("../config/logger");

/**
 * POST /api/public/leads
 * req.organizationId is set by the resolvePublicOrganization middleware -
 * it is NEVER trusted from the request body, so a client can never submit
 * a lead into someone else's organization.
 */
const submitPublicLead = asyncHandler(async (req, res) => {
  const lead = await leadService.createLead(req.organizationId, req.body);
  logger.info({ organizationId: req.organizationId, leadId: lead.id, source: lead.source }, "Public lead received");
  created(res, { id: lead.id, status: lead.status, receivedAt: lead.receivedAt });
});

module.exports = { submitPublicLead };
