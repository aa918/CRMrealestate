const asyncHandler = require("../utils/asyncHandler");
const { ok, created, paginated } = require("../utils/apiResponse");
const activityService = require("../services/activity.service");

const list = asyncHandler(async (req, res) => {
  const { items, pagination } = await activityService.listActivities(req.user.organizationId, req.query);
  paginated(res, items, pagination);
});

const listForContact = asyncHandler(async (req, res) => {
  const { items, pagination } = await activityService.listActivitiesForContact(
    req.user.organizationId,
    req.params.id,
    req.query
  );
  paginated(res, items, pagination);
});

const create = asyncHandler(async (req, res) => {
  const activity = await activityService.createActivity(req.user.organizationId, req.user.id, req.body);
  created(res, activity);
});

module.exports = { list, listForContact, create };
