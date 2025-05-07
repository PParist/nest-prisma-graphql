/**
 * String constants for use throughout the application
 */
export const Constants = {
  // Authentication related
  AUTH: {
    JWT_SECRET: 'JWT_SECRET',
    ACCESS_TOKEN_EXPIRATION: 'ACCESS_TOKEN_EXPIRATION',
    REFRESH_TOKEN_EXPIRATION: 'REFRESH_TOKEN_EXPIRATION',
  },

  // Database related
  DATABASE: {
    CONNECTION_STRING: 'DATABASE_URL',
  },

  // Validation messages
  VALIDATION: {
    EMAIL_REQUIRED: 'Email is required',
    EMAIL_INVALID: 'Email format is invalid',
    PASSWORD_REQUIRED: 'Password is required',
    PASSWORD_LENGTH: 'Password must be at least 8 characters',
    USERNAME_REQUIRED: 'Username is required',
  },

  // Error messages
  ERRORS: {
    USER_NOT_FOUND: 'User not found',
    UNAUTHORIZED: 'Unauthorized access',
    FORBIDDEN: 'Forbidden resource',
    INTERNAL_SERVER: 'Internal server error',
  },

  // Success messages
  SUCCESS: {
    USER_CREATED: 'User created successfully',
    USER_UPDATED: 'User updated successfully',
    USER_DELETED: 'User deleted successfully',
  },

  // Parameter names
  ROLES: {
    ADMIN: 'admin',
    USER: 'user',
    GUEST: 'guest',
  },
};
