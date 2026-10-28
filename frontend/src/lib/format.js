const currencyFormatter = new Intl.NumberFormat("he-IL", {
  style: "currency",
  currency: "ILS",
  maximumFractionDigits: 0,
})

const numberFormatter = new Intl.NumberFormat("he-IL")

export function formatCurrency(value) {
  if (value === null || value === undefined || value === "") return "—"
  const n = Number(value)
  if (Number.isNaN(n)) return "—"
  return currencyFormatter.format(n)
}

export function formatNumber(value) {
  if (value === null || value === undefined || value === "") return "—"
  const n = Number(value)
  if (Number.isNaN(n)) return "—"
  return numberFormatter.format(n)
}

export function formatDate(value) {
  if (!value) return "—"
  const d = new Date(value)
  if (Number.isNaN(d.getTime())) return "—"
  return d.toLocaleDateString("he-IL", { day: "2-digit", month: "2-digit", year: "numeric" })
}

export function formatDateTime(value) {
  if (!value) return "—"
  const d = new Date(value)
  if (Number.isNaN(d.getTime())) return "—"
  return d.toLocaleString("he-IL", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  })
}

export function formatTime(value) {
  if (!value) return "—"
  const d = new Date(value)
  if (Number.isNaN(d.getTime())) return "—"
  return d.toLocaleTimeString("he-IL", { hour: "2-digit", minute: "2-digit" })
}

/** Human "X דקות / שעות / ימים" elapsed-time phrase, used for response timers. */
export function formatDuration(fromIso, toIso = new Date()) {
  if (!fromIso) return "—"
  // A falsy toIso (e.g. lead.firstResponseAt === null before any
  // response) must mean "elapsed until now", not Date(null) === epoch -
  // explicit null overrides the default parameter in JS, so guard here.
  const from = new Date(fromIso).getTime()
  const to = toIso ? new Date(toIso).getTime() : Date.now()
  const diffMs = Math.max(0, to - from)
  const minutes = Math.round(diffMs / 60000)

  if (minutes < 1) return "עכשיו"
  if (minutes < 60) return `${minutes} דק׳`
  const hours = Math.floor(minutes / 60)
  const remMinutes = minutes % 60
  if (hours < 24) return remMinutes > 0 ? `${hours} שע׳ ${remMinutes} דק׳` : `${hours} שע׳`
  const days = Math.floor(hours / 24)
  return `${days} ${days === 1 ? "יום" : "ימים"}`
}

/** Raw minutes between receipt and first response, for aggregation (null if not yet responded). */
export function responseMinutes(receivedAt, firstResponseAt) {
  if (!receivedAt || !firstResponseAt) return null
  const diffMs = new Date(firstResponseAt).getTime() - new Date(receivedAt).getTime()
  return Math.max(0, Math.round(diffMs / 60000))
}

export function formatMinutes(minutes) {
  if (minutes === null || minutes === undefined) return "—"
  if (minutes < 60) return `${Math.round(minutes)} דק׳`
  const hours = Math.floor(minutes / 60)
  const rem = Math.round(minutes % 60)
  return rem > 0 ? `${hours} שע׳ ${rem} דק׳` : `${hours} שע׳`
}

/** Local greeting based on the current hour - used on the dashboard header. */
export function greeting() {
  const hour = new Date().getHours()
  if (hour < 12) return "בוקר טוב"
  if (hour < 18) return "צהריים טובים"
  return "ערב טוב"
}

export function initials(firstName, lastName) {
  const a = (firstName || "").trim()[0] || ""
  const b = (lastName || "").trim()[0] || ""
  return (a + b).toUpperCase() || "?"
}

export function fullName(entity) {
  if (!entity) return "—"
  return [entity.firstName, entity.lastName].filter(Boolean).join(" ") || "—"
}
