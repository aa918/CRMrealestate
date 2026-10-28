const { Router } = require("express");
const publicLeadController = require("../controllers/publicLead.controller");
const { resolvePublicOrganization } = require("../middleware/apiKey.middleware");
const { validate } = require("../middleware/validation.middleware");
const { publicLeadSchema } = require("../validators/publicLead.validator");
const { publicLeadLimiter } = require("../middleware/rateLimit.middleware");

const router = Router();

router.post(
  "/leads",
  publicLeadLimiter,
  resolvePublicOrganization,
  validate(publicLeadSchema),
  publicLeadController.submitPublicLead
);

module.exports = router;
