const { z } = require("zod");
const { DEAL_STAGE } = require("./enums");

const createDealSchema = z.object({
  contactId: z.string().min(1),
  leadId: z.string().min(1).optional(),
  propertyId: z.string().min(1).optional(),
  ownerId: z.string().min(1).optional(),
  title: z.string().min(1).max(200),
  value: z.coerce.number().nonnegative(),
  stage: z.enum(DEAL_STAGE).default("OPEN"),
  probability: z.coerce.number().int().min(0).max(100).default(0),
  expectedCloseDate: z.coerce.date().optional(),
});

const updateDealSchema = z.object({
  title: z.string().min(1).max(200).optional(),
  leadId: z.string().min(1).nullable().optional(),
  propertyId: z.string().min(1).nullable().optional(),
  ownerId: z.string().min(1).optional(),
  value: z.coerce.number().nonnegative().optional(),
  stage: z.enum(DEAL_STAGE).optional(),
  probability: z.coerce.number().int().min(0).max(100).optional(),
  expectedCloseDate: z.coerce.date().nullable().optional(),
});

const listDealsQuerySchema = z.object({
  stage: z.enum(DEAL_STAGE).optional(),
  ownerId: z.string().optional(),
  contactId: z.string().optional(),
  leadId: z.string().optional(),
  page: z.coerce.number().int().min(1).optional(),
  limit: z.coerce.number().int().min(1).max(100).optional(),
});

module.exports = { createDealSchema, updateDealSchema, listDealsQuerySchema };
