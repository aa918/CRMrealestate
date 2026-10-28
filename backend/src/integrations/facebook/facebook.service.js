const crypto = require("crypto");
const axios = require("axios");
const { env } = require("../../config/env");
const logger = require("../../config/logger");

const isConfigured = Boolean(env.FACEBOOK_ACCESS_TOKEN && env.FACEBOOK_APP_SECRET);

/**
 * Verifies Meta's X-Hub-Signature-256 header against the raw request body
 * using FACEBOOK_APP_SECRET (HMAC SHA-256). In development, when no app
 * secret is configured yet, verification is skipped so the flow can still
 * be exercised with mock payloads.
 */
function verifySignature(rawBody, signatureHeader) {
  if (!env.FACEBOOK_APP_SECRET) {
    return true;
  }
  if (!signatureHeader) return false;

  const expected =
    "sha256=" + crypto.createHmac("sha256", env.FACEBOOK_APP_SECRET).update(rawBody).digest("hex");

  const provided = Buffer.from(signatureHeader);
  const expectedBuf = Buffer.from(expected);
  if (provided.length !== expectedBuf.length) return false;
  return crypto.timingSafeEqual(provided, expectedBuf);
}

function verifySubscription(mode, token, challenge) {
  if (mode === "subscribe" && token && env.FACEBOOK_VERIFY_TOKEN && token === env.FACEBOOK_VERIFY_TOKEN) {
    return challenge;
  }
  return null;
}

/**
 * Fetches full lead details from the Graph API for a given leadgen ID.
 * https://developers.facebook.com/docs/marketing-api/guides/lead-ads/retrieving
 *
 * Without real credentials this returns a clearly-labeled mock payload so
 * the ingestion pipeline (Contact/Lead/Task/Activity/n8n) can be fully
 * exercised in development.
 */
async function fetchLeadData(leadgenId, fieldDataHint) {
  if (!isConfigured) {
    logger.info({ leadgenId }, "[MOCK] Facebook Graph API not configured - returning mock lead data");
    return {
      mock: true,
      id: leadgenId,
      field_data: fieldDataHint || [
        { name: "first_name", values: ["Facebook"] },
        { name: "last_name", values: ["Lead"] },
        { name: "phone_number", values: ["0500000000"] },
        { name: "email", values: ["facebook.lead@example.com"] },
      ],
    };
  }

  try {
    const url = `https://graph.facebook.com/${env.FACEBOOK_GRAPH_API_VERSION}/${leadgenId}`;
    const response = await axios.get(url, {
      params: { access_token: env.FACEBOOK_ACCESS_TOKEN },
      timeout: 10000,
    });
    return response.data;
  } catch (err) {
    logger.error({ leadgenId, err: err.response?.data || err.message }, "Failed to fetch Facebook lead data");
    throw err;
  }
}

/**
 * Normalizes Facebook's field_data array (or our mock shape) into a flat
 * { firstName, lastName, phone, email, city } object usable by the lead
 * ingestion pipeline.
 */
function normalizeFieldData(fbLeadData) {
  const fields = {};
  for (const entry of fbLeadData.field_data || []) {
    fields[entry.name] = entry.values?.[0];
  }
  return {
    firstName: fields.first_name || fields.full_name || "Facebook",
    lastName: fields.last_name || "",
    phone: fields.phone_number || fields.phone,
    email: fields.email,
    city: fields.city,
  };
}

module.exports = { isConfigured, verifySignature, verifySubscription, fetchLeadData, normalizeFieldData };
