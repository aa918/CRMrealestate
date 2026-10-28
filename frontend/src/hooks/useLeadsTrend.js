import { useQuery } from "@tanstack/react-query"
import { apiList } from "../lib/apiClient"

function startOfDay(d) {
  const x = new Date(d)
  x.setHours(0, 0, 0, 0)
  return x
}

/**
 * Real 7-day new-leads trend, built by fetching leads received in the
 * window (existing /api/leads dateFrom/dateTo filter) and grouping them by
 * day client-side. Limited to the API's max page size (100) - fine for an
 * MVP-scale office; a dedicated aggregation endpoint would be the next
 * step if lead volume grows past that in a week.
 */
export function useLeadsTrend(days = 7) {
  const to = new Date()
  const from = startOfDay(new Date(to.getTime() - (days - 1) * 86400000))

  return useQuery({
    queryKey: ["dashboard", "leads-trend", days, from.toDateString()],
    queryFn: async () => {
      const res = await apiList("/leads", {
        params: { dateFrom: from.toISOString(), dateTo: to.toISOString(), limit: 100, sortBy: "receivedAt", sortOrder: "asc" },
      })

      const buckets = new Map()
      for (let i = 0; i < days; i++) {
        const day = startOfDay(new Date(from.getTime() + i * 86400000))
        buckets.set(day.toDateString(), {
          date: day,
          label: day.toLocaleDateString("he-IL", { weekday: "short" }),
          count: 0,
        })
      }

      for (const lead of res.data) {
        const key = startOfDay(new Date(lead.receivedAt)).toDateString()
        if (buckets.has(key)) buckets.get(key).count += 1
      }

      return { points: Array.from(buckets.values()), truncated: res.pagination.total > res.data.length }
    },
  })
}
