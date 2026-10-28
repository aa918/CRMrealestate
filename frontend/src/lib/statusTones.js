// Central mapping from backend enum values to a visual "tone" so every
// badge in the app (leads, tasks, deals, properties) stays consistent.

export const RESPONSE_STATUS_TONE = { WAITING: "warning", RESPONDED: "success", OVERDUE: "danger" }

export const LEAD_STATUS_TONE = {
  NEW: "info",
  CONTACTED: "info",
  QUALIFIED: "info",
  MEETING: "warning",
  PROPERTY_SENT: "warning",
  PROPERTY_VISIT: "warning",
  NEGOTIATION: "warning",
  WON: "success",
  LOST: "neutral",
}

export const DEAL_STAGE_TONE = {
  OPEN: "info",
  MEETING: "warning",
  OFFER: "warning",
  NEGOTIATION: "warning",
  WON: "success",
  LOST: "neutral",
}

export const TASK_STATUS_TONE = { OPEN: "info", IN_PROGRESS: "warning", DONE: "success", CANCELLED: "neutral" }

export const TASK_PRIORITY_TONE = { LOW: "neutral", MEDIUM: "info", HIGH: "warning", URGENT: "danger" }

export const PROPERTY_STATUS_TONE = {
  AVAILABLE: "success",
  RESERVED: "warning",
  SOLD: "neutral",
  RENTED: "neutral",
  INACTIVE: "neutral",
}

export const INTEGRATION_RESULT_TONE = { SUCCESS: "success", FAILED: "danger" }
