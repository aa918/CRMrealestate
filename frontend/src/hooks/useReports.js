import { useQuery } from "@tanstack/react-query"
import { apiList } from "../lib/apiClient"
import { responseMinutes } from "../lib/format"

function average(numbers) {
  if (!numbers.length) return null
  return Math.round((numbers.reduce((a, b) => a + b, 0) / numbers.length) * 10) / 10
}

function groupCount(items, keyFn) {
  const map = new Map()
  for (const item of items) {
    const key = keyFn(item) || "לא ידוע"
    map.set(key, (map.get(key) || 0) + 1)
  }
  return Array.from(map.entries()).map(([key, count]) => ({ key, count }))
}

/**
 * All figures here are computed from real /api/leads and /api/deals
 * records within the selected date range (capped at the API's 100-row
 * page size - noted explicitly where it matters for an MVP-scale office).
 */
export function useReportsData({ dateFrom, dateTo }) {
  return useQuery({
    queryKey: ["reports", dateFrom, dateTo],
    queryFn: async () => {
      const [leadsRes, dealsRes] = await Promise.all([
        apiList("/leads", { params: { dateFrom, dateTo, limit: 100 } }),
        apiList("/deals", { params: { limit: 100 } }),
      ])

      const leads = leadsRes.data
      const deals = dealsRes.data.filter((d) => {
        if (!d.closedAt) return false
        const closed = new Date(d.closedAt).getTime()
        return closed >= new Date(dateFrom).getTime() && closed <= new Date(dateTo).getTime()
      })

      const bySource = groupCount(leads, (l) => l.source)
      const byStatus = groupCount(leads, (l) => l.status)
      const byAgentMap = new Map()
      for (const lead of leads) {
        const key = lead.assignedUser ? `${lead.assignedUser.firstName} ${lead.assignedUser.lastName}` : "לא מוקצה"
        if (!byAgentMap.has(key)) byAgentMap.set(key, { leads: 0, won: 0, responseMinutes: [] })
        const entry = byAgentMap.get(key)
        entry.leads += 1
        if (lead.status === "WON") entry.won += 1
        const rt = responseMinutes(lead.receivedAt, lead.firstResponseAt)
        if (rt !== null) entry.responseMinutes.push(rt)
      }
      const byAgent = Array.from(byAgentMap.entries()).map(([name, v]) => ({
        name,
        leads: v.leads,
        won: v.won,
        avgResponseMinutes: average(v.responseMinutes),
      }))

      const won = leads.filter((l) => l.status === "WON").length
      const conversionRate = leads.length > 0 ? Math.round((won / leads.length) * 1000) / 10 : null

      const wonDeals = deals.filter((d) => d.stage === "WON")
      const lostDeals = deals.filter((d) => d.stage === "LOST")

      return {
        totalLeads: leadsRes.pagination.total,
        sampleSize: leads.length,
        truncated: leadsRes.pagination.total > leads.length,
        bySource,
        byStatus,
        byAgent,
        conversionRate,
        wonLeadsCount: won,
        closedDeals: {
          won: wonDeals.length,
          lost: lostDeals.length,
          wonValue: wonDeals.reduce((sum, d) => sum + Number(d.value || 0), 0),
        },
      }
    },
  })
}
