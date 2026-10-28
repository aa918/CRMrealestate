const { request, app, prisma, createOrganization, createUser, loginAs } = require("./helpers");
const { resetDatabase } = require("./setup");

async function createLead(token) {
  const res = await request(app)
    .post("/api/leads")
    .set("Authorization", `Bearer ${token}`)
    .send({ firstName: "Speed", lastName: "Test", phone: "0527654321", source: "MANUAL" });
  return res.body.data;
}

describe("Speed-to-Lead", () => {
  let token;

  beforeEach(async () => {
    await resetDatabase();
    const organization = await createOrganization();
    await createUser(organization.id, { role: "AGENT" });
    const admin = await createUser(organization.id, { role: "ADMIN" });
    token = await loginAs(admin.email);
  });

  it("starts a new lead as WAITING with no firstResponseAt", async () => {
    const lead = await createLead(token);
    expect(lead.responseStatus).toBe("WAITING");
    expect(lead.firstResponseAt).toBeNull();
  });

  it("marks the lead RESPONDED and stamps firstResponseAt on the agent's first CALL activity", async () => {
    const lead = await createLead(token);

    const activityRes = await request(app)
      .post("/api/activities")
      .set("Authorization", `Bearer ${token}`)
      .send({ contactId: lead.contact.id, leadId: lead.id, type: "CALL", direction: "OUTBOUND", description: "Called the lead" });
    expect(activityRes.status).toBe(201);

    const updated = await prisma.lead.findUnique({ where: { id: lead.id } });
    expect(updated.responseStatus).toBe("RESPONDED");
    expect(updated.firstResponseAt).not.toBeNull();
    expect(updated.firstResponseAt.getTime()).toBeGreaterThanOrEqual(updated.receivedAt.getTime());
  });

  it("does not overwrite firstResponseAt on a second response activity", async () => {
    const lead = await createLead(token);

    await request(app)
      .post("/api/activities")
      .set("Authorization", `Bearer ${token}`)
      .send({ contactId: lead.contact.id, leadId: lead.id, type: "CALL", direction: "OUTBOUND", description: "First call" });

    const afterFirst = await prisma.lead.findUnique({ where: { id: lead.id } });

    await request(app)
      .post("/api/activities")
      .set("Authorization", `Bearer ${token}`)
      .send({ contactId: lead.contact.id, leadId: lead.id, type: "WHATSAPP", direction: "OUTBOUND", description: "Second follow-up" });

    const afterSecond = await prisma.lead.findUnique({ where: { id: lead.id } });
    expect(afterSecond.firstResponseAt.getTime()).toBe(afterFirst.firstResponseAt.getTime());
  });

  it("does not count an INBOUND message from the lead as the agent's response", async () => {
    const lead = await createLead(token);

    await request(app)
      .post("/api/activities")
      .set("Authorization", `Bearer ${token}`)
      .send({ contactId: lead.contact.id, leadId: lead.id, type: "WHATSAPP", direction: "INBOUND", description: "Lead messaged us back" });

    const updated = await prisma.lead.findUnique({ where: { id: lead.id } });
    expect(updated.responseStatus).toBe("WAITING");
    expect(updated.firstResponseAt).toBeNull();
  });

  it("flips WAITING leads past the SLA to OVERDUE via the internal endpoint", async () => {
    const lead = await createLead(token);
    // Simulate the lead having arrived well before the SLA window.
    await prisma.lead.update({ where: { id: lead.id }, data: { receivedAt: new Date(Date.now() - 60 * 60 * 1000) } });

    const res = await request(app)
      .post("/api/internal/leads/check-overdue")
      .set("X-Internal-Api-Key", "test-internal-key");

    expect(res.status).toBe(200);
    expect(res.body.data.leadIds).toContain(lead.id);

    const updated = await prisma.lead.findUnique({ where: { id: lead.id } });
    expect(updated.responseStatus).toBe("OVERDUE");
  });

  it("rejects the internal endpoint without a valid key", async () => {
    const res = await request(app).post("/api/internal/leads/check-overdue").set("X-Internal-Api-Key", "wrong");
    expect(res.status).toBe(401);
  });
});
