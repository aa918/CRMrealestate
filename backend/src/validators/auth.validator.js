const { z } = require("zod");

// Public self-registration always creates a brand new Organization plus
// its first ADMIN user - this is the "sign up my agency" flow. Adding
// further teammates (managers/agents) to an existing organization is done
// by an authenticated admin/manager via POST /api/users, never by a
// client-supplied organizationId here (that would let anyone join anyone
// else's tenant).
const registerSchema = z.object({
  organizationName: z.string().min(2, "organizationName must be at least 2 characters").max(200),
  organizationPhone: z.string().min(6).max(30).optional(),
  organizationEmail: z.string().email().toLowerCase().optional(),
  firstName: z.string().min(1).max(100),
  lastName: z.string().min(1).max(100),
  email: z.string().email().toLowerCase(),
  password: z.string().min(8, "Password must be at least 8 characters"),
  phone: z.string().min(6).max(30).optional(),
});

const loginSchema = z.object({
  email: z.string().email().toLowerCase(),
  password: z.string().min(1, "Password is required"),
});

module.exports = { registerSchema, loginSchema };
