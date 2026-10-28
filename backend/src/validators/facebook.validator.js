const { z } = require("zod");

// Used by the development "simulate" endpoint that lets us exercise the
// full Facebook Lead Ads flow without real Meta credentials.
const simulateFacebookLeadSchema = z.object({
  organizationId: z.string().min(1),
  pageId: z.string().min(1).default("mock-page-id"),
  formId: z.string().min(1).default("mock-form-id"),
  leadgenId: z.string().min(1).optional(),
  fieldData: z
    .object({
      firstName: z.string().min(1),
      lastName: z.string().max(100).optional(),
      phone: z.string().min(6),
      email: z.string().email().optional(),
      city: z.string().optional(),
    })
    .partial({ lastName: true, email: true, city: true }),
});

module.exports = { simulateFacebookLeadSchema };
