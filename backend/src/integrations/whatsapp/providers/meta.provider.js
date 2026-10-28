const axios = require("axios");
const { env } = require("../../../config/env");
const logger = require("../../../config/logger");

/**
 * Real Meta WhatsApp Cloud API provider. Only used once
 * WHATSAPP_ACCESS_TOKEN and WHATSAPP_PHONE_NUMBER_ID are configured.
 * https://developers.facebook.com/docs/whatsapp/cloud-api/reference/messages
 */
async function sendTextMessage(phone, message) {
  const url = `https://graph.facebook.com/${env.WHATSAPP_API_VERSION}/${env.WHATSAPP_PHONE_NUMBER_ID}/messages`;

  try {
    const response = await axios.post(
      url,
      {
        messaging_product: "whatsapp",
        to: phone,
        type: "text",
        text: { body: message },
      },
      {
        headers: {
          Authorization: `Bearer ${env.WHATSAPP_ACCESS_TOKEN}`,
          "Content-Type": "application/json",
        },
        timeout: 10000,
      }
    );

    const messageId = response.data?.messages?.[0]?.id;
    logger.info({ provider: "whatsapp-meta", phone, messageId }, "WhatsApp message sent");
    return { provider: "meta", success: true, messageId };
  } catch (err) {
    logger.error(
      { provider: "whatsapp-meta", phone, err: err.response?.data || err.message },
      "WhatsApp message failed to send"
    );
    return { provider: "meta", success: false, error: err.message };
  }
}

module.exports = { sendTextMessage };
