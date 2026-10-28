import { useQuery } from "@tanstack/react-query"
import { apiGet } from "../lib/apiClient"

export function useDashboardSummary() {
  return useQuery({
    queryKey: ["dashboard", "summary"],
    queryFn: () => apiGet("/dashboard/summary"),
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
