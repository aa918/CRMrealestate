const propertyRepository = require("../repositories/property.repository");
const ApiError = require("../utils/ApiError");
const { parsePagination } = require("../utils/pagination");
const { buildPaginationMeta } = require("../utils/apiResponse");

async function createProperty(organizationId, data) {
  return propertyRepository.create({
    organizationId,
    title: data.title,
    description: data.description || null,
    propertyType: data.propertyType,
    transactionType: data.transactionType,
    city: data.city,
    address: data.address || null,
    price: data.price,
    bedrooms: data.bedrooms ?? null,
    bathrooms: data.bathrooms ?? null,
    sizeSqm: data.sizeSqm ?? null,
    status: data.status || "AVAILABLE",
  });
}

async function getProperty(organizationId, id) {
  const property = await propertyRepository.findByIdInOrg(id, organizationId);
  if (!property) throw ApiError.notFound("Property not found", "PROPERTY_NOT_FOUND");
  return property;
}

async function updateProperty(organizationId, id, data) {
  const property = await propertyRepository.updateInOrg(id, organizationId, data);
  if (!property) throw ApiError.notFound("Property not found", "PROPERTY_NOT_FOUND");
  return property;
}

async function deleteProperty(organizationId, id) {
  const result = await propertyRepository.remove(id, organizationId);
  if (result.count === 0) throw ApiError.notFound("Property not found", "PROPERTY_NOT_FOUND");
}

async function listProperties(organizationId, query) {
  const { page, limit, skip, take } = parsePagination(query);
  const where = {};
  if (query.city) where.city = { contains: query.city, mode: "insensitive" };
  if (query.transactionType) where.transactionType = query.transactionType;
  if (query.propertyType) where.propertyType = query.propertyType;
  if (query.status) where.status = query.status;
  if (query.bedrooms !== undefined) where.bedrooms = query.bedrooms;
  if (query.priceMin || query.priceMax) {
    where.price = {};
    if (query.priceMin) where.price.gte = query.priceMin;
    if (query.priceMax) where.price.lte = query.priceMax;
  }

  const [items, total] = await propertyRepository.list(organizationId, { where, skip, take });
  return { items, pagination: buildPaginationMeta({ page, limit, total }) };
}

module.exports = { createProperty, getProperty, updateProperty, deleteProperty, listProperties };
