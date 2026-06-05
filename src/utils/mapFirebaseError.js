const ERROR_MAP = {
  'auth/user-disabled': 'This account has been disabled. Please contact your administrator.',
  'auth/user-not-found': 'No account found with this email address.',
  'auth/wrong-password': 'Incorrect password.',
  'auth/invalid-credential': 'Invalid email or password.',
  'auth/invalid-email': 'Invalid email format.',
  'auth/email-already-exists': 'This email is already in use.',
  'auth/email-already-in-use': 'This email is already in use.',
  'auth/weak-password': 'Password is too weak. Use at least 6 characters.',
  'auth/too-many-requests': 'Too many attempts. Please try again later.',
  'auth/requires-recent-login': 'Session expired. Please log out and log back in.',
  'auth/network-request-failed': 'Network error. Please check your connection.',
  'auth/popup-closed-by-user': null,

  'permission-denied': 'You do not have permission to perform this action.',
  'unavailable': 'Service temporarily unavailable. Please try again.',
  'not-found': 'The requested resource was not found.',
  'already-exists': 'This resource already exists.',
  'resource-exhausted': 'Service quota exceeded. Please try again later.',
  'failed-precondition': 'Operation failed. Please refresh and try again.',
  'aborted': 'Operation was aborted. Please try again.',
  'unauthenticated': 'Your session has expired. Please log in again.',
  'data-loss': 'Data integrity error. Please contact support.',

  'FETCH_ERROR': 'Network error. Please check your connection.',
  'NETWORK_ERROR': 'Network error. Please check your connection.',
}

export function mapFirebaseError(err, fallback = 'Something went wrong. Please try again.') {
  if (!err) return fallback
  const code = err.code || err
  if (code in ERROR_MAP) return ERROR_MAP[code]
  if (err.message && typeof err.message === 'string') return err.message
  return fallback
}

export function shouldSuppressError(err) {
  return err?.code === 'auth/popup-closed-by-user'
}
