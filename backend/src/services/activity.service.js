const activityRepository = require("../repositories/activity.repository");
const leadRepository = require("../repositories/lead.repository");
const contactRepository = require("../repositories/contact.repository");
const n8nService = require("../integrations/n8n/n8n.service");
const ApiError = require("../utils/ApiError");
const logger = require("../config/logger");
const { parsePagination } = require("../utils/pagination");
const { buildPaginationMeta } = require("../utils/apiResponse");
const { RESPONSE_ACTIVITY_TYPES } = require("../validators/enums");

/**
 * Speed-to-Lead core logic: an activity counts as the agent's first real
 * response when it is CALL / WHATSAPP / EMAIL. Only OUTBOUND (or
 * direction-less, e.g. a logged phone CALL) activities count - an INBOUND
 * WhatsApp/email from the lead is not "the agent responding".
 *
 * If the lead's firstResponseAt is still null, this stamps it, flips
 * responseStatus to RESPONDED, and fires a best-effort n8n notification.
 */
async function maybeMarkLeadResponded(lead, activity) {
  if (!lead || lead.firstResponseAt) return lead;
  if (!RESPONSE_ACTIVITY_TYPES.includes(activity.type)) return lead;
  if (activity.direction === "INBOUND") return lead;

  const now = new Date();
  const updated = await leadRepository.updateInOrg(lead.id, lead.organizationId, {
    firstResponseAt: now,
    responseStatus: "RESPONDED",
  });

  if (updated) {
    logger.info({ leadId: lead.id, activityType: activity.type }, "Lead first response recorded (speed-to-lead)");
    n8nService.notifyLeadResponded(updated).catch(() => {});
  }

  return updated || lead;
}

async function createActivity(organizationId, userId, data) {
  const contact = await contactRepository.findByIdInOrg(data.contactId, organizationId);
  if (!contact) throw ApiError.notFound("Contact not found", "CONTACT_NOT_FOUND");

  let lead = null;
  if (data.leadId) {
    lead = await leadRepository.findByIdInOrg(data.leadId, organizationId);
    if (!lead) throw ApiError.notFound("Lead not found", "LEAD_NOT_FOUND");
  }

  const activity = await activityRepository.create({
    organizationId,
    contactId: data.contactId,
    leadId: data.leadId || null,
    userId: userId || null,
    type: data.type,
    direction: data.direction || null,
    description: data.description,
    metadata: data.metadata || undefined,
  });

  if (lead) {
    await maybeMarkLeadResponded(lead, activity);
  }

  return activity;
}

async function listActivities(organizationId, query) {
  const { page, limit, skip, take } = parsePagination(query);
  const where = {};
  if (query.contactId) where.contactId = query.contactId;
  if (query.leadId) where.leadId = query.leadId;
  if (query.type) where.type = query.type;

  const [items, total] = await activityRepository.list(organizationId, { where, skip, take });
  return { items, pagination: buildPaginationMeta({ page, limit, total }) };
}

async function listActivitiesForContact(organizationId, contactId, query) {
  const contact = await contactRepository.findByIdInOrg(contactId, organizationId);
  if (!contact) throw ApiError.notFound("Contact not found", "CONTACT_NOT_FOUND");

  const { page, limit, skip, take } = parsePagination(query);
  const [items, total] = await activityRepository.listByContact(contactId, organizationId, { skip, take });
  return { items, pagination: buildPaginationMeta({ page, limit, total }) };
}

module.exports = { createActivity, listActivities, listActivitiesForContact, maybeMarkLeadResponded };
