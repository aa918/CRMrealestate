const asyncHandler = require("../utils/asyncHandler");
const { ok, paginated } = require("../utils/apiResponse");
const whatsappService = require("../integrations/whatsapp/whatsapp.service");
const integrationStatusService = require("../services/integrationStatus.service");

/**
 * Protected manual-trigger endpoint for verifying WhatsApp connectivity
 * (real or mock) without going through the full lead/task flow.
 */
const testWhatsApp = asyncHandler(async (req, res) => {
  const { phone, message } = req.body;
  const result = await whatsappService.sendTextMessage(phone, message, { organizationId: req.user.organizationId });
  ok(res, { configured: whatsappService.isConfigured, ...result });
});

/**
 * Honest configuration + last-execution status for every integration -
 * backs the Automations page so it never has to guess or fabricate state.
 */
const getStatus = asyncHandler(async (req, res) => {
  const status = await integrationStatusService.getIntegrationsStatus(req.user.organizationId);
  ok(res, status);
});

const getLogs = asyncHandler(async (req, res) => {
  const { integration, page, limit } = req.query;
  const result = await integrationStatusService.listIntegrationLogs(req.user.organizationId, {
    integration,
    page: page ? Number(page) : undefined,
    limit: limit ? Number(limit) : undefined,
  });
  paginated(res, result.items, result.pagination);
});

module.exports = { testWhatsApp, getStatus, getLogs };
