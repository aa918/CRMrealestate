import { useQuery } from "@tanstack/react-query"
import { apiList } from "../lib/apiClient"

/**
 * Real counts for the always-on, non-toggleable backend automations
 * (agent round-robin assignment, automatic follow-up task creation) -
 * computed from actual Lead/Task records in the last 7 days, not invented.
 */
export function useAutomationStats() {
  return useQuery({
    queryKey: ["automation-stats"],
    queryFn: async () => {
      const since = new Date(Date.now() - 7 * 86400000).toISOString()
      const [leadsRes, followUpRes] = await Promise.all([
        apiList("/leads", { params: { dateFrom: since, limit: 100 } }),
        apiList("/tasks", { params: { type: "FOLLOW_UP", dueFrom: since, limit: 1 } }),
      ])

      const leads = leadsRes.data
      const assigned = leads.filter((l) => l.assignedUserId).length

      return {
        // Kept internally consistent: all three numbers below are computed
        // over the exact same fetched set (leads.length), even if the true
        // total (leadsRes.pagination.total) is larger than the page size.
        leadsReceived: leads.length,
        leadsReceivedTotal: leadsRes.pagination.total,
        leadsAssigned: assigned,
        leadsUnassigned: leads.length - assigned,
        followUpTasksCreated: followUpRes.pagination.total,
      }
    },
    refetchInterval: 60_000,
  })
}
