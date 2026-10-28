const { z } = require("zod");

const testWhatsAppMessageSchema = z.object({
  phone: z.string().min(6).max(30),
  message: z.string().min(1).max(4096),
});

module.exports = { testWhatsAppMessageSchema };
