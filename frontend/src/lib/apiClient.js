import axios from "axios"
import { getToken, clearToken } from "./authStorage"

export class ApiError extends Error {
  constructor(message, { code, status, details } = {}) {
    super(message)
    this.name = "ApiError"
    this.code = code
    this.status = status
    this.details = details
  }
}

const baseURL = import.meta.env.VITE_API_BASE_URL || "/api"

export const apiClient = axios.create({ baseURL, timeout: 15000 })

apiClient.interceptors.request.use((config) => {
  const token = getToken()
  if (token) config.headers.Authorization = `Bearer ${token}`
  return config
})

// Session-expiry handling is wired up by AuthProvider (it owns the redirect
// to /login) so this module never imports the router directly.
let unauthorizedHandler = null
export function setUnauthorizedHandler(fn) {
  unauthorizedHandler = fn
}

apiClient.interceptors.response.use(
  (response) => response.data,
  (error) => {
    if (!error.response) {
      return Promise.reject(new ApiError("לא ניתן להתחבר לשרת. בדוק את החיבור ונסה שוב.", { code: "NETWORK_ERROR" }))
    }

    const { status, data } = error.response
    const backendError = data?.error

    if (status === 401) {
      clearToken()
      if (unauthorizedHandler) unauthorizedHandler()
    }

    return Promise.reject(
      new ApiError(backendError?.message || "אירעה שגיאה. נסה שוב.", {
        code: backendError?.code,
        status,
        details: backendError?.details,
      })
    )
  }
)

/** GET that returns the full { data, pagination? } envelope - for list views. */
export function apiList(url, config) {
  return apiClient.get(url, config)
}

/** GET that returns only the payload - for single-resource reads. */
export async function apiGet(url, config) {
  const envelope = await apiClient.get(url, config)
  return envelope.data
}

export async function apiPost(url, body, config) {
  const envelope = await apiClient.post(url, body, config)
  return envelope.data
}

export async function apiPatch(url, body, config) {
  const envelope = await apiClient.patch(url, body, config)
  return envelope.data
}

export async function apiDelete(url, config) {
  const envelope = await apiClient.delete(url, config)
  return envelope?.data
}
