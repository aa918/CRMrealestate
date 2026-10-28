const axios = require("axios");
const { env } = require("../../config/env");
const logger = require("../../config/logger");
const integrationLogRepository = require("../../repositories/integrationLog.repository");

/**
 * Fire-and-forget style webhook dispatch to n8n. A failure here must NEVER
 * fail the caller's request (e.g. lead creation) - we log and move on so
 * n8n being down/misconfigured never blocks the core CRM flow.
 *
 * Every attempt (configured or not, success or failure) is recorded in
 * IntegrationLog so the Automations UI can show a real "last execution" /
 * "last result" instead of assuming success.
 */
async function sendEvent(event, payload, organizationId) {
  if (!env.N8N_LEAD_WEBHOOK_URL) {
    logger.info({ event }, "n8n webhook URL not configured - skipping (dev/mock mode)");
    await integrationLogRepository
      .create({ organizationId, integration: "N8N", event, success: false, errorMessage: "NOT_CONFIGURED" })
      .catch((err) => logger.error({ err: err.message }, "Failed to write integration log"));
    return { sent: false, reason: "NOT_CONFIGURED" };
  }

  try {
    await axios.post(
      env.N8N_LEAD_WEBHOOK_URL,
      { event, ...payload },
      {
        timeout: 5000,
        headers: env.N8N_API_SECRET ? { "X-N8N-Secret": env.N8N_API_SECRET } : undefined,
      }
    );
    logger.info({ event }, "n8n webhook delivered");
    await integrationLogRepository
      .create({ organizationId, integration: "N8N", event, success: true })
      .catch((err) => logger.error({ err: err.message }, "Failed to write integration log"));
    return { sent: true };
  } catch (err) {
    logger.error({ event, err: err.message }, "n8n webhook failed - continuing without blocking the request");
    await integrationLogRepository
      .create({ organizationId, integration: "N8N", event, success: false, errorMessage: err.message })
      .catch((logErr) => logger.error({ err: logErr.message }, "Failed to write integration log"));
    return { sent: false, reason: err.message };
  }
}

function buildLeadCreatedPayload(lead) {
  return {
    lead: {
      id: lead.id,
      firstName: lead.contact?.firstName,
      lastName: lead.contact?.lastName,
      phone: lead.contact?.phone,
      email: lead.contact?.email,
      source: lead.source,
      status: lead.status,
      interestType: lead.interestType,
      propertyType: lead.propertyType,
      city: lead.city,
      budget: lead.budget === null || lead.budget === undefined ? null : Number(lead.budget),
      assignedAgent: lead.assignedUser
        ? { id: lead.assignedUser.id, name: `${lead.assignedUser.firstName} ${lead.assignedUser.lastName}` }
        : null,
      receivedAt: lead.receivedAt,
    },
  };
}

async function notifyLeadCreated(lead) {
  return sendEvent("lead.created", buildLeadCreatedPayload(lead), lead.organizationId);
}

async function notifyLeadOverdue(lead) {
  return sendEvent("lead.overdue", buildLeadCreatedPayload(lead), lead.organizationId);
}

async function notifyLeadResponded(lead) {
  return sendEvent("lead.responded", buildLeadCreatedPayload(lead), lead.organizationId);
}

module.exports = { sendEvent, notifyLeadCreated, notifyLeadOverdue, notifyLeadResponded };
