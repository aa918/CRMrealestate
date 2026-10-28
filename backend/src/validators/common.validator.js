const { z } = require("zod");

const cuidParamSchema = z.object({
  id: z.string().min(1, "id is required"),
});

module.exports = { cuidParamSchema };
