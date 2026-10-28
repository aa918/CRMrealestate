const { request, app } = require("./helpers");

describe("GET /api/health", () => {
  it("reports ok status and a connected database", async () => {
    const res = await request(app).get("/api/health");
    expect(res.status).toBe(200);
    expect(res.body.status).toBe("ok");
    expect(res.body.database).toBe("connected");
    expect(res.body.timestamp).toBeTruthy();
  });
});
