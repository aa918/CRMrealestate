const request = require("supertest");
const bcrypt = require("bcryptjs");
const app = require("../src/app");
const { prisma } = require("../src/config/database");

const DEFAULT_PASSWORD = "Password123!";

let counter = 0;
function uniqueEmail(prefix = "user") {
  counter += 1;
  return `${prefix}.${Date.now()}.${counter}@example.com`;
}

async function createOrganization(overrides = {}) {
  return prisma.organization.create({
    data: { name: overrides.name || "Test Agency", ...overrides },
  });
}

async function createUser(organizationId, overrides = {}) {
  const password = overrides.password || DEFAULT_PASSWORD;
  const passwordHash = await bcrypt.hash(password, 4); // low cost factor - tests only
  const user = await prisma.user.create({
    data: {
      organizationId,
      firstName: overrides.firstName || "Test",
      lastName: overrides.lastName || "User",
      email: overrides.email || uniqueEmail(overrides.role?.toLowerCase() || "user"),
      passwordHash,
      role: overrides.role || "ADMIN",
      isActive: overrides.isActive ?? true,
    },
  });
  return { ...user, plainPassword: password };
}

async function createOrgWithAdmin(overrides = {}) {
  const organization = await createOrganization(overrides.organization);
  const admin = await createUser(organization.id, { role: "ADMIN", ...overrides.admin });
  return { organization, admin };
}

async function loginAs(email, password = DEFAULT_PASSWORD) {
  const res = await request(app).post("/api/auth/login").send({ email, password });
  if (res.status !== 200) {
    throw new Error(`Login failed for ${email}: ${JSON.stringify(res.body)}`);
  }
  return res.body.data.token;
}

module.exports = {
  app,
  request,
  prisma,
  DEFAULT_PASSWORD,
  uniqueEmail,
  createOrganization,
  createUser,
  createOrgWithAdmin,
  loginAs,
};
