const { Router } = require("express");
const webhooksController = require("../controllers/webhooks.controller");
const { requireInternalApiKey } = require("../middleware/apiKey.middleware");
const { validate } = require("../middleware/validation.middleware");
const { simulateFacebookLeadSchema } = require("../validators/facebook.validator");
const { webhookLimiter } = require("../middleware/rateLimit.middleware");

const router = Router();

// Meta calls these without any auth of ours - security is the verify
// token (GET) / X-Hub-Signature-256 (POST) instead.
router.get("/facebook", webhooksController.verifyFacebookWebhook);
router.post("/facebook", webhookLimiter, webhooksController.receiveFacebookWebhook);

// Development helper to exercise the full Facebook -> CRM pipeline without
// real Meta credentials. Gated behind the internal API key so it can't be
// hit by the public internet.
router.post(
  "/facebook/simulate",
  requireInternalApiKey,
  validate(simulateFacebookLeadSchema),
  webhooksController.simulateFacebookLead
);

module.exports = router;
