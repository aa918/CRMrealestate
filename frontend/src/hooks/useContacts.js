import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import { apiList, apiGet, apiPost, apiPatch, apiDelete } from "../lib/apiClient"

export function useContacts(query = {}) {
  return useQuery({
    queryKey: ["contacts", query],
    queryFn: () => apiList("/contacts", { params: query }),
    placeholderData: (prev) => prev,
  })
}

export function useContact(id) {
  return useQuery({
    queryKey: ["contact", id],
    queryFn: () => apiGet(`/contacts/${id}`),
    enabled: Boolean(id),
  })
}

export function useContactActivities(id, query = {}) {
  return useQuery({
    queryKey: ["contact-activities", id, query],
    queryFn: () => apiList(`/contacts/${id}/activities`, { params: query }),
    enabled: Boolean(id),
  })
}

export function useCreateContact() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (payload) => apiPost("/contacts", payload),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["contacts"] }),
  })
}

export function useUpdateContact() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ id, payload }) => apiPatch(`/contacts/${id}`, payload),
    onSuccess: (contact) => {
      queryClient.invalidateQueries({ queryKey: ["contacts"] })
      queryClient.invalidateQueries({ queryKey: ["contact", contact.id] })
    },
  })
}

export function useDeleteContact() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (id) => apiDelete(`/contacts/${id}`),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["contacts"] }),
  })
}
