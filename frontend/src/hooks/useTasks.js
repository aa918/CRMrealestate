import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import { apiList, apiGet, apiPost, apiPatch, apiDelete } from "../lib/apiClient"

export function useTasks(query = {}) {
  return useQuery({
    queryKey: ["tasks", query],
    queryFn: () => apiList("/tasks", { params: query }),
    placeholderData: (prev) => prev,
  })
}

export function useLeadTasks(leadId) {
  return useTasks({ leadId, limit: 50 })
}

export function useTasksToday() {
  return useQuery({
    queryKey: ["tasks", "today"],
    queryFn: () => apiGet("/tasks/today"),
    refetchInterval: 60_000,
  })
}

export function useTask(id) {
  return useQuery({
    queryKey: ["task", id],
    queryFn: () => apiGet(`/tasks/${id}`),
    enabled: Boolean(id),
  })
}

export function useCreateTask() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (payload) => apiPost("/tasks", payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["tasks"] })
      queryClient.invalidateQueries({ queryKey: ["dashboard"] })
    },
  })
}

export function useUpdateTask() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ id, payload }) => apiPatch(`/tasks/${id}`, payload),
    onSuccess: (task) => {
      queryClient.invalidateQueries({ queryKey: ["tasks"] })
      queryClient.invalidateQueries({ queryKey: ["task", task.id] })
      queryClient.invalidateQueries({ queryKey: ["dashboard"] })
    },
  })
}

export function useDeleteTask() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (id) => apiDelete(`/tasks/${id}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["tasks"] })
      queryClient.invalidateQueries({ queryKey: ["dashboard"] })
    },
  })
}
