const asyncHandler = require("../utils/asyncHandler");
const { ok, created, paginated, noContent } = require("../utils/apiResponse");
const dealService = require("../services/deal.service");
const { scopeForUser } = require("../middleware/rbac.middleware");

const list = asyncHandler(async (req, res) => {
  const scope = scopeForUser(req.user, "ownerId");
  const { items, pagination } = await dealService.listDeals(req.user.organizationId, req.query, scope);
  paginated(res, items, pagination);
});

const getById = asyncHandler(async (req, res) => {
  const scope = scopeForUser(req.user, "ownerId");
  const deal = await dealService.getDeal(req.user.organizationId, req.params.id, scope);
  ok(res, deal);
});

const create = asyncHandler(async (req, res) => {
  const deal = await dealService.createDeal(req.user.organizationId, req.body, req.user.id);
  created(res, deal);
});

const update = asyncHandler(async (req, res) => {
  const scope = scopeForUser(req.user, "ownerId");
  const deal = await dealService.updateDeal(req.user.organizationId, req.params.id, req.body, scope);
  ok(res, deal);
});

const remove = asyncHandler(async (req, res) => {
  await dealService.deleteDeal(req.user.organizationId, req.params.id);
  noContent(res);
});

module.exports = { list, getById, create, update, remove };
