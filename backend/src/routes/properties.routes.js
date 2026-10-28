const { Router } = require("express");
const propertiesController = require("../controllers/properties.controller");
const { requireAuth } = require("../middleware/auth.middleware");
const { requireRole } = require("../middleware/rbac.middleware");
const { validate } = require("../middleware/validation.middleware");
const {
  createPropertySchema,
  updatePropertySchema,
  listPropertiesQuerySchema,
} = require("../validators/property.validator");
const { cuidParamSchema } = require("../validators/common.validator");

const router = Router();

router.use(requireAuth);

router.get("/", validate(listPropertiesQuerySchema, "query"), propertiesController.list);
router.post("/", validate(createPropertySchema), propertiesController.create);
router.get("/:id", validate(cuidParamSchema, "params"), propertiesController.getById);
router.patch(
  "/:id",
  validate(cuidParamSchema, "params"),
  validate(updatePropertySchema),
  propertiesController.update
);
router.delete("/:id", requireRole("ADMIN", "MANAGER"), validate(cuidParamSchema, "params"), propertiesController.remove);

module.exports = router;
