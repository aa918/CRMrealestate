const { Router } = require("express");
const tasksController = require("../controllers/tasks.controller");
const { requireAuth } = require("../middleware/auth.middleware");
const { requireRole } = require("../middleware/rbac.middleware");
const { validate } = require("../middleware/validation.middleware");
const { createTaskSchema, updateTaskSchema, listTasksQuerySchema } = require("../validators/task.validator");
const { cuidParamSchema } = require("../validators/common.validator");

const router = Router();

router.use(requireAuth);

// IMPORTANT: /today must be registered before /:id or it would be
// swallowed by the :id param route.
router.get("/today", tasksController.today);

router.get("/", validate(listTasksQuerySchema, "query"), tasksController.list);
router.post("/", validate(createTaskSchema), tasksController.create);
router.get("/:id", validate(cuidParamSchema, "params"), tasksController.getById);
router.patch("/:id", validate(cuidParamSchema, "params"), validate(updateTaskSchema), tasksController.update);
// Agents cancel their own tasks via PATCH status=CANCELLED; hard delete
// (losing the record entirely) is an admin/manager cleanup action.
router.delete("/:id", requireRole("ADMIN", "MANAGER"), validate(cuidParamSchema, "params"), tasksController.remove);

module.exports = router;
