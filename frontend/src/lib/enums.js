// Mirrors backend/src/validators/enums.js exactly - keep in sync if the
// Prisma schema changes. Each enum has its raw values (for API payloads)
// and a Hebrew label map (for display).

export const ROLE = ["ADMIN", "MANAGER", "AGENT"]
export const ROLE_LABELS = { ADMIN: "מנהל מערכת", MANAGER: "מנהל צוות", AGENT: "סוכן" }

export const LEAD_SOURCE = ["FACEBOOK", "INSTAGRAM", "WEBSITE", "WHATSAPP", "PHONE", "REFERRAL", "MANUAL", "OTHER"]
export const LEAD_SOURCE_LABELS = {
  FACEBOOK: "פייסבוק",
  INSTAGRAM: "אינסטגרם",
  WEBSITE: "אתר",
  WHATSAPP: "וואטסאפ",
  PHONE: "טלפון",
  REFERRAL: "הפניה",
  MANUAL: "הזנה ידנית",
  OTHER: "אחר",
}

export const LEAD_STATUS = [
  "NEW",
  "CONTACTED",
  "QUALIFIED",
  "MEETING",
  "PROPERTY_SENT",
  "PROPERTY_VISIT",
  "NEGOTIATION",
  "WON",
  "LOST",
]
export const LEAD_STATUS_LABELS = {
  NEW: "חדש",
  CONTACTED: "נוצר קשר",
  QUALIFIED: "מסוכן",
  MEETING: "פגישה",
  PROPERTY_SENT: "נכסים נשלחו",
  PROPERTY_VISIT: "סיור בנכס",
  NEGOTIATION: "משא ומתן",
  WON: "נסגר בהצלחה",
  LOST: "אבוד",
}

export const RESPONSE_STATUS = ["WAITING", "RESPONDED", "OVERDUE"]
export const RESPONSE_STATUS_LABELS = { WAITING: "מחכה למענה", RESPONDED: "נענה", OVERDUE: "חריגת SLA" }

export const INTEREST_TYPE = ["BUY", "RENT", "SELL"]
export const INTEREST_TYPE_LABELS = { BUY: "קנייה", RENT: "השכרה", SELL: "מכירה" }

export const PROPERTY_KIND = ["APARTMENT", "HOUSE", "PENTHOUSE", "DUPLEX", "STUDIO", "VILLA", "LAND", "COMMERCIAL", "OTHER"]
export const PROPERTY_KIND_LABELS = {
  APARTMENT: "דירה",
  HOUSE: "בית פרטי",
  PENTHOUSE: "פנטהאוז",
  DUPLEX: "דופלקס",
  STUDIO: "סטודיו",
  VILLA: "וילה",
  LAND: "מגרש",
  COMMERCIAL: "מסחרי",
  OTHER: "אחר",
}

export const TRANSACTION_TYPE = ["SALE", "RENT"]
export const TRANSACTION_TYPE_LABELS = { SALE: "למכירה", RENT: "להשכרה" }

export const PROPERTY_STATUS = ["AVAILABLE", "RESERVED", "SOLD", "RENTED", "INACTIVE"]
export const PROPERTY_STATUS_LABELS = {
  AVAILABLE: "פנוי",
  RESERVED: "בהמתנה",
  SOLD: "נמכר",
  RENTED: "מושכר",
  INACTIVE: "לא פעיל",
}

export const DEAL_STAGE = ["OPEN", "MEETING", "OFFER", "NEGOTIATION", "WON", "LOST"]
export const DEAL_STAGE_LABELS = {
  OPEN: "פתוח",
  MEETING: "פגישה",
  OFFER: "הצעה",
  NEGOTIATION: "משא ומתן",
  WON: "נסגר בהצלחה",
  LOST: "אבוד",
}

export const TASK_TYPE = ["CALL", "WHATSAPP", "EMAIL", "MEETING", "FOLLOW_UP", "OTHER"]
export const TASK_TYPE_LABELS = {
  CALL: "שיחת טלפון",
  WHATSAPP: "וואטסאפ",
  EMAIL: "אימייל",
  MEETING: "פגישה",
  FOLLOW_UP: "פולו אפ",
  OTHER: "אחר",
}

export const TASK_PRIORITY = ["LOW", "MEDIUM", "HIGH", "URGENT"]
export const TASK_PRIORITY_LABELS = { LOW: "נמוכה", MEDIUM: "רגילה", HIGH: "גבוהה", URGENT: "דחופה" }

export const TASK_STATUS = ["OPEN", "IN_PROGRESS", "DONE", "CANCELLED"]
export const TASK_STATUS_LABELS = { OPEN: "פתוחה", IN_PROGRESS: "בתהליך", DONE: "הושלמה", CANCELLED: "בוטלה" }

export const ACTIVITY_TYPE = [
  "CALL",
  "WHATSAPP",
  "EMAIL",
  "MEETING",
  "NOTE",
  "LEAD_CREATED",
  "STATUS_CHANGED",
  "TASK_CREATED",
  "SYSTEM",
]
export const ACTIVITY_TYPE_LABELS = {
  CALL: "שיחת טלפון",
  WHATSAPP: "וואטסאפ",
  EMAIL: "אימייל",
  MEETING: "פגישה",
  NOTE: "הערה",
  LEAD_CREATED: "ליד נוצר",
  STATUS_CHANGED: "שינוי סטטוס",
  TASK_CREATED: "משימה נוצרה",
  SYSTEM: "מערכת",
}

export const ACTIVITY_DIRECTION = ["INBOUND", "OUTBOUND"]
export const ACTIVITY_DIRECTION_LABELS = { INBOUND: "נכנסת", OUTBOUND: "יוצאת" }

export const label = (map, value) => (value ? map[value] || value : "—")
