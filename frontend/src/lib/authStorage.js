const TOKEN_KEY = "estateflow_token"

export function getToken() {
  try {
    return localStorage.getItem(TOKEN_KEY)
  } catch {
    return null
  }
}

export function setToken(token) {
  try {
    if (token) localStorage.setItem(TOKEN_KEY, token)
    else localStorage.removeItem(TOKEN_KEY)
  } catch {
    // localStorage unavailable (private mode, etc.) - session just won't persist across reloads.
  }
}

export function clearToken() {
  setToken(null)
}
