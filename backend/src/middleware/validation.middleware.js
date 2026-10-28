const ApiError = require("../utils/ApiError");

/**
 * Validates req[part] (default "body") against a Zod schema. On success,
 * replaces req[part] with the parsed/coerced value so controllers always
 * work with clean data. On failure, throws a 400 ApiError with a clear,
 * field-level breakdown.
 */
function validate(schema, part = "body") {
  return function validationMiddleware(req, res, next) {
    const result = schema.safeParse(req[part]);

    if (!result.success) {
      const fieldErrors = result.error.issues.map((issue) => ({
        path: issue.path.join("."),
        message: issue.message,
      }));
      return next(
        ApiError.badRequest("Validation failed", "VALIDATION_ERROR", fieldErrors)
      );
    }

    req[part] = result.data;
    next();
  };
}

module.exports = { validate };
