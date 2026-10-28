const { env } = require("../config/env");
const { prisma } = require("../config/database");
const organizationRepository = require("../repositories/organization.repository");
const ApiError = require("../utils/ApiError");
const asyncHandler = require("../utils/asyncHandler");

/**
 * Protects server-to-server endpoints (e.g. n8n-triggered SLA checks)
 * with a shared secret header. Used for /api/internal/*.
 */
function requireInternalApiKey(req, res, next) {
  const provided = req.headers["x-internal-api-key"];

  if (!env.INTERNAL_API_KEY) {
    return next(ApiError.internal("INTERNAL_API_KEY is not configured on the server", "INTERNAL_KEY_NOT_CONFIGURED"));
  }
  if (!provided || provided !== env.INTERNAL_API_KEY) {
    return next(ApiError.unauthorized("Invalid internal API key", "INVALID_INTERNAL_KEY"));
  }
  next();
}

/**
 * Resolves the Organization a public lead form request belongs to.
 * The client NEVER supplies organizationId directly - it is derived
 * from the API key:
 *   1) x-public-api-key matches an Organization.publicApiKey (per-tenant, recommended)
 *   2) x-public-api-key matches the global PUBLIC_LEAD_API_KEY env var (dev fallback,
 *      only works when exactly one organization exists, or organizationSlug hint is unused)
 */
const resolvePublicOrganization = asyncHandler(async (req, res, next) => {
  const providedKey = req.headers["x-public-api-key"] || req.query.apiKey;

  if (!providedKey) {
    throw ApiError.unauthorized("Missing x-public-api-key header", "MISSING_PUBLIC_API_KEY");
  }

  const org = await organizationRepository.findByPublicApiKey(String(providedKey));

  if (org) {
    if (!org.isActive) {
      throw ApiError.forbidden("Organization is inactive", "ORGANIZATION_INACTIVE");
    }
    req.organizationId = org.id;
    return next();
  }

  // Dev-mode fallback: a shared master key configured via env, useful for
  // quick local testing before per-organization keys are wired up.
  if (env.PUBLIC_LEAD_API_KEY && providedKey === env.PUBLIC_LEAD_API_KEY) {
    const fallbackOrg = await prisma.organization.findFirst({
      where: { isActive: true },
      orderBy: { createdAt: "asc" },
    });
    if (fallbackOrg) {
      req.organizationId = fallbackOrg.id;
      return next();
    }
  }

  throw ApiError.unauthorized("Invalid public API key", "INVALID_PUBLIC_API_KEY");
});

module.exports = { requireInternalApiKey, resolvePublicOrganization };
