const AUTH_TOKEN_KEY = 'teamflow_ops_auth_token'

export function getToken() {
  return window.localStorage.getItem(AUTH_TOKEN_KEY)
}

export function setToken(token: string) {
  window.localStorage.setItem(AUTH_TOKEN_KEY, token)
}

export function clearToken() {
  window.localStorage.removeItem(AUTH_TOKEN_KEY)
}
