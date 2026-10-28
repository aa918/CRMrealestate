const { z } = require("zod");
const { LEAD_SOURCE, INTEREST_TYPE, PROPERTY_KIND } = require("./enums");

// Inbound lead from a public website form. Deliberately does NOT accept
// organizationId, assignedUserId or status - those are always derived
// server-side (organization from the API key, status/assignment from
// business logic) so a public client can never spoof them.
const publicLeadSchema = z.object({
  firstName: z.string().min(1).max(100),
  lastName: z.string().max(100).optional(),
  phone: z.string().min(6).max(30),
  email: z.string().email().toLowerCase().optional(),
  source: z.enum(LEAD_SOURCE).default("WEBSITE"),
  interestType: z.enum(INTEREST_TYPE).optional(),
  propertyType: z.enum(PROPERTY_KIND).optional(),
  city: z.string().max(100).optional(),
  budget: z.coerce.number().nonnegative().optional(),
  bedrooms: z.coerce.number().int().nonnegative().optional(),
  message: z.string().max(5000).optional(),
});

module.exports = { publicLeadSchema };
