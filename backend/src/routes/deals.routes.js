const { Router } = require("express");
const dealsController = require("../controllers/deals.controller");
const { requireAuth } = require("../middleware/auth.middleware");
const { requireRole } = require("../middleware/rbac.middleware");
const { validate } = require("../middleware/validation.middleware");
const { createDealSchema, updateDealSchema, listDealsQuerySchema } = require("../validators/deal.validator");
const { cuidParamSchema } = require("../validators/common.validator");

const router = Router();

router.use(requireAuth);

router.get("/", validate(listDealsQuerySchema, "query"), dealsController.list);
router.post("/", validate(createDealSchema), dealsController.create);
router.get("/:id", validate(cuidParamSchema, "params"), dealsController.getById);
router.patch("/:id", validate(cuidParamSchema, "params"), validate(updateDealSchema), dealsController.update);
router.delete("/:id", requireRole("ADMIN", "MANAGER"), validate(cuidParamSchema, "params"), dealsController.remove);

module.exports = router;
