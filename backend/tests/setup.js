process.env.NODE_ENV = "test";

const { prisma } = require("../src/config/database");

// Tests share a single Postgres database (see .env.test). Truncate
// everything before each test file's suite runs so tests are isolated
// from each other without paying for a fresh migration every time.
async function resetDatabase() {
  await prisma.$transaction([
    prisma.activity.deleteMany(),
    prisma.task.deleteMany(),
    prisma.deal.deleteMany(),
    prisma.facebookLead.deleteMany(),
    prisma.facebookIntegration.deleteMany(),
    prisma.lead.deleteMany(),
    prisma.property.deleteMany(),
    prisma.contact.deleteMany(),
    prisma.user.deleteMany(),
    prisma.organization.deleteMany(),
  ]);
}

module.exports = { resetDatabase };

afterAll(async () => {
  await prisma.$disconnect();
});
