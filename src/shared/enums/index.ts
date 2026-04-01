/**
 * Response Messages
 */
export const ResponseMessage = {
  USER_REGISTERED: 'User registered successfully',
  USER_LOGGED_IN: 'User logged in successfully',
  USER_CREATED: 'User created successfully',
  USER_UPDATED: 'User updated successfully',
  USER_DELETED: 'User deleted successfully',
} as const;

/**
 * Error Messages
 */
export const ErrorMessage = {
  NAME_REQUIRED: 'Name is required',
  EMAIL_REQUIRED: 'Email is required',
  PASSWORD_REQUIRED: 'Password is required',
  NAME_MIN_LENGTH: 'Name must be at least 3 characters long',
  NAME_MAX_LENGTH: 'Name must not exceed 100 characters',
  PASSWORD_MIN_LENGTH: 'Password must be at least 6 characters long',
  PASSWORD_MAX_LENGTH: 'Password must not exceed 255 characters',
  EMAIL_MAX_LENGTH: 'Email must not exceed 50 characters',
  EMAIL_INVALID: 'Email must be a valid email address',
  NAME_EMAIL_EXISTS: 'A user with this name or email already exists',
  INVALID_CREDENTIALS: 'Invalid email or password',
  USER_NOT_FOUND: 'User not found',
} as const;
