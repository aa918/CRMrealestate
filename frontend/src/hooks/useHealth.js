import { useQuery } from "@tanstack/react-query"
import { apiClient } from "../lib/apiClient"

// /api/health responds with { status, database, timestamp } directly (no
// { success, data } envelope - it's meant to be a dead-simple infra probe),
// so this calls apiClient directly instead of the apiGet() envelope helper.
export function useHealth() {
  return useQuery({
    queryKey: ["health"],
    queryFn: () => apiClient.get("/health"),
    refetchInterval: 60_000,
    retry: 0,
    staleTime: 30_000,
  })
}
