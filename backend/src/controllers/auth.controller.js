const asyncHandler = require("../utils/asyncHandler");
const { ok, created } = require("../utils/apiResponse");
const authService = require("../services/auth.service");

const register = asyncHandler(async (req, res) => {
  const { user, organization, token } = await authService.register(req.body);
  created(res, { user, organization, token });
});

const login = asyncHandler(async (req, res) => {
  const { user, organization, token } = await authService.login(req.body);
  ok(res, { user, organization, token });
});

const me = asyncHandler(async (req, res) => {
  const user = await authService.getMe(req.user.id);
  ok(res, user);
});

module.exports = { register, login, me };
