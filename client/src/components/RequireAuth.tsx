import { useEffect, type ReactNode } from 'react'
import { Navigate, useLocation } from 'react-router-dom'
import { useAppDispatch } from '../app/hooks'
import { baseApi } from '../shared/api/baseApi'
import { useGetCurrentUserQuery } from '../shared/api/authApi'
import { clearToken, getToken } from '../shared/lib/authToken'

type RequireAuthProps = {
  children: ReactNode
}

function isUnauthorizedError(error: unknown) {
  return (
    typeof error === 'object' &&
    error !== null &&
    'status' in error &&
    error.status === 401
  )
}

function RequireAuth({ children }: RequireAuthProps) {
  const dispatch = useAppDispatch()
  const location = useLocation()
  const token = getToken()
  const {
    error,
    isError,
    isFetching,
    isLoading,
  } = useGetCurrentUserQuery(undefined, {
    skip: !token,
  })

  const isUnauthorized = isError && isUnauthorizedError(error)

  useEffect(() => {
    if (isUnauthorized) {
      clearToken()
      dispatch(baseApi.util.resetApiState())
    }
  }, [dispatch, isUnauthorized])

  if (!token) {
    return <Navigate replace state={{ from: location }} to="/login" />
  }

  if (isLoading || isFetching) {
    return <p>Checking your session...</p>
  }

  if (isUnauthorized) {
    return <Navigate replace state={{ from: location }} to="/login" />
  }

  if (isError) {
    return <p>Unable to verify your session. Please try again.</p>
  }

  return children
}

export default RequireAuth
