const asyncHandler = require("../utils/asyncHandler");
const { ok, created, paginated, noContent } = require("../utils/apiResponse");
const propertyService = require("../services/property.service");

const list = asyncHandler(async (req, res) => {
  const { items, pagination } = await propertyService.listProperties(req.user.organizationId, req.query);
  paginated(res, items, pagination);
});

const getById = asyncHandler(async (req, res) => {
  const property = await propertyService.getProperty(req.user.organizationId, req.params.id);
  ok(res, property);
});

const create = asyncHandler(async (req, res) => {
  const property = await propertyService.createProperty(req.user.organizationId, req.body);
  created(res, property);
});

const update = asyncHandler(async (req, res) => {
  const property = await propertyService.updateProperty(req.user.organizationId, req.params.id, req.body);
  ok(res, property);
});

const remove = asyncHandler(async (req, res) => {
  await propertyService.deleteProperty(req.user.organizationId, req.params.id);
  noContent(res);
});

module.exports = { list, getById, create, update, remove };
