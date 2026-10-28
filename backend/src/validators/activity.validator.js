const { z } = require("zod");
const { ACTIVITY_TYPE, ACTIVITY_DIRECTION } = require("./enums");

const createActivitySchema = z.object({
  contactId: z.string().min(1),
  leadId: z.string().min(1).optional(),
  type: z.enum(ACTIVITY_TYPE),
  direction: z.enum(ACTIVITY_DIRECTION).optional(),
  description: z.string().min(1).max(5000),
  metadata: z.record(z.any()).optional(),
});

const listActivitiesQuerySchema = z.object({
  contactId: z.string().optional(),
  leadId: z.string().optional(),
  type: z.enum(ACTIVITY_TYPE).optional(),
  page: z.coerce.number().int().min(1).optional(),
  limit: z.coerce.number().int().min(1).max(100).optional(),
});

module.exports = { createActivitySchema, listActivitiesQuerySchema };
