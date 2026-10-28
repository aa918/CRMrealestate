const contactRepository = require("../repositories/contact.repository");
const ApiError = require("../utils/ApiError");
const { normalizePhone } = require("../utils/phone");
const { parsePagination } = require("../utils/pagination");
const { buildPaginationMeta } = require("../utils/apiResponse");

/**
 * Finds an existing Contact by (organizationId, normalized phone) or
 * creates a new one. This is THE mechanism that prevents duplicate
 * contacts whenever the same phone number sends another lead.
 */
async function findOrCreateContact(organizationId, { firstName, lastName, phone, email, notes }) {
  const normalizedPhone = normalizePhone(phone);
  if (!normalizedPhone) {
    throw ApiError.badRequest("A valid phone number is required", "INVALID_PHONE");
  }

  const existing = await contactRepository.findByOrgAndPhone(organizationId, normalizedPhone);
  if (existing) {
    return { contact: existing, created: false };
  }

  const contact = await contactRepository.create({
    organizationId,
    firstName: firstName || "Unknown",
    lastName: lastName || null,
    phone: normalizedPhone,
    email: email || null,
    notes: notes || null,
  });

  return { contact, created: true };
}

async function createContact(organizationId, data) {
  const { contact } = await findOrCreateContact(organizationId, data);
  return contact;
}

async function getContact(organizationId, id) {
  const contact = await contactRepository.findByIdInOrg(id, organizationId);
  if (!contact) throw ApiError.notFound("Contact not found", "CONTACT_NOT_FOUND");
  return contact;
}

async function updateContact(organizationId, id, data) {
  const payload = { ...data };
  if (payload.phone) {
    const normalized = normalizePhone(payload.phone);
    if (!normalized) throw ApiError.badRequest("Invalid phone number", "INVALID_PHONE");
    payload.phone = normalized;
  }
  const result = await contactRepository.update(id, organizationId, payload);
  if (result.count === 0) throw ApiError.notFound("Contact not found", "CONTACT_NOT_FOUND");
  return getContact(organizationId, id);
}

async function deleteContact(organizationId, id) {
  const result = await contactRepository.remove(id, organizationId);
  if (result.count === 0) throw ApiError.notFound("Contact not found", "CONTACT_NOT_FOUND");
}

async function listContacts(organizationId, query) {
  const { page, limit, skip, take } = parsePagination(query);
  const where = {};

  if (query.phone) {
    where.phone = { contains: normalizePhone(query.phone) || query.phone };
  }
  if (query.email) {
    where.email = { contains: query.email, mode: "insensitive" };
  }
  if (query.search) {
    where.OR = [
      { firstName: { contains: query.search, mode: "insensitive" } },
      { lastName: { contains: query.search, mode: "insensitive" } },
      { phone: { contains: query.search } },
      { email: { contains: query.search, mode: "insensitive" } },
    ];
  }

  const [items, total] = await contactRepository.list(organizationId, { where, skip, take });
  return { items, pagination: buildPaginationMeta({ page, limit, total }) };
}

module.exports = {
  findOrCreateContact,
  createContact,
  getContact,
  updateContact,
  deleteContact,
  listContacts,
};
