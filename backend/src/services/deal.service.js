const dealRepository = require("../repositories/deal.repository");
const leadRepository = require("../repositories/lead.repository");
const activityRepository = require("../repositories/activity.repository");
const ApiError = require("../utils/ApiError");
const { parsePagination } = require("../utils/pagination");
const { buildPaginationMeta } = require("../utils/apiResponse");

async function createDeal(organizationId, data, actorUserId) {
  return dealRepository.create({
    organizationId,
    contactId: data.contactId,
    leadId: data.leadId || null,
    propertyId: data.propertyId || null,
    ownerId: data.ownerId || actorUserId,
    title: data.title,
    value: data.value,
    stage: data.stage || "OPEN",
    probability: data.probability ?? 0,
    expectedCloseDate: data.expectedCloseDate || null,
  });
}

async function getDeal(organizationId, id, scope = {}) {
  const deal = await dealRepository.findByIdInOrg(id, organizationId);
  if (!deal) throw ApiError.notFound("Deal not found", "DEAL_NOT_FOUND");
  if (scope.ownerId && deal.ownerId !== scope.ownerId) {
    throw ApiError.forbidden("You do not have access to this deal", "DEAL_ACCESS_DENIED");
  }
  return deal;
}

/**
 * When a Deal is WON/LOST, the linked Lead (if any) is kept in sync:
 * a won deal means the lead's journey ended in a sale, a lost deal means
 * the lead is closed out as lost. This is the two-way half of the flow
 * described for section 16 of the spec.
 */
async function syncLeadOnDealClose(organizationId, deal) {
  if (!deal.leadId) return;

  const lead = await leadRepository.findByIdInOrg(deal.leadId, organizationId);
  if (!lead) return;

  await leadRepository.updateInOrg(lead.id, organizationId, {
    status: deal.stage,
    closedAt: deal.closedAt,
  });

  await activityRepository.create({
    organizationId,
    contactId: lead.contactId,
    leadId: lead.id,
    type: "STATUS_CHANGED",
    description: `Lead automatically marked ${deal.stage} because linked deal "${deal.title}" was closed as ${deal.stage}`,
    metadata: { dealId: deal.id },
  });
}

async function updateDeal(organizationId, id, data, scope = {}) {
  await getDeal(organizationId, id, scope);

  const payload = { ...data };
  if (payload.stage && ["WON", "LOST"].includes(payload.stage) && !payload.closedAt) {
    payload.closedAt = new Date();
  }

  const deal = await dealRepository.updateInOrg(id, organizationId, payload);
  if (!deal) throw ApiError.notFound("Deal not found", "DEAL_NOT_FOUND");

  if (data.stage && ["WON", "LOST"].includes(data.stage)) {
    await syncLeadOnDealClose(organizationId, deal);
  }

  return deal;
}

async function deleteDeal(organizationId, id) {
  const result = await dealRepository.remove(id, organizationId);
  if (result.count === 0) throw ApiError.notFound("Deal not found", "DEAL_NOT_FOUND");
}

async function listDeals(organizationId, query, scope = {}) {
  const { page, limit, skip, take } = parsePagination(query);
  const where = { ...scope };
  if (query.stage) where.stage = query.stage;
  if (query.ownerId) where.ownerId = query.ownerId;
  if (query.contactId) where.contactId = query.contactId;
  if (query.leadId) where.leadId = query.leadId;

  const [items, total] = await dealRepository.list(organizationId, { where, skip, take });
  return { items, pagination: buildPaginationMeta({ page, limit, total }) };
}

module.exports = { createDeal, getDeal, updateDeal, deleteDeal, listDeals };
