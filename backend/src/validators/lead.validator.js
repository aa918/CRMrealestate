const { z } = require("zod");
const {
  LEAD_SOURCE,
  LEAD_STATUS,
  RESPONSE_STATUS,
  INTEREST_TYPE,
  PROPERTY_KIND,
} = require("./enums");

// A lead always needs a contact. Callers may either point at an existing
// Contact, or supply enough contact info for the service to find-or-create
// one (this is also what the public lead endpoint and Facebook ingestion
// pipeline reuse under the hood).
const createLeadSchema = z
  .object({
    contactId: z.string().min(1).optional(),
    firstName: z.string().min(1).max(100).optional(),
    lastName: z.string().max(100).optional(),
    phone: z.string().min(6).max(30).optional(),
    email: z.string().email().toLowerCase().optional(),

    source: z.enum(LEAD_SOURCE).default("MANUAL"),
    status: z.enum(LEAD_STATUS).optional(),
    interestType: z.enum(INTEREST_TYPE).optional(),
    propertyType: z.enum(PROPERTY_KIND).optional(),
    city: z.string().max(100).optional(),
    budget: z.coerce.number().nonnegative().optional(),
    bedrooms: z.coerce.number().int().nonnegative().optional(),
    message: z.string().max(5000).optional(),
    assignedUserId: z.string().min(1).optional(),
  })
  .refine((data) => data.contactId || (data.firstName && data.phone), {
    message: "Provide either contactId, or firstName + phone to create a new contact",
    path: ["contactId"],
  });

const updateLeadSchema = z.object({
  status: z.enum(LEAD_STATUS).optional(),
  responseStatus: z.enum(RESPONSE_STATUS).optional(),
  assignedUserId: z.string().min(1).nullable().optional(),
  interestType: z.enum(INTEREST_TYPE).nullable().optional(),
  propertyType: z.enum(PROPERTY_KIND).nullable().optional(),
  city: z.string().max(100).nullable().optional(),
  budget: z.coerce.number().nonnegative().nullable().optional(),
  bedrooms: z.coerce.number().int().nonnegative().nullable().optional(),
  message: z.string().max(5000).nullable().optional(),
});

const listLeadsQuerySchema = z.object({
  status: z.enum(LEAD_STATUS).optional(),
  source: z.enum(LEAD_SOURCE).optional(),
  responseStatus: z.enum(RESPONSE_STATUS).optional(),
  assignedUserId: z.string().optional(),
  contactId: z.string().optional(),
  city: z.string().optional(),
  search: z.string().max(200).optional(),
  dateFrom: z.coerce.date().optional(),
  dateTo: z.coerce.date().optional(),
  sortBy: z.enum(["receivedAt", "createdAt", "budget"]).default("receivedAt"),
  sortOrder: z.enum(["asc", "desc"]).default("desc"),
  page: z.coerce.number().int().min(1).optional(),
  limit: z.coerce.number().int().min(1).max(100).optional(),
});

module.exports = { createLeadSchema, updateLeadSchema, listLeadsQuerySchema };
