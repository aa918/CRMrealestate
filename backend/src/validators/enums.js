// Central place for enum value lists so validators and services always
// agree with prisma/schema.prisma. Keep in sync if the schema changes.

const ROLE = ["ADMIN", "MANAGER", "AGENT"];
const LEAD_SOURCE = ["FACEBOOK", "INSTAGRAM", "WEBSITE", "WHATSAPP", "PHONE", "REFERRAL", "MANUAL", "OTHER"];
const LEAD_STATUS = [
  "NEW",
  "CONTACTED",
  "QUALIFIED",
  "MEETING",
  "PROPERTY_SENT",
  "PROPERTY_VISIT",
  "NEGOTIATION",
  "WON",
  "LOST",
];
const RESPONSE_STATUS = ["WAITING", "RESPONDED", "OVERDUE"];
const INTEREST_TYPE = ["BUY", "RENT", "SELL"];
const PROPERTY_KIND = [
  "APARTMENT",
  "HOUSE",
  "PENTHOUSE",
  "DUPLEX",
  "STUDIO",
  "VILLA",
  "LAND",
  "COMMERCIAL",
  "OTHER",
];
const TRANSACTION_TYPE = ["SALE", "RENT"];
const PROPERTY_STATUS = ["AVAILABLE", "RESERVED", "SOLD", "RENTED", "INACTIVE"];
const DEAL_STAGE = ["OPEN", "MEETING", "OFFER", "NEGOTIATION", "WON", "LOST"];
const TASK_TYPE = ["CALL", "WHATSAPP", "EMAIL", "MEETING", "FOLLOW_UP", "OTHER"];
const TASK_PRIORITY = ["LOW", "MEDIUM", "HIGH", "URGENT"];
const TASK_STATUS = ["OPEN", "IN_PROGRESS", "DONE", "CANCELLED"];
const ACTIVITY_TYPE = [
  "CALL",
  "WHATSAPP",
  "EMAIL",
  "MEETING",
  "NOTE",
  "LEAD_CREATED",
  "STATUS_CHANGED",
  "TASK_CREATED",
  "SYSTEM",
];
const ACTIVITY_DIRECTION = ["INBOUND", "OUTBOUND"];

// Activity types that count as a genuine agent response for speed-to-lead.
const RESPONSE_ACTIVITY_TYPES = ["CALL", "WHATSAPP", "EMAIL"];

module.exports = {
  ROLE,
  LEAD_SOURCE,
  LEAD_STATUS,
  RESPONSE_STATUS,
  INTEREST_TYPE,
  PROPERTY_KIND,
  TRANSACTION_TYPE,
  PROPERTY_STATUS,
  DEAL_STAGE,
  TASK_TYPE,
  TASK_PRIORITY,
  TASK_STATUS,
  ACTIVITY_TYPE,
  ACTIVITY_DIRECTION,
  RESPONSE_ACTIVITY_TYPES,
};
