const asyncHandler = require("../utils/asyncHandler");
const { ok, created, paginated } = require("../utils/apiResponse");
const userService = require("../services/user.service");
const ApiError = require("../utils/ApiError");

const list = asyncHandler(async (req, res) => {
  const { items, pagination } = await userService.listUsers(req.user.organizationId, req.query);
  paginated(res, items, pagination);
});

const getById = asyncHandler(async (req, res) => {
  const user = await userService.getUser(req.user.organizationId, req.params.id);
  ok(res, user);
});

const create = asyncHandler(async (req, res) => {
  const user = await userService.createUser(req.user.organizationId, req.body);
  created(res, user);
});

const update = asyncHandler(async (req, res) => {
  // Agents may only update their own profile, and never their own role/isActive.
  const isSelf = req.params.id === req.user.id;
  const isPrivileged = req.user.role === "ADMIN" || req.user.role === "MANAGER";

  if (!isSelf && !isPrivileged) {
    throw ApiError.forbidden("You can only update your own profile", "FORBIDDEN_USER_UPDATE");
  }

  const payload = { ...req.body };
  if (!isPrivileged) {
    delete payload.role;
    delete payload.isActive;
  }

  const user = await userService.updateUser(req.user.organizationId, req.params.id, payload);
  ok(res, user);
});

module.exports = { list, getById, create, update };
