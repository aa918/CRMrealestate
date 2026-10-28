const asyncHandler = require("../utils/asyncHandler");
const { ok, created, paginated, noContent } = require("../utils/apiResponse");
const contactService = require("../services/contact.service");

const list = asyncHandler(async (req, res) => {
  const { items, pagination } = await contactService.listContacts(req.user.organizationId, req.query);
  paginated(res, items, pagination);
});

const getById = asyncHandler(async (req, res) => {
  const contact = await contactService.getContact(req.user.organizationId, req.params.id);
  ok(res, contact);
});

const create = asyncHandler(async (req, res) => {
  const contact = await contactService.createContact(req.user.organizationId, req.body);
  created(res, contact);
});

const update = asyncHandler(async (req, res) => {
  const contact = await contactService.updateContact(req.user.organizationId, req.params.id, req.body);
  ok(res, contact);
});

const remove = asyncHandler(async (req, res) => {
  await contactService.deleteContact(req.user.organizationId, req.params.id);
  noContent(res);
});

module.exports = { list, getById, create, update, remove };
