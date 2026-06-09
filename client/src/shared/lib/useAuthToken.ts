import { useEffect, useState } from 'react'
import { getToken, subscribeAuthTokenChanges } from './authToken'

export function useAuthToken() {
  const [token, setToken] = useState(() => getToken())

  useEffect(() => {
    return subscribeAuthTokenChanges(() => {
      setToken(getToken())
    })
  }, [])

  return token
}
