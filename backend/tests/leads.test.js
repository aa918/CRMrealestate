const { request, app, prisma, createOrganization, createUser, loginAs } = require("./helpers");
const { resetDatabase } = require("./setup");

describe("Leads API", () => {
  let organization, admin, agent, token;

  beforeEach(async () => {
    await resetDatabase();
    organization = await createOrganization();
    admin = await createUser(organization.id, { role: "ADMIN" });
    agent = await createUser(organization.id, { role: "AGENT" });
    token = await loginAs(admin.email);
  });

  it("creates a lead end-to-end: contact, assignment, follow-up task, activity", async () => {
    const res = await request(app)
      .post("/api/leads")
      .set("Authorization", `Bearer ${token}`)
      .send({
        firstName: "Daniel",
        lastName: "Levi",
        phone: "0521234567",
        email: "daniel@example.com",
        source: "WEBSITE",
        interestType: "BUY",
        propertyType: "APARTMENT",
        city: "Herzliya",
        budget: 4000000,
      });

    expect(res.status).toBe(201);
    const lead = res.body.data;
    expect(lead.responseStatus).toBe("WAITING");
    expect(lead.assignedUserId).toBe(agent.id); // only active agent -> gets assigned
    expect(lead.assignedAt).toBeTruthy();
    expect(lead.contact.phone).toBe("+972521234567");

    const tasks = await prisma.task.findMany({ where: { leadId: lead.id } });
    expect(tasks).toHaveLength(1);
    expect(tasks[0].type).toBe("FOLLOW_UP");
    expect(tasks[0].assignedUserId).toBe(agent.id);

    const activities = await prisma.activity.findMany({ where: { leadId: lead.id }, orderBy: { createdAt: "asc" } });
    const types = activities.map((a) => a.type);
    expect(types).toContain("LEAD_CREATED");
    expect(types).toContain("TASK_CREATED");
  });

  it("does not create a duplicate contact when the same phone submits a second lead", async () => {
    const payload = { firstName: "Daniel", lastName: "Levi", phone: "0521234567", source: "MANUAL" };
    await request(app).post("/api/leads").set("Authorization", `Bearer ${token}`).send(payload);
    await request(app).post("/api/leads").set("Authorization", `Bearer ${token}`).send({ ...payload, message: "second inquiry" });

    const contacts = await prisma.contact.findMany({ where: { organizationId: organization.id, phone: "+972521234567" } });
    expect(contacts).toHaveLength(1);

    const leads = await prisma.lead.findMany({ where: { contactId: contacts[0].id } });
    expect(leads).toHaveLength(2);
  });

  it("does not fail lead creation when the n8n webhook is unreachable", async () => {
    const { env } = require("../src/config/env");
    const original = env.N8N_LEAD_WEBHOOK_URL;
    env.N8N_LEAD_WEBHOOK_URL = "http://127.0.0.1:1"; // nothing listens here -> ECONNREFUSED

    try {
      const res = await request(app)
        .post("/api/leads")
        .set("Authorization", `Bearer ${token}`)
        .send({ firstName: "Resilient", lastName: "Lead", phone: "0529999999", source: "MANUAL" });

      expect(res.status).toBe(201);
    } finally {
      env.N8N_LEAD_WEBHOOK_URL = original;
    }
  });

  it("lists leads with filters, search and pagination", async () => {
    await request(app).post("/api/leads").set("Authorization", `Bearer ${token}`).send({ firstName: "Alpha", phone: "0521111111", source: "FACEBOOK", city: "Tel Aviv" });
    await request(app).post("/api/leads").set("Authorization", `Bearer ${token}`).send({ firstName: "Beta", phone: "0522222222", source: "WEBSITE", city: "Haifa" });

    const bySource = await request(app).get("/api/leads?source=FACEBOOK").set("Authorization", `Bearer ${token}`);
    expect(bySource.body.data).toHaveLength(1);
    expect(bySource.body.data[0].source).toBe("FACEBOOK");

    const bySearch = await request(app).get("/api/leads?search=Beta").set("Authorization", `Bearer ${token}`);
    expect(bySearch.body.data).toHaveLength(1);
    expect(bySearch.body.data[0].contact.firstName).toBe("Beta");

    const paged = await request(app).get("/api/leads?page=1&limit=1").set("Authorization", `Bearer ${token}`);
    expect(paged.body.data).toHaveLength(1);
    expect(paged.body.pagination.total).toBe(2);
    expect(paged.body.pagination.pages).toBe(2);
  });

  it("enforces organization isolation between tenants", async () => {
    const created = await request(app)
      .post("/api/leads")
      .set("Authorization", `Bearer ${token}`)
      .send({ firstName: "Secret", phone: "0523334444", source: "MANUAL" });
    const leadId = created.body.data.id;

    const otherOrg = await createOrganization({ name: "Other Agency" });
    const otherAdmin = await createUser(otherOrg.id, { role: "ADMIN" });
    const otherToken = await loginAs(otherAdmin.email);

    const list = await request(app).get("/api/leads").set("Authorization", `Bearer ${otherToken}`);
    expect(list.body.data).toHaveLength(0);

    const getOne = await request(app).get(`/api/leads/${leadId}`).set("Authorization", `Bearer ${otherToken}`);
    expect(getOne.status).toBe(404);
  });

  it("rejects unauthorized access", async () => {
    const res = await request(app).get("/api/leads");
    expect(res.status).toBe(401);
  });
});
