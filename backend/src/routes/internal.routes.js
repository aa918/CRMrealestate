const { Router } = require("express");
const internalController = require("../controllers/internal.controller");
const { requireInternalApiKey } = require("../middleware/apiKey.middleware");

const router = Router();

router.use(requireInternalApiKey);

// Meant to be triggered by an n8n Cron workflow every few minutes.
router.post("/leads/check-overdue", internalController.checkOverdueLeads);

module.exports = router;
