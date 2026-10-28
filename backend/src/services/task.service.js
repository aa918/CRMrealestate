const taskRepository = require("../repositories/task.repository");
const ApiError = require("../utils/ApiError");
const { parsePagination } = require("../utils/pagination");
const { buildPaginationMeta } = require("../utils/apiResponse");

async function createTask(organizationId, data) {
  return taskRepository.create({
    organizationId,
    contactId: data.contactId || null,
    leadId: data.leadId || null,
    assignedUserId: data.assignedUserId,
    title: data.title,
    description: data.description || null,
    type: data.type,
    priority: data.priority,
    status: data.status || "OPEN",
    dueAt: data.dueAt,
  });
}

/**
 * Automatic FOLLOW_UP task created whenever a new lead comes in. If the
 * lead couldn't be auto-assigned to an agent yet, we still create the task
 * unassigned to a fallback owner is not possible (assignedUserId is
 * required on Task) - in that case we skip task creation and record why
 * via an Activity instead (see lead.service.js), which is a deliberate,
 * documented decision rather than a silent gap.
 */
async function createFollowUpTaskForLead(lead, slaMinutes) {
  if (!lead.assignedUserId) return null;

  const dueAt = new Date(new Date(lead.receivedAt).getTime() + slaMinutes * 60 * 1000);

  return taskRepository.create({
    organizationId: lead.organizationId,
    contactId: lead.contactId,
    leadId: lead.id,
    assignedUserId: lead.assignedUserId,
    title: "Contact new lead",
    description: `Follow up with ${lead.contact?.firstName || "the contact"} about their ${lead.interestType || ""} inquiry${lead.city ? ` in ${lead.city}` : ""}.`.trim(),
    type: "FOLLOW_UP",
    priority: "HIGH",
    status: "OPEN",
    dueAt,
  });
}

async function getTask(organizationId, id) {
  const task = await taskRepository.findByIdInOrg(id, organizationId);
  if (!task) throw ApiError.notFound("Task not found", "TASK_NOT_FOUND");
  return task;
}

async function updateTask(organizationId, id, data) {
  const payload = { ...data };
  if (payload.status === "DONE" && !payload.completedAt) {
    payload.completedAt = new Date();
  }
  const task = await taskRepository.updateInOrg(id, organizationId, payload);
  if (!task) throw ApiError.notFound("Task not found", "TASK_NOT_FOUND");
  return task;
}

async function deleteTask(organizationId, id) {
  const result = await taskRepository.remove(id, organizationId);
  if (result.count === 0) throw ApiError.notFound("Task not found", "TASK_NOT_FOUND");
}

function buildTaskWhere(query, scope) {
  const where = { ...scope };
  if (query.assignedUserId) where.assignedUserId = query.assignedUserId;
  if (query.leadId) where.leadId = query.leadId;
  if (query.contactId) where.contactId = query.contactId;
  if (query.status) where.status = query.status;
  if (query.type) where.type = query.type;
  if (query.priority) where.priority = query.priority;
  if (query.dueFrom || query.dueTo) {
    where.dueAt = {};
    if (query.dueFrom) where.dueAt.gte = query.dueFrom;
    if (query.dueTo) where.dueAt.lte = query.dueTo;
  }
  if (query.overdue) {
    where.status = { notIn: ["DONE", "CANCELLED"] };
    where.dueAt = { ...(where.dueAt || {}), lt: new Date() };
  }
  return where;
}

async function listTasks(organizationId, query, scope = {}) {
  const { page, limit, skip, take } = parsePagination(query);
  const where = buildTaskWhere(query, scope);
  const [items, total] = await taskRepository.list(organizationId, { where, skip, take });
  return { items, pagination: buildPaginationMeta({ page, limit, total }) };
}

async function listTasksDueToday(organizationId, scope = {}) {
  const now = new Date();
  const startOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const endOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 23, 59, 59, 999);

  const where = { ...scope, status: { notIn: ["DONE", "CANCELLED"] }, dueAt: { gte: startOfDay, lte: endOfDay } };
  const [items] = await taskRepository.list(organizationId, { where, skip: 0, take: 100 });
  return items;
}

module.exports = {
  createTask,
  createFollowUpTaskForLead,
  getTask,
  updateTask,
  deleteTask,
  listTasks,
  listTasksDueToday,
};
