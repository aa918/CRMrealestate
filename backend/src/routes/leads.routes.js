const { Router } = require("express");
const leadsController = require("../controllers/leads.controller");
const { requireAuth } = require("../middleware/auth.middleware");
const { requireRole } = require("../middleware/rbac.middleware");
const { validate } = require("../middleware/validation.middleware");
const { createLeadSchema, updateLeadSchema, listLeadsQuerySchema } = require("../validators/lead.validator");
const { cuidParamSchema } = require("../validators/common.validator");

const router = Router();

router.use(requireAuth);

router.get("/", validate(listLeadsQuerySchema, "query"), leadsController.list);
router.post("/", validate(createLeadSchema), leadsController.create);
router.get("/:id", validate(cuidParamSchema, "params"), leadsController.getById);
router.patch("/:id", validate(cuidParamSchema, "params"), validate(updateLeadSchema), leadsController.update);
// Deleting a lead is destructive (wipes its history) - restricted to
// admins/managers, same as contacts/properties/deals/tasks below.
router.delete("/:id", requireRole("ADMIN", "MANAGER"), validate(cuidParamSchema, "params"), leadsController.remove);

module.exports = router;
