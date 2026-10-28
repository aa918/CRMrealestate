const { Router } = require("express");
const integrationsController = require("../controllers/integrations.controller");
const { requireAuth } = require("../middleware/auth.middleware");
const { requireRole } = require("../middleware/rbac.middleware");
const { validate } = require("../middleware/validation.middleware");
const { testWhatsAppMessageSchema } = require("../validators/whatsapp.validator");
const { listIntegrationLogsQuerySchema } = require("../validators/integrations.validator");

const router = Router();

router.use(requireAuth);

// Read-only status/history - any authenticated team member can see what's
// connected and what last happened (useful on the Automations page).
router.get("/status", integrationsController.getStatus);
router.get("/logs", validate(listIntegrationLogsQuerySchema, "query"), integrationsController.getLogs);

// Actually sending a message is an admin/manager action.
router.post(
  "/whatsapp/test",
  requireRole("ADMIN", "MANAGER"),
  validate(testWhatsAppMessageSchema),
  integrationsController.testWhatsApp
);

module.exports = router;
