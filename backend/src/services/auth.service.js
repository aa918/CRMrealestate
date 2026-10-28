const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const { prisma } = require("../config/database");
const { env } = require("../config/env");
const userRepository = require("../repositories/user.repository");
const organizationRepository = require("../repositories/organization.repository");
const ApiError = require("../utils/ApiError");
const logger = require("../config/logger");

const SALT_ROUNDS = 12;

function signToken(user) {
  return jwt.sign(
    { userId: user.id, organizationId: user.organizationId, role: user.role },
    env.JWT_SECRET,
    { expiresIn: env.JWT_EXPIRES_IN }
  );
}

/**
 * Creates a brand new Organization together with its first ADMIN user.
 * This is the "sign up my real-estate office" flow.
 */
async function register({ organizationName, organizationPhone, organizationEmail, firstName, lastName, email, password, phone }) {
  const existingUser = await userRepository.findByEmail(email);
  if (existingUser) {
    throw ApiError.conflict("An account with this email already exists", "EMAIL_ALREADY_EXISTS");
  }

  const passwordHash = await bcrypt.hash(password, SALT_ROUNDS);

  const { organization, user } = await prisma.$transaction(async (tx) => {
    const organization = await tx.organization.create({
      data: { name: organizationName, phone: organizationPhone || null, email: organizationEmail || null },
    });

    const user = await tx.user.create({
      data: {
        organizationId: organization.id,
        firstName,
        lastName,
        email,
        passwordHash,
        phone: phone || null,
        role: "ADMIN",
      },
      select: userRepository.SAFE_SELECT,
    });

    return { organization, user };
  });

  logger.info({ organizationId: organization.id, userId: user.id }, "New organization registered");

  const token = signToken(user);
  return { user, organization, token };
}

async function login({ email, password }) {
  const user = await userRepository.findByEmail(email);
  if (!user || !user.isActive) {
    logger.warn({ email }, "Login failed - user not found or inactive");
    throw ApiError.unauthorized("Invalid email or password", "INVALID_CREDENTIALS");
  }

  const passwordMatches = await bcrypt.compare(password, user.passwordHash);
  if (!passwordMatches) {
    logger.warn({ email }, "Login failed - invalid password");
    throw ApiError.unauthorized("Invalid email or password", "INVALID_CREDENTIALS");
  }

  const token = signToken(user);
  const { passwordHash, ...safeUser } = user;
  const organization = await organizationRepository.findById(user.organizationId);
  return { user: safeUser, organization, token };
}

async function getMe(userId) {
  const user = await userRepository.findByIdSafe(userId);
  if (!user) throw ApiError.notFound("User not found", "USER_NOT_FOUND");
  const organization = await organizationRepository.findById(user.organizationId);
  return { ...user, organization: organization ? { id: organization.id, name: organization.name } : null };
}

module.exports = { register, login, getMe, signToken };
