const AUTH_TOKEN_KEY = 'teamflow_ops_auth_token'
const AUTH_TOKEN_CHANGED_EVENT = 'teamflow_ops_auth_token_changed'

function emitAuthTokenChanged() {
  window.dispatchEvent(new Event(AUTH_TOKEN_CHANGED_EVENT))
}

export function getToken() {
  return window.localStorage.getItem(AUTH_TOKEN_KEY)
}

export function setToken(token: string) {
  window.localStorage.setItem(AUTH_TOKEN_KEY, token)
  emitAuthTokenChanged()
}

export function clearToken() {
  window.localStorage.removeItem(AUTH_TOKEN_KEY)
  emitAuthTokenChanged()
}

export function subscribeAuthTokenChanges(listener: () => void) {
  function handleStorage(event: StorageEvent) {
    if (event.key === AUTH_TOKEN_KEY) {
      listener()
    }
  }

  window.addEventListener(AUTH_TOKEN_CHANGED_EVENT, listener)
  window.addEventListener('storage', handleStorage)

  return () => {
    window.removeEventListener(AUTH_TOKEN_CHANGED_EVENT, listener)
    window.removeEventListener('storage', handleStorage)
  }
}
