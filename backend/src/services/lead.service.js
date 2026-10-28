const leadRepository = require("../repositories/lead.repository");
const contactRepository = require("../repositories/contact.repository");
const contactService = require("./contact.service");
const activityRepository = require("../repositories/activity.repository");
const taskService = require("./task.service");
const leadAssignmentService = require("./leadAssignment.service");
const n8nService = require("../integrations/n8n/n8n.service");
const ApiError = require("../utils/ApiError");
const logger = require("../config/logger");
const { env } = require("../config/env");
const { parsePagination } = require("../utils/pagination");
const { buildPaginationMeta } = require("../utils/apiResponse");

/**
 * The single most important flow in the system:
 *
 *   normalize phone -> find/create Contact -> create Lead -> assign Agent
 *   -> create follow-up Task -> log LEAD_CREATED Activity -> notify n8n
 *
 * Used by the authenticated Leads API, the public lead form, and the
 * Facebook Lead Ads ingestion pipeline, so all three entry points share
 * identical, correct behavior.
 */
async function createLead(organizationId, data) {
  let contact;

  if (data.contactId) {
    contact = await contactRepository.findByIdInOrg(data.contactId, organizationId);
    if (!contact) throw ApiError.notFound("Contact not found", "CONTACT_NOT_FOUND");
  } else {
    const result = await contactService.findOrCreateContact(organizationId, {
      firstName: data.firstName,
      lastName: data.lastName,
      phone: data.phone,
      email: data.email,
    });
    contact = result.contact;
  }

  const receivedAt = new Date();

  let lead = await leadRepository.create({
    organizationId,
    contactId: contact.id,
    source: data.source || "MANUAL",
    status: data.status || "NEW",
    interestType: data.interestType || null,
    propertyType: data.propertyType || null,
    city: data.city || null,
    budget: data.budget ?? null,
    bedrooms: data.bedrooms ?? null,
    message: data.message || null,
    responseStatus: "WAITING",
    receivedAt,
  });

  // Manual assignment override (e.g. an admin creating a lead for a
  // specific agent) takes priority over automatic round-robin.
  let assignedAgent = null;
  if (data.assignedUserId) {
    assignedAgent = { id: data.assignedUserId };
  } else {
    assignedAgent = await leadAssignmentService.assignAgent(organizationId);
  }

  if (assignedAgent) {
    lead = await leadRepository.updateInOrg(lead.id, organizationId, {
      assignedUserId: assignedAgent.id,
      assignedAt: new Date(),
    });
  }

  await activityRepository.create({
    organizationId,
    contactId: contact.id,
    leadId: lead.id,
    userId: null,
    type: "LEAD_CREATED",
    description: `Lead created from ${lead.source} for ${contact.firstName} ${contact.lastName || ""}`.trim(),
    metadata: { source: lead.source },
  });

  const task = await taskService.createFollowUpTaskForLead(lead, env.LEAD_RESPONSE_SLA_MINUTES);

  if (task) {
    await activityRepository.create({
      organizationId,
      contactId: contact.id,
      leadId: lead.id,
      userId: null,
      type: "TASK_CREATED",
      description: `Follow-up task created for ${assignedAgent ? "assigned agent" : "the team"}, due ${task.dueAt.toISOString()}`,
      metadata: { taskId: task.id },
    });
  } else {
    // Documented decision: we do not create a Task without an owner
    // (assignedUserId is required on Task). This is recorded as a SYSTEM
    // activity rather than silently doing nothing.
    await activityRepository.create({
      organizationId,
      contactId: contact.id,
      leadId: lead.id,
      userId: null,
      type: "SYSTEM",
      description: "No active agent available - follow-up task was not created. Lead remains unassigned.",
    });
  }

  // Never let n8n being down/misconfigured fail lead creation.
  try {
    await n8nService.notifyLeadCreated(lead);
  } catch (err) {
    logger.error({ err: err.message, leadId: lead.id }, "n8n notification threw unexpectedly - ignoring");
  }

  return leadRepository.findByIdInOrg(lead.id, organizationId);
}

async function getLead(organizationId, id, scope = {}) {
  const lead = await leadRepository.findByIdInOrg(id, organizationId);
  if (!lead) throw ApiError.notFound("Lead not found", "LEAD_NOT_FOUND");
  if (scope.assignedUserId && lead.assignedUserId !== scope.assignedUserId) {
    throw ApiError.forbidden("You do not have access to this lead", "LEAD_ACCESS_DENIED");
  }
  return lead;
}

async function updateLead(organizationId, id, data, scope = {}) {
  await getLead(organizationId, id, scope);

  const payload = { ...data };
  if (payload.status && ["WON", "LOST"].includes(payload.status) && !payload.closedAt) {
    payload.closedAt = new Date();
  }

  const lead = await leadRepository.updateInOrg(id, organizationId, payload);
  if (!lead) throw ApiError.notFound("Lead not found", "LEAD_NOT_FOUND");

  if (data.status) {
    await activityRepository.create({
      organizationId,
      contactId: lead.contactId,
      leadId: lead.id,
      type: "STATUS_CHANGED",
      description: `Lead status changed to ${data.status}`,
      metadata: { status: data.status },
    });
  }

  return lead;
}

async function deleteLead(organizationId, id) {
  const result = await leadRepository.remove(id, organizationId);
  if (result.count === 0) throw ApiError.notFound("Lead not found", "LEAD_NOT_FOUND");
}

function buildLeadWhere(query, scope) {
  const where = { ...scope };
  if (query.status) where.status = query.status;
  if (query.source) where.source = query.source;
  if (query.responseStatus) where.responseStatus = query.responseStatus;
  if (query.assignedUserId) where.assignedUserId = query.assignedUserId;
  if (query.contactId) where.contactId = query.contactId;
  if (query.city) where.city = { contains: query.city, mode: "insensitive" };
  if (query.dateFrom || query.dateTo) {
    where.receivedAt = {};
    if (query.dateFrom) where.receivedAt.gte = query.dateFrom;
    if (query.dateTo) where.receivedAt.lte = query.dateTo;
  }
  if (query.search) {
    where.contact = {
      OR: [
        { firstName: { contains: query.search, mode: "insensitive" } },
        { lastName: { contains: query.search, mode: "insensitive" } },
        { phone: { contains: query.search } },
        { email: { contains: query.search, mode: "insensitive" } },
      ],
    };
  }
  return where;
}

async function listLeads(organizationId, query, scope = {}) {
  const { page, limit, skip, take } = parsePagination(query);
  const where = buildLeadWhere(query, scope);
  const orderBy = { [query.sortBy || "receivedAt"]: query.sortOrder || "desc" };

  const [items, total] = await leadRepository.list(organizationId, { where, orderBy, skip, take });
  return { items, pagination: buildPaginationMeta({ page, limit, total }) };
}

module.exports = { createLead, getLead, updateLead, deleteLead, listLeads };
