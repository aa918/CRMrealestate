import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import { apiList, apiGet, apiPost, apiPatch, apiDelete } from "../lib/apiClient"

export function useLeads(query = {}) {
  return useQuery({
    queryKey: ["leads", query],
    queryFn: () => apiList("/leads", { params: query }),
    placeholderData: (prev) => prev,
  })
}

export function useContactLeads(contactId) {
  return useLeads({ contactId, limit: 50 })
}

export function useLead(id) {
  return useQuery({
    queryKey: ["lead", id],
    queryFn: () => apiGet(`/leads/${id}`),
    enabled: Boolean(id),
  })
}

export function useCreateLead() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (payload) => apiPost("/leads", payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["leads"] })
      queryClient.invalidateQueries({ queryKey: ["dashboard"] })
      queryClient.invalidateQueries({ queryKey: ["contacts"] })
      queryClient.invalidateQueries({ queryKey: ["tasks"] })
    },
  })
}

export function useUpdateLead() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ id, payload }) => apiPatch(`/leads/${id}`, payload),
    onSuccess: (lead) => {
      queryClient.invalidateQueries({ queryKey: ["leads"] })
      queryClient.invalidateQueries({ queryKey: ["lead", lead.id] })
      queryClient.invalidateQueries({ queryKey: ["dashboard"] })
      queryClient.invalidateQueries({ queryKey: ["activities"] })
    },
  })
}

export function useDeleteLead() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (id) => apiDelete(`/leads/${id}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["leads"] })
      queryClient.invalidateQueries({ queryKey: ["dashboard"] })
    },
  })
}
