const { Router } = require("express");
const dashboardController = require("../controllers/dashboard.controller");
const { requireAuth } = require("../middleware/auth.middleware");

const router = Router();

router.use(requireAuth);

router.get("/summary", dashboardController.summary);
router.get("/recent-leads", dashboardController.recentLeads);
router.get("/response-performance", dashboardController.responsePerformance);

module.exports = router;
