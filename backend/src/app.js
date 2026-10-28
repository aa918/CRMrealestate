const express = require("express");
const cors = require("cors");
const helmet = require("helmet");
const pinoHttp = require("pino-http");

const logger = require("./config/logger");
const { corsOrigins, isProduction } = require("./config/env");
const { errorHandler, notFoundHandler } = require("./middleware/error.middleware");

const healthRoutes = require("./routes/health.routes");
const authRoutes = require("./routes/auth.routes");
const usersRoutes = require("./routes/users.routes");
const contactsRoutes = require("./routes/contacts.routes");
const leadsRoutes = require("./routes/leads.routes");
const propertiesRoutes = require("./routes/properties.routes");
const dealsRoutes = require("./routes/deals.routes");
const tasksRoutes = require("./routes/tasks.routes");
const activitiesRoutes = require("./routes/activities.routes");
const dashboardRoutes = require("./routes/dashboard.routes");
const webhooksRoutes = require("./routes/webhooks.routes");
const internalRoutes = require("./routes/internal.routes");
const publicRoutes = require("./routes/public.routes");
const integrationsRoutes = require("./routes/integrations.routes");

const app = express();

app.disable("x-powered-by");
app.set("trust proxy", 1);

app.use(helmet());

app.use(
  cors({
    origin: corsOrigins.length > 0 ? corsOrigins : isProduction ? false : true,
    credentials: true,
  })
);

// Capture the raw request body so Facebook webhook signature verification
// (HMAC over the exact bytes) can happen in the controller.
app.use(
  express.json({
    limit: "1mb",
    verify: (req, res, buf) => {
      req.rawBody = buf;
    },
  })
);
app.use(express.urlencoded({ extended: true }));

app.use(
  pinoHttp({
    logger,
    autoLogging: { ignore: (req) => req.url === "/api/health" },
    customLogLevel: (req, res, err) => {
      if (err || res.statusCode >= 500) return "error";
      if (res.statusCode >= 400) return "warn";
      return "info";
    },
    redact: ["req.headers.authorization"],
  })
);

// Optional lightweight API docs (only mounted if the doc file exists /
// swagger-ui-express is installed, so it never blocks server startup).
try {
  const swaggerUi = require("swagger-ui-express");
  const openapiDocument = require("./docs/openapi.json");
  app.use("/api/docs", swaggerUi.serve, swaggerUi.setup(openapiDocument));
} catch (err) {
  logger.warn({ err: err.message }, "API docs not mounted");
}

app.use("/api/health", healthRoutes);
app.use("/api/auth", authRoutes);
app.use("/api/users", usersRoutes);
app.use("/api/contacts", contactsRoutes);
app.use("/api/leads", leadsRoutes);
app.use("/api/properties", propertiesRoutes);
app.use("/api/deals", dealsRoutes);
app.use("/api/tasks", tasksRoutes);
app.use("/api/activities", activitiesRoutes);
app.use("/api/dashboard", dashboardRoutes);
app.use("/api/webhooks", webhooksRoutes);
app.use("/api/internal", internalRoutes);
app.use("/api/public", publicRoutes);
app.use("/api/integrations", integrationsRoutes);

app.get("/", (req, res) => {
  res.json({ name: "RealEstate CRM API", status: "running", docs: "/api/docs", health: "/api/health" });
});

app.use(notFoundHandler);
app.use(errorHandler);

module.exports = app;
