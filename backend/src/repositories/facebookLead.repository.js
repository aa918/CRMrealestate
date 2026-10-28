const { prisma } = require("../config/database");

function findByLeadgenId(leadgenId) {
  return prisma.facebookLead.findUnique({ where: { leadgenId } });
}

function create(data) {
  return prisma.facebookLead.create({ data });
}

function update(id, data) {
  return prisma.facebookLead.update({ where: { id }, data });
}

function findIntegrationByPageId(pageId) {
  return prisma.facebookIntegration.findUnique({ where: { pageId } });
}

module.exports = { findByLeadgenId, create, update, findIntegrationByPageId };
