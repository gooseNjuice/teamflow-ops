import { afterEach, describe, expect, it, vi } from 'vitest'
import {
  clearToken,
  getToken,
  setToken,
  subscribeAuthTokenChanges,
} from './authToken'

afterEach(() => {
  window.localStorage.clear()
  vi.restoreAllMocks()
})

describe('auth token utility', () => {
  it('stores, reads, and clears the auth token', () => {
    expect(getToken()).toBeNull()

    setToken('test-token')

    expect(getToken()).toBe('test-token')

    clearToken()

    expect(getToken()).toBeNull()
  })

  it('notifies subscribers when the token changes', () => {
    const listener = vi.fn()
    const unsubscribe = subscribeAuthTokenChanges(listener)

    setToken('first-token')
    clearToken()
    unsubscribe()
    setToken('second-token')

    expect(listener).toHaveBeenCalledTimes(2)
  })
})
