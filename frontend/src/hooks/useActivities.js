import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import { apiList, apiPost } from "../lib/apiClient"

export function useActivities(query = {}) {
  return useQuery({
    queryKey: ["activities", query],
    queryFn: () => apiList("/activities", { params: query }),
    enabled: Boolean(query.leadId || query.contactId) || Object.keys(query).length === 0,
  })
}

export function useLeadActivities(leadId) {
  return useActivities({ leadId, limit: 50 })
}

export function useCreateActivity() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (payload) => apiPost("/activities", payload),
    onSuccess: (_activity, variables) => {
      queryClient.invalidateQueries({ queryKey: ["activities"] })
      if (variables.leadId) {
        queryClient.invalidateQueries({ queryKey: ["lead", variables.leadId] })
        queryClient.invalidateQueries({ queryKey: ["leads"] })
      }
      if (variables.contactId) {
        queryClient.invalidateQueries({ queryKey: ["contact-activities", variables.contactId] })
      }
      queryClient.invalidateQueries({ queryKey: ["dashboard"] })
    },
  })
}
