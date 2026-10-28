const ApiError = require("../utils/ApiError");

/**
 * Basic Role Based Access Control.
 *
 * ADMIN   - full access to their organization.
 * MANAGER - access to most organization data and all agents.
 * AGENT   - access restricted to records relevant to them (enforced at the
 *           query layer via scopeForUser helpers below, not just here).
 *
 * requireRole(...roles) is a coarse gate for endpoints that should only be
 * reachable by certain roles at all (e.g. user management).
 */
function requireRole(...allowedRoles) {
  return function roleGuard(req, res, next) {
    if (!req.user) {
      return next(ApiError.unauthorized());
    }
    if (!allowedRoles.includes(req.user.role)) {
      return next(ApiError.forbidden("You do not have permission to perform this action", "FORBIDDEN_ROLE"));
    }
    next();
  };
}

const isManagerOrAdmin = (role) => role === "ADMIN" || role === "MANAGER";

/**
 * Returns a Prisma "where" fragment that scopes a query to what the
 * current user is allowed to see, on top of the organizationId scope that
 * is always applied. ADMIN/MANAGER see everything in the org; AGENT is
 * restricted to records assigned/owned by them.
 *
 * `assignedField` is the field name on the model that represents "owned by
 * this user" (e.g. "assignedUserId" for Lead/Task, "ownerId" for Deal).
 * Pass null to skip scoping (e.g. resources without a clear owner).
 */
function scopeForUser(user, assignedField) {
  if (!assignedField || isManagerOrAdmin(user.role)) {
    return {};
  }
  return { [assignedField]: user.id };
}

module.exports = { requireRole, scopeForUser };
