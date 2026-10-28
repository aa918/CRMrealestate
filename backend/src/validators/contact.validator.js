const { z } = require("zod");

const createContactSchema = z.object({
  firstName: z.string().min(1).max(100),
  lastName: z.string().max(100).optional(),
  phone: z.string().min(6, "phone is required").max(30),
  email: z.string().email().toLowerCase().optional().or(z.literal("").transform(() => undefined)),
  notes: z.string().max(5000).optional(),
});

const updateContactSchema = z.object({
  firstName: z.string().min(1).max(100).optional(),
  lastName: z.string().max(100).nullable().optional(),
  phone: z.string().min(6).max(30).optional(),
  email: z.string().email().toLowerCase().nullable().optional(),
  notes: z.string().max(5000).nullable().optional(),
});

const listContactsQuerySchema = z.object({
  search: z.string().max(200).optional(),
  phone: z.string().max(30).optional(),
  email: z.string().max(200).optional(),
  page: z.coerce.number().int().min(1).optional(),
  limit: z.coerce.number().int().min(1).max(100).optional(),
});

module.exports = { createContactSchema, updateContactSchema, listContactsQuerySchema };
