const { env } = require("../../config/env");
const logger = require("../../config/logger");
const mockProvider = require("./providers/mock.provider");
const metaProvider = require("./providers/meta.provider");
const integrationLogRepository = require("../../repositories/integrationLog.repository");

const isConfigured = Boolean(env.WHATSAPP_ACCESS_TOKEN && env.WHATSAPP_PHONE_NUMBER_ID);
const provider = isConfigured ? metaProvider : mockProvider;

if (!isConfigured) {
  logger.info("WhatsAppService running in MOCK mode (no WHATSAPP_ACCESS_TOKEN/WHATSAPP_PHONE_NUMBER_ID configured)");
}

/**
 * Public interface for the rest of the app. Swapping providers (Meta,
 * Twilio, etc.) or adding retry/queueing logic later only touches this
 * file, never the callers.
 *
 * Every attempt is recorded in IntegrationLog (organizationId optional -
 * the test endpoint and future automated sends both pass it through) so
 * the Automations UI never has to assume success from a button click.
 */
async function sendTextMessage(phone, message, { organizationId } = {}) {
  if (!phone || !message) {
    throw new Error("sendTextMessage requires both phone and message");
  }

  const result = await provider.sendTextMessage(phone, message);

  await integrationLogRepository
    .create({
      organizationId,
      integration: "WHATSAPP",
      event: isConfigured ? "whatsapp.send" : "whatsapp.send.mock",
      success: Boolean(result.success),
      errorMessage: result.success ? null : result.error || "unknown error",
      metadata: { phone, provider: result.provider, messageId: result.messageId },
    })
    .catch((err) => logger.error({ err: err.message }, "Failed to write integration log"));

  return result;
}

module.exports = { sendTextMessage, isConfigured };
