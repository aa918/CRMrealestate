const bcrypt = require("bcryptjs");
const userRepository = require("../repositories/user.repository");
const ApiError = require("../utils/ApiError");
const { parsePagination } = require("../utils/pagination");
const { buildPaginationMeta } = require("../utils/apiResponse");

const SALT_ROUNDS = 12;

async function createUser(organizationId, { firstName, lastName, email, password, phone, role }) {
  const existing = await userRepository.findByEmail(email);
  if (existing) {
    throw ApiError.conflict("An account with this email already exists", "EMAIL_ALREADY_EXISTS");
  }
  const passwordHash = await bcrypt.hash(password, SALT_ROUNDS);
  return userRepository.create({ organizationId, firstName, lastName, email, passwordHash, phone: phone || null, role });
}

async function getUser(organizationId, id) {
  const user = await userRepository.findByIdInOrg(id, organizationId);
  if (!user) throw ApiError.notFound("User not found", "USER_NOT_FOUND");
  return user;
}

async function updateUser(organizationId, id, data) {
  const payload = { ...data };
  if (payload.password) {
    payload.passwordHash = await bcrypt.hash(payload.password, SALT_ROUNDS);
    delete payload.password;
  }
  const existing = await userRepository.findByIdInOrg(id, organizationId);
  if (!existing) throw ApiError.notFound("User not found", "USER_NOT_FOUND");
  return userRepository.update(id, organizationId, payload);
}

async function listUsers(organizationId, query) {
  const { page, limit, skip, take } = parsePagination(query);
  const where = {};
  if (query.role) where.role = query.role;
  if (query.isActive !== undefined) where.isActive = query.isActive;

  const [items, total] = await userRepository.listByOrganization(organizationId, { where, skip, take });
  return { items, pagination: buildPaginationMeta({ page, limit, total }) };
}

module.exports = { createUser, getUser, updateUser, listUsers };
