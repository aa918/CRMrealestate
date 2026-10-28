const { Router } = require("express");
const contactsController = require("../controllers/contacts.controller");
const activitiesController = require("../controllers/activities.controller");
const { requireAuth } = require("../middleware/auth.middleware");
const { requireRole } = require("../middleware/rbac.middleware");
const { validate } = require("../middleware/validation.middleware");
const {
  createContactSchema,
  updateContactSchema,
  listContactsQuerySchema,
} = require("../validators/contact.validator");
const { listActivitiesQuerySchema } = require("../validators/activity.validator");
const { cuidParamSchema } = require("../validators/common.validator");

const router = Router();

router.use(requireAuth);

router.get("/", validate(listContactsQuerySchema, "query"), contactsController.list);
router.post("/", validate(createContactSchema), contactsController.create);
router.get("/:id", validate(cuidParamSchema, "params"), contactsController.getById);
router.patch("/:id", validate(cuidParamSchema, "params"), validate(updateContactSchema), contactsController.update);
// Deleting a contact cascades to their leads/deals - admin/manager only.
router.delete("/:id", requireRole("ADMIN", "MANAGER"), validate(cuidParamSchema, "params"), contactsController.remove);

router.get(
  "/:id/activities",
  validate(cuidParamSchema, "params"),
  validate(listActivitiesQuerySchema, "query"),
  activitiesController.listForContact
);

module.exports = router;
