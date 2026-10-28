const { Router } = require("express");
const authController = require("../controllers/auth.controller");
const { requireAuth } = require("../middleware/auth.middleware");
const { validate } = require("../middleware/validation.middleware");
const { registerSchema, loginSchema } = require("../validators/auth.validator");
const { loginLimiter } = require("../middleware/rateLimit.middleware");

const router = Router();

router.post("/register", loginLimiter, validate(registerSchema), authController.register);
router.post("/login", loginLimiter, validate(loginSchema), authController.login);
router.get("/me", requireAuth, authController.me);

module.exports = router;
