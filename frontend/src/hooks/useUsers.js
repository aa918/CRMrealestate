import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import { apiList, apiPost, apiPatch } from "../lib/apiClient"

export function useUsers(query = {}) {
  return useQuery({
    queryKey: ["users", query],
    queryFn: () => apiList("/users", { params: query }),
  })
}

export function useAgents() {
  // AGENT-role users, for assignment dropdowns. isActive=true keeps the
  // list relevant (deactivated agents shouldn't receive new assignments).
  return useUsers({ role: "AGENT", isActive: true, limit: 100 })
}

export function useCreateUser() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (payload) => apiPost("/users", payload),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["users"] }),
  })
}

export function useUpdateUser() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ id, payload }) => apiPatch(`/users/${id}`, payload),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["users"] }),
  })
}
