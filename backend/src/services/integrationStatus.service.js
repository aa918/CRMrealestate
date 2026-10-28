const { env } = require("../config/env");
const { prisma } = require("../config/database");
const integrationLogRepository = require("../repositories/integrationLog.repository");

/**
 * Honest status for the Automations UI. Every field here is either a
 * static configuration fact (is an env var set?) or a real database read
 * (what actually happened last). Nothing here is inferred from "a webhook
 * exists" or "a button was clicked".
 */
async function getIntegrationsStatus(organizationId) {
  const [lastN8n, lastWhatsapp, lastFacebook, facebookIntegration] = await Promise.all([
    integrationLogRepository.findLatestByIntegration(organizationId, "N8N"),
    integrationLogRepository.findLatestByIntegration(organizationId, "WHATSAPP"),
    prisma.facebookLead.findFirst({ where: { organizationId }, orderBy: { createdAt: "desc" } }),
    prisma.facebookIntegration.findFirst({ where: { organizationId, isActive: true } }),
  ]);

  return {
    n8n: {
      configured: Boolean(env.N8N_LEAD_WEBHOOK_URL),
      lastEvent: lastN8n ? lastN8n.event : null,
      lastResult: lastN8n ? (lastN8n.success ? "SUCCESS" : "FAILED") : null,
      lastExecutedAt: lastN8n ? lastN8n.createdAt : null,
      lastError: lastN8n && !lastN8n.success ? lastN8n.errorMessage : null,
    },
    whatsapp: {
      configured: Boolean(env.WHATSAPP_ACCESS_TOKEN && env.WHATSAPP_PHONE_NUMBER_ID),
      mode: env.WHATSAPP_ACCESS_TOKEN && env.WHATSAPP_PHONE_NUMBER_ID ? "LIVE" : "MOCK",
      lastEvent: lastWhatsapp ? lastWhatsapp.event : null,
      lastResult: lastWhatsapp ? (lastWhatsapp.success ? "SUCCESS" : "FAILED") : null,
      lastExecutedAt: lastWhatsapp ? lastWhatsapp.createdAt : null,
      lastError: lastWhatsapp && !lastWhatsapp.success ? lastWhatsapp.errorMessage : null,
    },
    facebook: {
      configured: Boolean(env.FACEBOOK_APP_SECRET && env.FACEBOOK_ACCESS_TOKEN && env.FACEBOOK_VERIFY_TOKEN),
      pageConnected: Boolean(facebookIntegration),
      lastEvent: lastFacebook ? "leadgen" : null,
      lastResult: lastFacebook ? lastFacebook.status : null,
      lastExecutedAt: lastFacebook ? lastFacebook.createdAt : null,
      lastError: lastFacebook && lastFacebook.status === "FAILED" ? lastFacebook.errorMessage : null,
    },
  };
}

async function listIntegrationLogs(organizationId, { integration, page = 1, limit = 20 } = {}) {
  const skip = (page - 1) * limit;
  const [items, total] = await integrationLogRepository.list(organizationId, { integration, skip, take: limit });
  return { items, pagination: { page, limit, total, pages: total === 0 ? 0 : Math.ceil(total / limit) } };
}

module.exports = { getIntegrationsStatus, listIntegrationLogs };
