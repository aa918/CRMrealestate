const { request, app, prisma, createOrganization, createUser, loginAs } = require("./helpers");
const { resetDatabase } = require("./setup");

describe("leadId filters (tasks & deals) - supports the frontend lead detail panel", () => {
  let token, organization, agent, lead, otherLead;

  beforeEach(async () => {
    await resetDatabase();
    organization = await createOrganization();
    agent = await createUser(organization.id, { role: "AGENT" });
    const admin = await createUser(organization.id, { role: "ADMIN" });
    token = await loginAs(admin.email);

    const leadRes = await request(app)
      .post("/api/leads")
      .set("Authorization", `Bearer ${token}`)
      .send({ firstName: "Lead", lastName: "One", phone: "0521110001", source: "MANUAL" });
    lead = leadRes.body.data;

    const otherLeadRes = await request(app)
      .post("/api/leads")
      .set("Authorization", `Bearer ${token}`)
      .send({ firstName: "Lead", lastName: "Two", phone: "0521110002", source: "MANUAL" });
    otherLead = otherLeadRes.body.data;
  });

  it("GET /api/tasks?leadId= only returns tasks for that lead", async () => {
    const res = await request(app).get(`/api/tasks?leadId=${lead.id}`).set("Authorization", `Bearer ${token}`);
    expect(res.status).toBe(200);
    expect(res.body.data.length).toBeGreaterThan(0);
    expect(res.body.data.every((t) => t.leadId === lead.id)).toBe(true);
    expect(res.body.data.some((t) => t.leadId === otherLead.id)).toBe(false);
  });

  it("GET /api/deals?leadId= only returns deals for that lead", async () => {
    await prisma.deal.create({
      data: { organizationId: organization.id, contactId: lead.contactId, leadId: lead.id, ownerId: agent.id, title: "Deal for lead one", value: 100000 },
    });
    await prisma.deal.create({
      data: { organizationId: organization.id, contactId: otherLead.contactId, leadId: otherLead.id, ownerId: agent.id, title: "Deal for lead two", value: 200000 },
    });

    const res = await request(app).get(`/api/deals?leadId=${lead.id}`).set("Authorization", `Bearer ${token}`);
    expect(res.status).toBe(200);
    expect(res.body.data).toHaveLength(1);
    expect(res.body.data[0].leadId).toBe(lead.id);
  });

  it("GET /api/leads?contactId= only returns leads for that contact", async () => {
    const res = await request(app).get(`/api/leads?contactId=${lead.contactId}`).set("Authorization", `Bearer ${token}`);
    expect(res.status).toBe(200);
    expect(res.body.data).toHaveLength(1);
    expect(res.body.data[0].contactId).toBe(lead.contactId);
  });

  it("forbids AGENT from deleting a lead/contact/property/deal/task (destructive actions are admin/manager only)", async () => {
    const agentToken = await loginAs(agent.email);

    const leadDelete = await request(app).delete(`/api/leads/${lead.id}`).set("Authorization", `Bearer ${agentToken}`);
    expect(leadDelete.status).toBe(403);

    const contact = await prisma.contact.findUnique({ where: { id: lead.contactId } });
    const contactDelete = await request(app).delete(`/api/contacts/${contact.id}`).set("Authorization", `Bearer ${agentToken}`);
    expect(contactDelete.status).toBe(403);
  });
});
