const { z } = require("zod");

const paginationQuerySchema = z.object({
  page: z.coerce.number().int().min(1).optional(),
  limit: z.coerce.number().int().min(1).max(100).optional(),
});

const cuidParamSchema = z.object({
  id: z.string().min(1, "id is required"),
});

const dateRangeSchema = z.object({
  from: z.coerce.date().optional(),
  to: z.coerce.date().optional(),
});

module.exports = { paginationQuerySchema, cuidParamSchema, dateRangeSchema };
