import { hashSync } from 'bcryptjs';

/**
 * Pre-defined user data for tests
 * Passwords are pre-hashed for efficiency
 */
export const users = [
  {
    email: 'admin@example.com',
    password: hashSync('admin123', 10),
    firstName: 'Admin',
    lastName: 'User',
    isAdmin: true,
  },
  {
    email: 'user@example.com',
    password: hashSync('user123', 10),
    firstName: 'Regular',
    lastName: 'User',
    isAdmin: false,
  },
  {
    email: 'manager@example.com',
    password: hashSync('manager123', 10),
    firstName: 'Manager',
    lastName: 'User',
    isAdmin: false,
  },
  {
    email: 'readonly@example.com',
    password: hashSync('readonly123', 10),
    firstName: 'ReadOnly',
    lastName: 'User',
    isAdmin: false,
  },
];

/**
 * Factory function to create a user with custom properties
 * @param overrides Properties to override in the default user
 * @returns A user object with default values merged with overrides
 */
export const createSimpleUser = (overrides: Record<string, any> = {}) => {
  const defaultUser = {
    email: `test@example.com`,
    password: hashSync('Password123!', 10),
    firstName: 'Test',
    lastName: 'User',
  };

  return { ...defaultUser, ...overrides };
};

/**
 * Create multiple users with sequential emails
 * @param count Number of users to create
 * @param baseProps Base properties to apply to all users
 * @returns Array of user objects
 */
export const createUsers = (
  count: number,
  baseProps: Record<string, any> = {},
) => {
  return Array(count)
    .fill(null)
    .map((_, index) =>
      createSimpleUser({
        email: `test.user${index}@example.com`,
        ...baseProps,
      }),
    );
};

/**
 * Plain text passwords for fixture users (for login tests)
 */
export const userCredentials = {
  admin: {
    email: 'admin@example.com',
    password: 'admin123',
  },
  regular: {
    email: 'user@example.com',
    password: 'user123',
  },
  manager: {
    email: 'manager@example.com',
    password: 'manager123',
  },
  readonly: {
    email: 'readonly@example.com',
    password: 'readonly123',
  },
};
