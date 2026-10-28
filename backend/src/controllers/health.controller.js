const { isDatabaseHealthy } = require("../config/database");

const health = async (req, res) => {
  const dbHealthy = await isDatabaseHealthy();
  res.status(dbHealthy ? 200 : 503).json({
    status: dbHealthy ? "ok" : "degraded",
    database: dbHealthy ? "connected" : "disconnected",
    timestamp: new Date().toISOString(),
  });
};

module.exports = { health };
