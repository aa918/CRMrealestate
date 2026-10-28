const { request, app, prisma, createOrganization } = require("./helpers");
const { resetDatabase } = require("./setup");

describe("Public lead intake", () => {
  let organization;

  beforeEach(async () => {
    await resetDatabase();
    organization = await createOrganization({ name: "Public Test Agency" });
  });

  it("accepts a public lead using the organization's own publicApiKey", async () => {
    const res = await request(app)
      .post("/api/public/leads")
      .set("x-public-api-key", organization.publicApiKey)
      .send({ firstName: "Daniel", lastName: "Levi", phone: "0521234567", city: "Herzliya", source: "WEBSITE" });

    expect(res.status).toBe(201);
    const lead = await prisma.lead.findUnique({ where: { id: res.body.data.id } });
    expect(lead.organizationId).toBe(organization.id);
  });

  it("rejects a missing or invalid api key", async () => {
    const missing = await request(app).post("/api/public/leads").send({ firstName: "X", phone: "0521234567" });
    expect(missing.status).toBe(401);

    const invalid = await request(app)
      .post("/api/public/leads")
      .set("x-public-api-key", "totally-wrong-key")
      .send({ firstName: "X", phone: "0521234567" });
    expect(invalid.status).toBe(401);
  });

  it("never lets the client choose an arbitrary organizationId", async () => {
    const otherOrg = await createOrganization({ name: "Should Not Receive This" });

    const res = await request(app)
      .post("/api/public/leads")
      .set("x-public-api-key", organization.publicApiKey)
      .send({ firstName: "Sneaky", phone: "0529998888", organizationId: otherOrg.id });

    expect(res.status).toBe(201);
    const lead = await prisma.lead.findUnique({ where: { id: res.body.data.id } });
    expect(lead.organizationId).toBe(organization.id);
    expect(lead.organizationId).not.toBe(otherOrg.id);
  });

  it("rejects invalid payloads with a 400 and field details", async () => {
    const res = await request(app)
      .post("/api/public/leads")
      .set("x-public-api-key", organization.publicApiKey)
      .send({ firstName: "", phone: "123" });

    expect(res.status).toBe(400);
    expect(res.body.success).toBe(false);
    expect(res.body.error.code).toBe("VALIDATION_ERROR");
  });
});
