export const permissionDeniedMessage =
  'You do not have permission to perform this action.'

export function isApiErrorWithStatus(error: unknown, status: number) {
  return (
    typeof error === 'object' &&
    error !== null &&
    'status' in error &&
    error.status === status
  )
}

export function getPermissionAwareErrorMessage(
  error: unknown,
  fallbackMessage: string,
) {
  return isApiErrorWithStatus(error, 403)
    ? permissionDeniedMessage
    : fallbackMessage
}
