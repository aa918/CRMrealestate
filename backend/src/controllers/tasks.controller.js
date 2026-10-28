const asyncHandler = require("../utils/asyncHandler");
const { ok, created, paginated, noContent } = require("../utils/apiResponse");
const taskService = require("../services/task.service");
const { scopeForUser } = require("../middleware/rbac.middleware");

const list = asyncHandler(async (req, res) => {
  const scope = scopeForUser(req.user, "assignedUserId");
  const { items, pagination } = await taskService.listTasks(req.user.organizationId, req.query, scope);
  paginated(res, items, pagination);
});

const today = asyncHandler(async (req, res) => {
  const scope = scopeForUser(req.user, "assignedUserId");
  const items = await taskService.listTasksDueToday(req.user.organizationId, scope);
  ok(res, items);
});

const getById = asyncHandler(async (req, res) => {
  const task = await taskService.getTask(req.user.organizationId, req.params.id);
  ok(res, task);
});

const create = asyncHandler(async (req, res) => {
  const payload = { ...req.body, assignedUserId: req.body.assignedUserId || req.user.id };
  const task = await taskService.createTask(req.user.organizationId, payload);
  created(res, task);
});

const update = asyncHandler(async (req, res) => {
  const task = await taskService.updateTask(req.user.organizationId, req.params.id, req.body);
  ok(res, task);
});

const remove = asyncHandler(async (req, res) => {
  await taskService.deleteTask(req.user.organizationId, req.params.id);
  noContent(res);
});

module.exports = { list, today, getById, create, update, remove };
