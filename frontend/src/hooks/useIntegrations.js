import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import { apiGet, apiList, apiPost } from "../lib/apiClient"

export function useIntegrationsStatus() {
  return useQuery({
    queryKey: ["integrations", "status"],
    queryFn: () => apiGet("/integrations/status"),
    refetchInterval: 30_000,
  })
}

export function useIntegrationLogs(query = {}) {
  return useQuery({
    queryKey: ["integrations", "logs", query],
    queryFn: () => apiList("/integrations/logs", { params: query }),
  })
}

export function useTestWhatsApp() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (payload) => apiPost("/integrations/whatsapp/test", payload),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["integrations"] }),
  })
}
