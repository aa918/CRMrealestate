const { request, app, createOrgWithAdmin, DEFAULT_PASSWORD } = require("./helpers");
const { resetDatabase } = require("./setup");

describe("Auth", () => {
  beforeEach(async () => {
    await resetDatabase();
  });

  it("registers a new organization + admin user", async () => {
    const res = await request(app).post("/api/auth/register").send({
      organizationName: "Brand New Agency",
      firstName: "Alice",
      lastName: "Admin",
      email: "alice@brandnew.example.com",
      password: "SuperSecret1",
    });

    expect(res.status).toBe(201);
    expect(res.body.success).toBe(true);
    expect(res.body.data.user.role).toBe("ADMIN");
    expect(res.body.data.user).not.toHaveProperty("passwordHash");
    expect(res.body.data.token).toBeTruthy();
    expect(res.body.data.organization.name).toBe("Brand New Agency");
  });

  it("rejects registering the same email twice", async () => {
    const payload = {
      organizationName: "Agency One",
      firstName: "Bob",
      lastName: "Boss",
      email: "duplicate@example.com",
      password: "SuperSecret1",
    };
    await request(app).post("/api/auth/register").send(payload);
    const res = await request(app)
      .post("/api/auth/register")
      .send({ ...payload, organizationName: "Agency Two" });

    expect(res.status).toBe(409);
    expect(res.body.success).toBe(false);
    expect(res.body.error.code).toBe("EMAIL_ALREADY_EXISTS");
  });

  it("logs in with correct credentials and rejects wrong password", async () => {
    const { admin } = await createOrgWithAdmin();

    const good = await request(app).post("/api/auth/login").send({ email: admin.email, password: DEFAULT_PASSWORD });
    expect(good.status).toBe(200);
    expect(good.body.data.token).toBeTruthy();
    expect(good.body.data.user).not.toHaveProperty("passwordHash");

    const bad = await request(app).post("/api/auth/login").send({ email: admin.email, password: "wrong-password" });
    expect(bad.status).toBe(401);
    expect(bad.body.error.code).toBe("INVALID_CREDENTIALS");
  });

  it("returns the current user for GET /api/auth/me with a valid token", async () => {
    const { admin } = await createOrgWithAdmin();
    const login = await request(app).post("/api/auth/login").send({ email: admin.email, password: DEFAULT_PASSWORD });
    const token = login.body.data.token;

    const me = await request(app).get("/api/auth/me").set("Authorization", `Bearer ${token}`);
    expect(me.status).toBe(200);
    expect(me.body.data.email).toBe(admin.email);
  });

  it("rejects requests without a token (unauthorized)", async () => {
    const res = await request(app).get("/api/auth/me");
    expect(res.status).toBe(401);
    expect(res.body.success).toBe(false);
  });

  it("rejects requests with a garbage token", async () => {
    const res = await request(app).get("/api/auth/me").set("Authorization", "Bearer not-a-real-token");
    expect(res.status).toBe(401);
  });
});
