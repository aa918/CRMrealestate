function ok(res, data, statusCode = 200) {
  return res.status(statusCode).json({ success: true, data });
}

function created(res, data) {
  return ok(res, data, 201);
}

function noContent(res) {
  return res.status(204).send();
}

function paginated(res, data, pagination) {
  return res.status(200).json({ success: true, data, pagination });
}

function buildPaginationMeta({ page, limit, total }) {
  return {
    page,
    limit,
    total,
    pages: total === 0 ? 0 : Math.ceil(total / limit),
  };
}

module.exports = { ok, created, noContent, paginated, buildPaginationMeta };
