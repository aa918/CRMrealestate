const logger = require("../../../config/logger");

/**
 * Development/fallback provider used whenever WhatsApp Cloud API
 * credentials are not configured. Never throws, just logs what would
 * have been sent so the rest of the flow (n8n automations, tests) can
 * run end-to-end without real WhatsApp access.
 */
async function sendTextMessage(phone, message) {
  logger.info({ provider: "whatsapp-mock", phone, message }, "[MOCK] WhatsApp message would be sent");
  return {
    provider: "mock",
    success: true,
    messageId: `mock-${Date.now()}`,
  };
}

module.exports = { sendTextMessage };
