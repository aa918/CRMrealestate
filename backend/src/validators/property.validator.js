const { z } = require("zod");
const { PROPERTY_KIND, TRANSACTION_TYPE, PROPERTY_STATUS } = require("./enums");

const createPropertySchema = z.object({
  title: z.string().min(1).max(200),
  description: z.string().max(10000).optional(),
  propertyType: z.enum(PROPERTY_KIND).default("APARTMENT"),
  transactionType: z.enum(TRANSACTION_TYPE).default("SALE"),
  city: z.string().min(1).max(100),
  address: z.string().max(300).optional(),
  price: z.coerce.number().nonnegative(),
  bedrooms: z.coerce.number().int().nonnegative().optional(),
  bathrooms: z.coerce.number().int().nonnegative().optional(),
  sizeSqm: z.coerce.number().int().nonnegative().optional(),
  status: z.enum(PROPERTY_STATUS).optional(),
});

const updatePropertySchema = z.object({
  title: z.string().min(1).max(200).optional(),
  description: z.string().max(10000).nullable().optional(),
  propertyType: z.enum(PROPERTY_KIND).optional(),
  transactionType: z.enum(TRANSACTION_TYPE).optional(),
  city: z.string().min(1).max(100).optional(),
  address: z.string().max(300).nullable().optional(),
  price: z.coerce.number().nonnegative().optional(),
  bedrooms: z.coerce.number().int().nonnegative().nullable().optional(),
  bathrooms: z.coerce.number().int().nonnegative().nullable().optional(),
  sizeSqm: z.coerce.number().int().nonnegative().nullable().optional(),
  status: z.enum(PROPERTY_STATUS).optional(),
});

const listPropertiesQuerySchema = z.object({
  city: z.string().optional(),
  transactionType: z.enum(TRANSACTION_TYPE).optional(),
  propertyType: z.enum(PROPERTY_KIND).optional(),
  status: z.enum(PROPERTY_STATUS).optional(),
  priceMin: z.coerce.number().nonnegative().optional(),
  priceMax: z.coerce.number().nonnegative().optional(),
  bedrooms: z.coerce.number().int().nonnegative().optional(),
  page: z.coerce.number().int().min(1).optional(),
  limit: z.coerce.number().int().min(1).max(100).optional(),
});

module.exports = { createPropertySchema, updatePropertySchema, listPropertiesQuerySchema };
