const { z } = require("zod");
const { TASK_TYPE, TASK_PRIORITY, TASK_STATUS } = require("./enums");

const createTaskSchema = z.object({
  contactId: z.string().min(1).optional(),
  leadId: z.string().min(1).optional(),
  assignedUserId: z.string().min(1).optional(),
  title: z.string().min(1).max(200),
  description: z.string().max(5000).optional(),
  type: z.enum(TASK_TYPE).default("OTHER"),
  priority: z.enum(TASK_PRIORITY).default("MEDIUM"),
  status: z.enum(TASK_STATUS).optional(),
  dueAt: z.coerce.date(),
});

const updateTaskSchema = z.object({
  title: z.string().min(1).max(200).optional(),
  description: z.string().max(5000).nullable().optional(),
  assignedUserId: z.string().min(1).optional(),
  type: z.enum(TASK_TYPE).optional(),
  priority: z.enum(TASK_PRIORITY).optional(),
  status: z.enum(TASK_STATUS).optional(),
  dueAt: z.coerce.date().optional(),
});

const listTasksQuerySchema = z.object({
  assignedUserId: z.string().optional(),
  leadId: z.string().optional(),
  contactId: z.string().optional(),
  status: z.enum(TASK_STATUS).optional(),
  type: z.enum(TASK_TYPE).optional(),
  priority: z.enum(TASK_PRIORITY).optional(),
  dueFrom: z.coerce.date().optional(),
  dueTo: z.coerce.date().optional(),
  overdue: z.coerce.boolean().optional(),
  page: z.coerce.number().int().min(1).optional(),
  limit: z.coerce.number().int().min(1).max(100).optional(),
});

module.exports = { createTaskSchema, updateTaskSchema, listTasksQuerySchema };
