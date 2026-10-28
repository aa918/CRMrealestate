const { request, app, prisma, createOrgWithAdmin, loginAs } = require("./helpers");
const { resetDatabase } = require("./setup");

describe("Contacts API", () => {
  let token;
  let organizationId;

  beforeEach(async () => {
    await resetDatabase();
    const { organization, admin } = await createOrgWithAdmin();
    organizationId = organization.id;
    token = await loginAs(admin.email);
  });

  it("creates a contact", async () => {
    const res = await request(app)
      .post("/api/contacts")
      .set("Authorization", `Bearer ${token}`)
      .send({ firstName: "Daniel", lastName: "Levi", phone: "0521234567", email: "daniel@example.com" });

    expect(res.status).toBe(201);
    expect(res.body.data.phone).toBe("+972521234567"); // normalized
    expect(res.body.data.organizationId).toBe(organizationId);
  });

  it("does not create a duplicate contact for the same phone number", async () => {
    const first = await request(app)
      .post("/api/contacts")
      .set("Authorization", `Bearer ${token}`)
      .send({ firstName: "Daniel", lastName: "Levi", phone: "0521234567" });

    const second = await request(app)
      .post("/api/contacts")
      .set("Authorization", `Bearer ${token}`)
      .send({ firstName: "Daniel", lastName: "Levi (again)", phone: "052-123-4567" }); // same number, different formatting

    expect(first.status).toBe(201);
    expect(second.status).toBe(201);
    expect(second.body.data.id).toBe(first.body.data.id);

    const count = await prisma.contact.count({ where: { organizationId, phone: "+972521234567" } });
    expect(count).toBe(1);
  });

  it("supports search, pagination, and phone lookup", async () => {
    await request(app).post("/api/contacts").set("Authorization", `Bearer ${token}`).send({ firstName: "Noa", lastName: "Cohen", phone: "0522222222", email: "noa@example.com" });
    await request(app).post("/api/contacts").set("Authorization", `Bearer ${token}`).send({ firstName: "Itay", lastName: "Mizrahi", phone: "0523333333" });

    const searchRes = await request(app)
      .get("/api/contacts?search=noa&page=1&limit=20")
      .set("Authorization", `Bearer ${token}`);
    expect(searchRes.status).toBe(200);
    expect(searchRes.body.data).toHaveLength(1);
    expect(searchRes.body.data[0].firstName).toBe("Noa");
    expect(searchRes.body.pagination).toMatchObject({ page: 1, limit: 20, total: 1 });

    const phoneRes = await request(app).get("/api/contacts?phone=0523333333").set("Authorization", `Bearer ${token}`);
    expect(phoneRes.body.data).toHaveLength(1);
    expect(phoneRes.body.data[0].firstName).toBe("Itay");
  });

  it("requires authentication", async () => {
    const res = await request(app).get("/api/contacts");
    expect(res.status).toBe(401);
  });
});
