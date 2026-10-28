const asyncHandler = require("../utils/asyncHandler");
const { ok, created, paginated, noContent } = require("../utils/apiResponse");
const leadService = require("../services/lead.service");
const { scopeForUser } = require("../middleware/rbac.middleware");

const list = asyncHandler(async (req, res) => {
  const scope = scopeForUser(req.user, "assignedUserId");
  const { items, pagination } = await leadService.listLeads(req.user.organizationId, req.query, scope);
  paginated(res, items, pagination);
});

const getById = asyncHandler(async (req, res) => {
  const scope = scopeForUser(req.user, "assignedUserId");
  const lead = await leadService.getLead(req.user.organizationId, req.params.id, scope);
  ok(res, lead);
});

const create = asyncHandler(async (req, res) => {
  const lead = await leadService.createLead(req.user.organizationId, req.body);
  created(res, lead);
});

const update = asyncHandler(async (req, res) => {
  const scope = scopeForUser(req.user, "assignedUserId");
  const lead = await leadService.updateLead(req.user.organizationId, req.params.id, req.body, scope);
  ok(res, lead);
});

const remove = asyncHandler(async (req, res) => {
  await leadService.deleteLead(req.user.organizationId, req.params.id);
  noContent(res);
});

module.exports = { list, getById, create, update, remove };
