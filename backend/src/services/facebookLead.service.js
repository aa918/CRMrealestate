const facebookLeadRepository = require("../repositories/facebookLead.repository");
const facebookService = require("../integrations/facebook/facebook.service");
const leadService = require("./lead.service");
const logger = require("../config/logger");

/**
 * Processes a single Facebook "leadgen" change event.
 *
 * Idempotency: leadgenId is unique in FacebookLead, so if we've already
 * recorded this event, we short-circuit and never create a second Lead
 * for the same Facebook lead notification (Meta is known to occasionally
 * redeliver webhooks).
 *
 * `organizationIdHint` lets the development /simulate endpoint specify the
 * organization directly (there is no real FacebookIntegration mapping yet
 * in that case).
 */
async function processLeadgenEvent({ pageId, formId, leadgenId, fieldDataHint, organizationIdHint }) {
  const existing = await facebookLeadRepository.findByLeadgenId(leadgenId);
  if (existing) {
    logger.info({ leadgenId }, "Duplicate Facebook leadgen event ignored (already processed)");
    return existing;
  }

  let organizationId = organizationIdHint || null;
  if (!organizationId) {
    const integration = await facebookLeadRepository.findIntegrationByPageId(pageId);
    organizationId = integration?.organizationId || null;
  }

  let fbLeadRecord = await facebookLeadRepository.create({
    organizationId,
    pageId,
    formId: formId || null,
    leadgenId,
    status: "RECEIVED",
    rawPayload: { pageId, formId, leadgenId, fieldDataHint: fieldDataHint || null },
  });

  if (!organizationId) {
    logger.warn({ pageId, leadgenId }, "No FacebookIntegration mapped to this pageId - lead not processed into CRM");
    fbLeadRecord = await facebookLeadRepository.update(fbLeadRecord.id, {
      status: "IGNORED",
      errorMessage: `No FacebookIntegration found for pageId ${pageId}`,
    });
    return fbLeadRecord;
  }

  try {
    const fbData = await facebookService.fetchLeadData(leadgenId, fieldDataHint);
    const normalized = facebookService.normalizeFieldData(fbData);

    const lead = await leadService.createLead(organizationId, {
      firstName: normalized.firstName,
      lastName: normalized.lastName,
      phone: normalized.phone,
      email: normalized.email,
      city: normalized.city,
      source: "FACEBOOK",
    });

    fbLeadRecord = await facebookLeadRepository.update(fbLeadRecord.id, {
      status: "PROCESSED",
      fetchedData: fbData,
      leadId: lead.id,
    });

    logger.info({ leadgenId, leadId: lead.id }, "Facebook lead processed into CRM");
    return { ...fbLeadRecord, lead };
  } catch (err) {
    logger.error({ leadgenId, err: err.message }, "Failed to process Facebook lead");
    fbLeadRecord = await facebookLeadRepository.update(fbLeadRecord.id, {
      status: "FAILED",
      errorMessage: err.message,
    });
    return fbLeadRecord;
  }
}

/**
 * Parses Meta's standard webhook envelope and processes every "leadgen"
 * change it contains.
 */
async function processWebhookPayload(body) {
  const results = [];
  for (const entry of body.entry || []) {
    const pageId = entry.id;
    for (const change of entry.changes || []) {
      if (change.field !== "leadgen") continue;
      const value = change.value || {};
      const result = await processLeadgenEvent({
        pageId: value.page_id || pageId,
        formId: value.form_id,
        leadgenId: value.leadgen_id,
      });
      results.push(result);
    }
  }
  return results;
}

module.exports = { processLeadgenEvent, processWebhookPayload };
