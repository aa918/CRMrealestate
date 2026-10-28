const { request, app, createOrganization, createUser, loginAs } = require("./helpers");
const { resetDatabase } = require("./setup");

describe("Integrations status (Automations page backing API)", () => {
  let token;

  beforeEach(async () => {
    await resetDatabase();
    const organization = await createOrganization();
    const admin = await createUser(organization.id, { role: "ADMIN" });
    token = await loginAs(admin.email);
  });

  it("honestly reports unconfigured integrations with no fabricated history", async () => {
    const res = await request(app).get("/api/integrations/status").set("Authorization", `Bearer ${token}`);
    expect(res.status).toBe(200);
    expect(res.body.data.n8n.configured).toBe(false);
    expect(res.body.data.n8n.lastExecutedAt).toBeNull();
    expect(res.body.data.whatsapp.configured).toBe(false);
    expect(res.body.data.whatsapp.mode).toBe("MOCK");
    expect(res.body.data.facebook.configured).toBe(false);
  });

  it("records a real (failed/not-configured) n8n log entry when a lead is created", async () => {
    await createUser((await request(app).get("/api/auth/me").set("Authorization", `Bearer ${token}`)).body.data.organizationId, { role: "AGENT" });

    await request(app)
      .post("/api/leads")
      .set("Authorization", `Bearer ${token}`)
      .send({ firstName: "Log", lastName: "Test", phone: "0521230000", source: "MANUAL" });

    const status = await request(app).get("/api/integrations/status").set("Authorization", `Bearer ${token}`);
    expect(status.body.data.n8n.lastEvent).toBe("lead.created");
    expect(status.body.data.n8n.lastResult).toBe("FAILED");
    expect(status.body.data.n8n.lastExecutedAt).toBeTruthy();

    const logs = await request(app).get("/api/integrations/logs?integration=N8N").set("Authorization", `Bearer ${token}`);
    expect(logs.body.data.length).toBeGreaterThan(0);
    expect(logs.body.data[0].integration).toBe("N8N");
  });

  it("logs a mock WhatsApp send and reflects it in status", async () => {
    const send = await request(app)
      .post("/api/integrations/whatsapp/test")
      .set("Authorization", `Bearer ${token}`)
      .send({ phone: "+972521234567", message: "Hello" });

    expect(send.status).toBe(200);
    expect(send.body.data.configured).toBe(false);
    expect(send.body.data.provider).toBe("mock");
    expect(send.body.data.success).toBe(true);

    const status = await request(app).get("/api/integrations/status").set("Authorization", `Bearer ${token}`);
    expect(status.body.data.whatsapp.lastEvent).toBe("whatsapp.send.mock");
    expect(status.body.data.whatsapp.lastResult).toBe("SUCCESS");
  });

  it("rejects the WhatsApp test endpoint for AGENT role", async () => {
    const organization = await createOrganization({ name: "Agent Org" });
    const agent = await createUser(organization.id, { role: "AGENT" });
    const agentToken = await loginAs(agent.email);

    const res = await request(app)
      .post("/api/integrations/whatsapp/test")
      .set("Authorization", `Bearer ${agentToken}`)
      .send({ phone: "+972521234567", message: "Hello" });

    expect(res.status).toBe(403);
  });
});
