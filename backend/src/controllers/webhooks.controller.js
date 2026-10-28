const asyncHandler = require("../utils/asyncHandler");
const { ok } = require("../utils/apiResponse");
const ApiError = require("../utils/ApiError");
const facebookService = require("../integrations/facebook/facebook.service");
const facebookLeadService = require("../services/facebookLead.service");
const logger = require("../config/logger");

/**
 * GET /api/webhooks/facebook - Meta's webhook subscription verification
 * handshake: https://developers.facebook.com/docs/graph-api/webhooks/getting-started
 */
const verifyFacebookWebhook = (req, res) => {
  const mode = req.query["hub.mode"];
  const token = req.query["hub.verify_token"];
  const challenge = req.query["hub.challenge"];

  const result = facebookService.verifySubscription(mode, token, challenge);
  if (result !== null) {
    logger.info("Facebook webhook verification succeeded");
    return res.status(200).send(result);
  }

  logger.warn({ mode }, "Facebook webhook verification failed");
  return res.status(403).json({
    success: false,
    error: { code: "FACEBOOK_VERIFICATION_FAILED", message: "Verification token mismatch" },
  });
};

/**
 * POST /api/webhooks/facebook - real Meta Lead Ads webhook receiver.
 */
const receiveFacebookWebhook = asyncHandler(async (req, res) => {
  const signature = req.headers["x-hub-signature-256"];
  const rawBody = req.rawBody || Buffer.from(JSON.stringify(req.body));

  if (!facebookService.verifySignature(rawBody, signature)) {
    logger.warn("Facebook webhook signature verification failed");
    throw ApiError.unauthorized("Invalid webhook signature", "INVALID_FACEBOOK_SIGNATURE");
  }

  // Acknowledge immediately per Meta's requirements, then process.
  res.status(200).json({ success: true });

  try {
    await facebookLeadService.processWebhookPayload(req.body);
  } catch (err) {
    logger.error({ err: err.message }, "Error processing Facebook webhook payload");
  }
});

/**
 * POST /api/webhooks/facebook/simulate - development-only helper that lets
 * us drive the full Facebook -> Contact -> Lead -> Assignment -> Task ->
 * n8n pipeline without real Meta credentials or a public HTTPS callback.
 * Protected by INTERNAL_API_KEY (see routes).
 */
const simulateFacebookLead = asyncHandler(async (req, res) => {
  const { organizationId, pageId, formId, leadgenId, fieldData } = req.body;

  const generatedLeadgenId = leadgenId || `sim-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;

  const fieldDataHint = [
    { name: "first_name", values: [fieldData.firstName] },
    { name: "last_name", values: [fieldData.lastName || ""] },
    { name: "phone_number", values: [fieldData.phone] },
    { name: "email", values: [fieldData.email || ""] },
    { name: "city", values: [fieldData.city || ""] },
  ];

  const result = await facebookLeadService.processLeadgenEvent({
    pageId,
    formId,
    leadgenId: generatedLeadgenId,
    fieldDataHint,
    organizationIdHint: organizationId,
  });

  ok(res, result);
});

module.exports = { verifyFacebookWebhook, receiveFacebookWebhook, simulateFacebookLead };
