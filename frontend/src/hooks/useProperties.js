import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import { apiList, apiPost, apiPatch, apiDelete } from "../lib/apiClient"

export function useProperties(query = {}) {
  return useQuery({
    queryKey: ["properties", query],
    queryFn: () => apiList("/properties", { params: query }),
    placeholderData: (prev) => prev,
  })
}

export function useCreateProperty() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (payload) => apiPost("/properties", payload),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["properties"] }),
  })
}

export function useUpdateProperty() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ id, payload }) => apiPatch(`/properties/${id}`, payload),
    onSuccess: (property) => {
      queryClient.invalidateQueries({ queryKey: ["properties"] })
      queryClient.invalidateQueries({ queryKey: ["property", property.id] })
    },
  })
}

export function useDeleteProperty() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (id) => apiDelete(`/properties/${id}`),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["properties"] }),
  })
}
