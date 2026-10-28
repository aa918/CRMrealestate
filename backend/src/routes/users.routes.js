const { Router } = require("express");
const usersController = require("../controllers/users.controller");
const { requireAuth } = require("../middleware/auth.middleware");
const { requireRole } = require("../middleware/rbac.middleware");
const { validate } = require("../middleware/validation.middleware");
const { createUserSchema, updateUserSchema, listUsersQuerySchema } = require("../validators/user.validator");

const router = Router();

router.use(requireAuth);

router.get("/", requireRole("ADMIN", "MANAGER"), validate(listUsersQuerySchema, "query"), usersController.list);
router.post("/", requireRole("ADMIN", "MANAGER"), validate(createUserSchema), usersController.create);
router.get("/:id", usersController.getById);
router.patch("/:id", validate(updateUserSchema), usersController.update);

module.exports = router;
