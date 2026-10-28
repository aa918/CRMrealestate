const path = require("path");
const dotenv = require("dotenv");
const { z } = require("zod");

dotenv.config({ path: path.resolve(process.cwd(), ".env") });
if (process.env.NODE_ENV === "test") {
  // Lets the test suite point at a dedicated test database / secrets
  // without touching the developer's regular .env.
  dotenv.config({ path: path.resolve(process.cwd(), ".env.test"), override: true });
}

const isTest = process.env.NODE_ENV === "test";

const envSchema = z.object({
  PORT: z.coerce.number().default(3000),
  NODE_ENV: z.enum(["development", "test", "production"]).default("development"),

  DATABASE_URL: z.string().min(1, "DATABASE_URL is required"),

  JWT_SECRET: z.string().min(1, "JWT_SECRET is required"),
  JWT_EXPIRES_IN: z.string().default("7d"),

  LEAD_RESPONSE_SLA_MINUTES: z.coerce.number().int().positive().default(15),

  N8N_LEAD_WEBHOOK_URL: z.string().optional().default(""),
  N8N_API_SECRET: z.string().optional().default(""),

  INTERNAL_API_KEY: z.string().optional().default(""),
  PUBLIC_LEAD_API_KEY: z.string().optional().default(""),

  FACEBOOK_VERIFY_TOKEN: z.string().optional().default(""),
  FACEBOOK_APP_SECRET: z.string().optional().default(""),
  FACEBOOK_ACCESS_TOKEN: z.string().optional().default(""),
  FACEBOOK_GRAPH_API_VERSION: z.string().optional().default("v20.0"),

  WHATSAPP_ACCESS_TOKEN: z.string().optional().default(""),
  WHATSAPP_PHONE_NUMBER_ID: z.string().optional().default(""),
  WHATSAPP_API_VERSION: z.string().optional().default("v20.0"),

  CORS_ORIGINS: z.string().optional().default(""),
});

const parsed = envSchema.safeParse(process.env);

if (!parsed.success) {
  // Fail fast and loud - a misconfigured backend should never boot silently.
  // eslint-disable-next-line no-console
  console.error("Invalid environment configuration:", parsed.error.flatten().fieldErrors);
  if (!isTest) {
    process.exit(1);
  }
  throw new Error("Invalid environment configuration");
}

const data = parsed.data;

const missingIntegrationWarnings = [];
if (!data.N8N_LEAD_WEBHOOK_URL) missingIntegrationWarnings.push("N8N_LEAD_WEBHOOK_URL not set - n8n webhook calls will be skipped (logged only).");
if (!data.WHATSAPP_ACCESS_TOKEN || !data.WHATSAPP_PHONE_NUMBER_ID) missingIntegrationWarnings.push("WhatsApp credentials not set - WhatsAppService will run in MOCK mode.");
if (!data.FACEBOOK_APP_SECRET || !data.FACEBOOK_ACCESS_TOKEN) missingIntegrationWarnings.push("Facebook credentials not set - Facebook Graph API calls will run in MOCK mode.");

module.exports = {
  env: data,
  isProduction: data.NODE_ENV === "production",
  isDevelopment: data.NODE_ENV === "development",
  isTest: data.NODE_ENV === "test",
  missingIntegrationWarnings,
  corsOrigins: data.CORS_ORIGINS
    ? data.CORS_ORIGINS.split(",").map((s) => s.trim()).filter(Boolean)
    : [],
};
