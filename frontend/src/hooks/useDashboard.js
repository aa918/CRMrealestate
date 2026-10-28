import { useQuery } from "@tanstack/react-query"
import { apiGet } from "../lib/apiClient"

export function useDashboardSummary() {
  return useQuery({
    queryKey: ["dashboard", "summary"],
    queryFn: () => apiGet("/dashboard/summary"),
    refetchInterval: 60_000,
  })
}

export function useRecentLeads(limit = 8) {
  return useQuery({
    queryKey: ["dashboard", "recent-leads", limit],
    queryFn: () => apiGet("/dashboard/recent-leads", { params: { limit } }),
    refetchInterval: 60_000,
  })
}

export function useResponsePerformance() {
  return useQuery({
    queryKey: ["dashboard", "response-performance"],
    queryFn: () => apiGet("/dashboard/response-performance"),
    refetchInterval: 60_000,
  })
}
