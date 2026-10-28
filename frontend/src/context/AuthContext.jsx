import { createContext, useContext, useEffect, useState, useCallback } from "react"
import { useNavigate } from "react-router-dom"
import { apiGet, apiPost, setUnauthorizedHandler } from "../lib/apiClient"
import { getToken, setToken, clearToken } from "../lib/authStorage"

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)
  const [organization, setOrganization] = useState(null)
  const [isLoading, setIsLoading] = useState(true)
  const navigate = useNavigate()

  const loadMe = useCallback(async () => {
    if (!getToken()) {
      setUser(null)
      setOrganization(null)
      setIsLoading(false)
      return
    }
    try {
      const { organization: org, ...me } = await apiGet("/auth/me")
      setUser(me)
      setOrganization(org)
    } catch {
      setUser(null)
      setOrganization(null)
      clearToken()
    } finally {
      setIsLoading(false)
    }
  }, [])

  useEffect(() => {
    loadMe()
  }, [loadMe])

  // Any 401 from the API (expired/invalid token) drops the session and
  // sends the user back to login - wired through apiClient so every
  // request benefits, not just ones made through this context.
  useEffect(() => {
    setUnauthorizedHandler(() => {
      setUser(null)
      navigate("/login", { replace: true })
    })
    return () => setUnauthorizedHandler(null)
  }, [navigate])

  const login = useCallback(async (email, password) => {
    const result = await apiPost("/auth/login", { email, password })
    setToken(result.token)
    setUser(result.user)
    setOrganization(result.organization)
    return result.user
  }, [])

  const register = useCallback(async (payload) => {
    const result = await apiPost("/auth/register", payload)
    setToken(result.token)
    setUser(result.user)
    setOrganization(result.organization)
    return result.user
  }, [])

  const logout = useCallback(() => {
    clearToken()
    setUser(null)
    setOrganization(null)
    navigate("/login", { replace: true })
  }, [navigate])

  const value = {
    user,
    organization,
    isLoading,
    isAuthenticated: Boolean(user),
    login,
    register,
    logout,
    refresh: loadMe,
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error("useAuth must be used within an AuthProvider")
  return ctx
}
