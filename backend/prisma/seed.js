/* eslint-disable no-console */
const { PrismaClient } = require("@prisma/client");
const bcrypt = require("bcryptjs");

const prisma = new PrismaClient();

const SALT_ROUNDS = 10;
const hash = (pw) => bcrypt.hashSync(pw, SALT_ROUNDS);

const hoursAgo = (h) => new Date(Date.now() - h * 60 * 60 * 1000);
const minutesAgo = (m) => new Date(Date.now() - m * 60 * 1000);
const daysAgo = (d) => hoursAgo(d * 24);

async function main() {
  console.log("Seeding database...");

  // ------------------------------------------------------------------
  // Organization + Users
  // ------------------------------------------------------------------
  const organization = await prisma.organization.create({
    data: {
      name: "RealEstate Demo Agency",
      phone: "+972501234567",
      email: "info@demoagency.example.com",
    },
  });

  const admin = await prisma.user.create({
    data: {
      organizationId: organization.id,
      firstName: "Avi",
      lastName: "Admin",
      email: "admin@demoagency.example.com",
      passwordHash: hash("Password123!"),
      phone: "+972500000001",
      role: "ADMIN",
    },
  });

  const manager = await prisma.user.create({
    data: {
      organizationId: organization.id,
      firstName: "Michal",
      lastName: "Manager",
      email: "manager@demoagency.example.com",
      passwordHash: hash("Password123!"),
      phone: "+972500000002",
      role: "MANAGER",
    },
  });

  const agent1 = await prisma.user.create({
    data: {
      organizationId: organization.id,
      firstName: "Dana",
      lastName: "Agent",
      email: "agent1@demoagency.example.com",
      passwordHash: hash("Password123!"),
      phone: "+972500000003",
      role: "AGENT",
    },
  });

  const agent2 = await prisma.user.create({
    data: {
      organizationId: organization.id,
      firstName: "Yossi",
      lastName: "Agent",
      email: "agent2@demoagency.example.com",
      passwordHash: hash("Password123!"),
      phone: "+972500000004",
      role: "AGENT",
    },
  });

  console.log(`Created organization "${organization.name}" (publicApiKey: ${organization.publicApiKey})`);
  console.log("Users: admin@demoagency.example.com / manager@demoagency.example.com / agent1@.. / agent2@.. (password: Password123!)");

  // ------------------------------------------------------------------
  // Contacts
  // ------------------------------------------------------------------
  const contactSeed = [
    { firstName: "Daniel", lastName: "Levi", phone: "+972521234567", email: "daniel.levi@example.com" },
    { firstName: "Noa", lastName: "Cohen", phone: "+972522345678", email: "noa.cohen@example.com" },
    { firstName: "Itay", lastName: "Mizrahi", phone: "+972523456789", email: "itay.mizrahi@example.com" },
    { firstName: "Shira", lastName: "Peretz", phone: "+972524567890", email: "shira.peretz@example.com" },
    { firstName: "Omer", lastName: "Ben-David", phone: "+972525678901", email: "omer.bendavid@example.com" },
    { firstName: "Tamar", lastName: "Azoulay", phone: "+972526789012", email: "tamar.azoulay@example.com" },
    { firstName: "Eitan", lastName: "Katz", phone: "+972527890123", email: "eitan.katz@example.com" },
    { firstName: "Liora", lastName: "Bar", phone: "+972528901234", email: "liora.bar@example.com" },
    { firstName: "Ronit", lastName: "Sasson", phone: "+972529012345", email: "ronit.sasson@example.com" },
    { firstName: "Guy", lastName: "Nahum", phone: "+972529123456", email: "guy.nahum@example.com" },
  ];

  const contacts = [];
  for (const c of contactSeed) {
    const contact = await prisma.contact.create({ data: { organizationId: organization.id, ...c } });
    contacts.push(contact);
  }
  console.log(`Created ${contacts.length} contacts`);

  // ------------------------------------------------------------------
  // Properties
  // ------------------------------------------------------------------
  const properties = await prisma.$transaction([
    prisma.property.create({
      data: {
        organizationId: organization.id,
        title: "Modern 4-room apartment near the beach",
        description: "Renovated, sea view, elevator, parking.",
        propertyType: "APARTMENT",
        transactionType: "SALE",
        city: "Herzliya",
        address: "Ben Gurion St 12",
        price: 4200000,
        bedrooms: 4,
        bathrooms: 2,
        sizeSqm: 110,
        status: "AVAILABLE",
      },
    }),
    prisma.property.create({
      data: {
        organizationId: organization.id,
        title: "Cozy studio in the city center",
        propertyType: "STUDIO",
        transactionType: "RENT",
        city: "Tel Aviv",
        address: "Dizengoff St 88",
        price: 6500,
        bedrooms: 1,
        bathrooms: 1,
        sizeSqm: 35,
        status: "AVAILABLE",
      },
    }),
    prisma.property.create({
      data: {
        organizationId: organization.id,
        title: "Family house with garden",
        propertyType: "HOUSE",
        transactionType: "SALE",
        city: "Raanana",
        address: "Ahuza St 45",
        price: 6800000,
        bedrooms: 6,
        bathrooms: 3,
        sizeSqm: 220,
        status: "RESERVED",
      },
    }),
    prisma.property.create({
      data: {
        organizationId: organization.id,
        title: "Investment apartment, good ROI",
        propertyType: "APARTMENT",
        transactionType: "SALE",
        city: "Tel Aviv",
        address: "Allenby St 5",
        price: 2900000,
        bedrooms: 3,
        bathrooms: 1,
        sizeSqm: 75,
        status: "SOLD",
      },
    }),
    prisma.property.create({
      data: {
        organizationId: organization.id,
        title: "Penthouse with panoramic view",
        propertyType: "PENTHOUSE",
        transactionType: "SALE",
        city: "Herzliya",
        address: "Hamaapilim St 3",
        price: 8900000,
        bedrooms: 5,
        bathrooms: 3,
        sizeSqm: 180,
        status: "AVAILABLE",
      },
    }),
  ]);
  console.log(`Created ${properties.length} properties`);

  // ------------------------------------------------------------------
  // Leads - a spread of statuses/response states to exercise the
  // Speed-to-Lead flow end-to-end via the seeded data.
  // ------------------------------------------------------------------
  const agents = [agent1, agent2];

  const leadDefs = [
    // 1. Brand new, still WAITING, well within SLA
    {
      contact: contacts[0],
      source: "FACEBOOK",
      status: "NEW",
      interestType: "BUY",
      propertyType: "APARTMENT",
      city: "Herzliya",
      budget: 4000000,
      bedrooms: 4,
      message: "Looking for 4 rooms near the beach",
      receivedAt: minutesAgo(5),
      responseStatus: "WAITING",
      assignedUserId: agent1.id,
      assignedAt: minutesAgo(5),
    },
    // 2. WAITING and OVERDUE (received well past the 15 min SLA)
    {
      contact: contacts[1],
      source: "WEBSITE",
      status: "NEW",
      interestType: "RENT",
      propertyType: "STUDIO",
      city: "Tel Aviv",
      budget: 7000,
      bedrooms: 1,
      message: "Need a rental asap",
      receivedAt: hoursAgo(3),
      responseStatus: "OVERDUE",
      assignedUserId: agent2.id,
      assignedAt: hoursAgo(3),
    },
    // 3. Responded quickly (5 min response time)
    {
      contact: contacts[2],
      source: "INSTAGRAM",
      status: "CONTACTED",
      interestType: "BUY",
      propertyType: "HOUSE",
      city: "Raanana",
      budget: 6500000,
      bedrooms: 6,
      receivedAt: hoursAgo(6),
      firstResponseAt: hoursAgo(6 - 5 / 60),
      responseStatus: "RESPONDED",
      assignedUserId: agent1.id,
      assignedAt: hoursAgo(6),
    },
    // 4. Qualified, responded, further along
    {
      contact: contacts[3],
      source: "PHONE",
      status: "QUALIFIED",
      interestType: "BUY",
      propertyType: "APARTMENT",
      city: "Tel Aviv",
      budget: 3000000,
      bedrooms: 3,
      receivedAt: daysAgo(2),
      firstResponseAt: daysAgo(2 - 0.2),
      responseStatus: "RESPONDED",
      assignedUserId: agent2.id,
      assignedAt: daysAgo(2),
    },
    // 5. Meeting scheduled
    {
      contact: contacts[4],
      source: "REFERRAL",
      status: "MEETING",
      interestType: "BUY",
      propertyType: "PENTHOUSE",
      city: "Herzliya",
      budget: 9000000,
      bedrooms: 5,
      receivedAt: daysAgo(3),
      firstResponseAt: daysAgo(3 - 0.1),
      responseStatus: "RESPONDED",
      assignedUserId: agent1.id,
      assignedAt: daysAgo(3),
    },
    // 6. Property sent
    {
      contact: contacts[5],
      source: "WHATSAPP",
      status: "PROPERTY_SENT",
      interestType: "RENT",
      propertyType: "STUDIO",
      city: "Tel Aviv",
      budget: 6500,
      bedrooms: 1,
      receivedAt: daysAgo(1),
      firstResponseAt: daysAgo(1 - 0.05),
      responseStatus: "RESPONDED",
      assignedUserId: agent2.id,
      assignedAt: daysAgo(1),
    },
    // 7. Negotiation
    {
      contact: contacts[6],
      source: "MANUAL",
      status: "NEGOTIATION",
      interestType: "BUY",
      propertyType: "APARTMENT",
      city: "Tel Aviv",
      budget: 3100000,
      bedrooms: 3,
      receivedAt: daysAgo(5),
      firstResponseAt: daysAgo(5 - 0.1),
      responseStatus: "RESPONDED",
      assignedUserId: agent2.id,
      assignedAt: daysAgo(5),
    },
    // 8. Won
    {
      contact: contacts[7],
      source: "FACEBOOK",
      status: "WON",
      interestType: "BUY",
      propertyType: "APARTMENT",
      city: "Tel Aviv",
      budget: 2900000,
      bedrooms: 3,
      receivedAt: daysAgo(20),
      firstResponseAt: daysAgo(20 - 0.05),
      responseStatus: "RESPONDED",
      assignedUserId: agent1.id,
      assignedAt: daysAgo(20),
      closedAt: daysAgo(2),
    },
    // 9. Lost
    {
      contact: contacts[8],
      source: "OTHER",
      status: "LOST",
      interestType: "RENT",
      propertyType: "APARTMENT",
      city: "Ramat Gan",
      budget: 5500,
      bedrooms: 2,
      receivedAt: daysAgo(10),
      firstResponseAt: daysAgo(10 - 0.05),
      responseStatus: "RESPONDED",
      assignedUserId: agent2.id,
      assignedAt: daysAgo(10),
      closedAt: daysAgo(8),
    },
    // 10. Unassigned (simulates "no agents available" edge case)
    {
      contact: contacts[9],
      source: "WEBSITE",
      status: "NEW",
      interestType: "BUY",
      propertyType: "LAND",
      city: "Modiin",
      budget: 1500000,
      receivedAt: hoursAgo(1),
      responseStatus: "WAITING",
      assignedUserId: null,
      assignedAt: null,
    },
  ];

  const leads = [];
  for (const def of leadDefs) {
    const { contact, ...data } = def;
    const lead = await prisma.lead.create({
      data: { organizationId: organization.id, contactId: contact.id, ...data },
    });
    leads.push(lead);

    await prisma.activity.create({
      data: {
        organizationId: organization.id,
        contactId: contact.id,
        leadId: lead.id,
        type: "LEAD_CREATED",
        description: `Lead created from ${lead.source} for ${contact.firstName} ${contact.lastName}`,
        metadata: { source: lead.source },
        createdAt: lead.receivedAt,
      },
    });

    if (lead.firstResponseAt) {
      await prisma.activity.create({
        data: {
          organizationId: organization.id,
          contactId: contact.id,
          leadId: lead.id,
          userId: lead.assignedUserId,
          type: "CALL",
          direction: "OUTBOUND",
          description: "Agent called the lead to follow up",
          createdAt: lead.firstResponseAt,
        },
      });
    }
  }
  console.log(`Created ${leads.length} leads`);

  // ------------------------------------------------------------------
  // Tasks (follow-ups for the leads above)
  // ------------------------------------------------------------------
  let taskCount = 0;
  for (const lead of leads) {
    if (!lead.assignedUserId) continue;
    await prisma.task.create({
      data: {
        organizationId: organization.id,
        contactId: lead.contactId,
        leadId: lead.id,
        assignedUserId: lead.assignedUserId,
        title: "Contact new lead",
        description: "Auto-generated follow-up task (seed data)",
        type: "FOLLOW_UP",
        priority: "HIGH",
        status: lead.firstResponseAt ? "DONE" : "OPEN",
        dueAt: new Date(lead.receivedAt.getTime() + 15 * 60 * 1000),
        completedAt: lead.firstResponseAt || null,
      },
    });
    taskCount++;
  }

  // A couple of extra, non-lead tasks (general follow-ups / meetings).
  await prisma.task.create({
    data: {
      organizationId: organization.id,
      contactId: contacts[4].id,
      assignedUserId: agent1.id,
      title: "Prepare documents for meeting",
      type: "MEETING",
      priority: "MEDIUM",
      status: "OPEN",
      dueAt: hoursAgo(-4),
    },
  });
  taskCount++;
  await prisma.task.create({
    data: {
      organizationId: organization.id,
      contactId: contacts[6].id,
      assignedUserId: agent2.id,
      title: "Send updated offer",
      type: "EMAIL",
      priority: "URGENT",
      status: "IN_PROGRESS",
      dueAt: hoursAgo(2),
    },
  });
  taskCount++;
  console.log(`Created ${taskCount} tasks`);

  // ------------------------------------------------------------------
  // Deals
  // ------------------------------------------------------------------
  const wonLead = leads.find((l) => l.status === "WON");
  const lostLead = leads.find((l) => l.status === "LOST");
  const negotiationLead = leads.find((l) => l.status === "NEGOTIATION");

  const deals = await prisma.$transaction([
    prisma.deal.create({
      data: {
        organizationId: organization.id,
        contactId: wonLead.contactId,
        leadId: wonLead.id,
        propertyId: properties[3].id,
        ownerId: agent1.id,
        title: "Investment apartment sale - Liora Bar",
        value: 2900000,
        stage: "WON",
        probability: 100,
        closedAt: wonLead.closedAt,
      },
    }),
    prisma.deal.create({
      data: {
        organizationId: organization.id,
        contactId: lostLead.contactId,
        leadId: lostLead.id,
        ownerId: agent2.id,
        title: "Ramat Gan rental - Ronit Sasson",
        value: 5500,
        stage: "LOST",
        probability: 0,
        closedAt: lostLead.closedAt,
      },
    }),
    prisma.deal.create({
      data: {
        organizationId: organization.id,
        contactId: negotiationLead.contactId,
        leadId: negotiationLead.id,
        propertyId: properties[3].id,
        ownerId: agent2.id,
        title: "Tel Aviv apartment - Eitan Katz",
        value: 3100000,
        stage: "NEGOTIATION",
        probability: 60,
        expectedCloseDate: daysAgo(-10),
      },
    }),
    prisma.deal.create({
      data: {
        organizationId: organization.id,
        contactId: contacts[4].id,
        propertyId: properties[4].id,
        ownerId: agent1.id,
        title: "Penthouse deal - Omer Ben-David",
        value: 8900000,
        stage: "MEETING",
        probability: 30,
        expectedCloseDate: daysAgo(-20),
      },
    }),
  ]);
  console.log(`Created ${deals.length} deals`);

  console.log("Seeding complete.");
}

main()
  .catch((err) => {
    console.error("Seed failed:", err);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
