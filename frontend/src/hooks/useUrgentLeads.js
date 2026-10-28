import { useQuery } from "@tanstack/react-query"
import { apiList } from "../lib/apiClient"

/**
 * "Most urgently needs action" = OVERDUE leads first (oldest first), then
 * WAITING leads (oldest first) to fill the remaining slots. Built from two
 * real calls to the existing /api/leads filter API - no fabricated ranking,
 * no separate backend endpoint needed.
 */
export function useUrgentLeads(limit = 6) {
  return useQuery({
    queryKey: ["dashboard", "urgent-leads", limit],
    queryFn: async () => {
      const [overdue, waiting] = await Promise.all([
        apiList("/leads", { params: { responseStatus: "OVERDUE", sortBy: "receivedAt", sortOrder: "asc", limit } }),
        apiList("/leads", { params: { responseStatus: "WAITING", sortBy: "receivedAt", sortOrder: "asc", limit } }),
      ])
      const merged = [...overdue.data, ...waiting.data].slice(0, limit)
      return merged
    },
    refetchInterval: 60_000,
  })
}
