import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import { apiList, apiGet, apiPost, apiPatch, apiDelete } from "../lib/apiClient"

export function useDeals(query = {}) {
  return useQuery({
    queryKey: ["deals", query],
    queryFn: () => apiList("/deals", { params: query }),
    placeholderData: (prev) => prev,
  })
}

export function useLeadDeals(leadId) {
  return useDeals({ leadId, limit: 50 })
}

export function useContactDeals(contactId) {
  return useDeals({ contactId, limit: 50 })
}

export function useDeal(id) {
  return useQuery({
    queryKey: ["deal", id],
    queryFn: () => apiGet(`/deals/${id}`),
    enabled: Boolean(id),
  })
}

export function useCreateDeal() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (payload) => apiPost("/deals", payload),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["deals"] }),
  })
}

export function useUpdateDeal() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ id, payload }) => apiPatch(`/deals/${id}`, payload),
    onSuccess: (deal) => {
      queryClient.invalidateQueries({ queryKey: ["deals"] })
      queryClient.invalidateQueries({ queryKey: ["deal", deal.id] })
      queryClient.invalidateQueries({ queryKey: ["leads"] })
      queryClient.invalidateQueries({ queryKey: ["dashboard"] })
    },
  })
}

export function useDeleteDeal() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (id) => apiDelete(`/deals/${id}`),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["deals"] }),
  })
}
