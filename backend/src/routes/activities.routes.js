const { Router } = require("express");
const activitiesController = require("../controllers/activities.controller");
const { requireAuth } = require("../middleware/auth.middleware");
const { validate } = require("../middleware/validation.middleware");
const { createActivitySchema, listActivitiesQuerySchema } = require("../validators/activity.validator");

const router = Router();

router.use(requireAuth);

router.get("/", validate(listActivitiesQuerySchema, "query"), activitiesController.list);
router.post("/", validate(createActivitySchema), activitiesController.create);

module.exports = router;
