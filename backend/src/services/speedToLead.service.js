const { env } = require("../config/env");
const leadRepository = require("../repositories/lead.repository");
const n8nService = require("../integrations/n8n/n8n.service");
const { computeResponseTime } = require("../utils/responseTime");
const logger = require("../config/logger");

/**
 * Scans WAITING leads whose SLA window has elapsed and flips them to
 * OVERDUE. Designed to be called cheaply/frequently by an external
 * scheduler (n8n Cron node hitting POST /api/internal/leads/check-overdue)
 * rather than running its own in-process scheduler.
 */
async function checkOverdueLeads({ organizationId } = {}) {
  const slaMinutes = env.LEAD_RESPONSE_SLA_MINUTES;
  const deadline = new Date(Date.now() - slaMinutes * 60 * 1000);

  const leads = await leadRepository.findWaitingPastSla(organizationId, deadline);
  if (leads.length === 0) {
    return { slaMinutes, updatedCount: 0, leadIds: [] };
  }

  await leadRepository.markOverdue(leads.map((l) => l.id));
  logger.info({ count: leads.length, slaMinutes }, "Leads marked OVERDUE");

  // Best-effort notification per lead - never let n8n failures affect the
  // (already committed) status change.
  await Promise.allSettled(leads.map((lead) => n8nService.notifyLeadOverdue(lead)));

  return { slaMinutes, updatedCount: leads.length, leadIds: leads.map((l) => l.id) };
}

module.exports = { checkOverdueLeads, computeResponseTime };
