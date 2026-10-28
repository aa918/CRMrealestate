const { z } = require("zod");
const { ROLE } = require("./enums");

const createUserSchema = z.object({
  firstName: z.string().min(1).max(100),
  lastName: z.string().min(1).max(100),
  email: z.string().email().toLowerCase(),
  password: z.string().min(8),
  phone: z.string().min(6).max(30).optional(),
  role: z.enum(ROLE).default("AGENT"),
});

const updateUserSchema = z.object({
  firstName: z.string().min(1).max(100).optional(),
  lastName: z.string().min(1).max(100).optional(),
  phone: z.string().min(6).max(30).nullable().optional(),
  role: z.enum(ROLE).optional(),
  isActive: z.boolean().optional(),
  password: z.string().min(8).optional(),
});

const listUsersQuerySchema = z.object({
  role: z.enum(ROLE).optional(),
  isActive: z.coerce.boolean().optional(),
  page: z.coerce.number().int().min(1).optional(),
  limit: z.coerce.number().int().min(1).max(100).optional(),
});

module.exports = { createUserSchema, updateUserSchema, listUsersQuerySchema };
