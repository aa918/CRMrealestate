const { z } = require("zod");

const listIntegrationLogsQuerySchema = z.object({
  integration: z.enum(["N8N", "WHATSAPP", "FACEBOOK"]).optional(),
  page: z.coerce.number().int().min(1).optional(),
  limit: z.coerce.number().int().min(1).max(100).optional(),
});

module.exports = { listIntegrationLogsQuerySchema };
