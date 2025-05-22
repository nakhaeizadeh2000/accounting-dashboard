/**
 * Permission actions
 */
export enum Action {
  CREATE = 'create',
  READ = 'read',
  UPDATE = 'update',
  DELETE = 'delete',
  MANAGE = 'manage',
  PUBLISH = 'publish',
  UNPUBLISH = 'unpublish',
  APPROVE = 'approve',
}

/**
 * Permission subjects (entities that can be acted upon)
 */
export enum Subject {
  USER = 'User',
  ARTICLE = 'Article',
  ROLE = 'Role',
  PERMISSION = 'Permission',
  ALL = 'all',
}

/**
 * Pre-defined permission data for tests
 */
export const permissions = [
  // User permissions
  {
    action: Action.CREATE,
    subject: Subject.USER,
    inverted: false,
    reason: 'Allow creating users',
  },
  {
    action: Action.READ,
    subject: Subject.USER,
    inverted: false,
    reason: 'Allow reading users',
  },
  {
    action: Action.UPDATE,
    subject: Subject.USER,
    inverted: false,
    reason: 'Allow updating users',
  },
  {
    action: Action.DELETE,
    subject: Subject.USER,
    inverted: false,
    reason: 'Allow deleting users',
  },

  // Article permissions
  {
    action: Action.CREATE,
    subject: Subject.ARTICLE,
    inverted: false,
    reason: 'Allow creating articles',
  },
  {
    action: Action.READ,
    subject: Subject.ARTICLE,
    inverted: false,
    reason: 'Allow reading articles',
  },
  {
    action: Action.UPDATE,
    subject: Subject.ARTICLE,
    inverted: false,
    reason: 'Allow updating articles',
  },
  {
    action: Action.DELETE,
    subject: Subject.ARTICLE,
    inverted: false,
    reason: 'Allow deleting articles',
  },
  {
    action: Action.PUBLISH,
    subject: Subject.ARTICLE,
    inverted: false,
    reason: 'Allow publishing articles',
  },
  {
    action: Action.UNPUBLISH,
    subject: Subject.ARTICLE,
    inverted: false,
    reason: 'Allow unpublishing articles',
  },

  // Role permissions
  {
    action: Action.CREATE,
    subject: Subject.ROLE,
    inverted: false,
    reason: 'Allow creating roles',
  },
  {
    action: Action.READ,
    subject: Subject.ROLE,
    inverted: false,
    reason: 'Allow reading roles',
  },
  {
    action: Action.UPDATE,
    subject: Subject.ROLE,
    inverted: false,
    reason: 'Allow updating roles',
  },
  {
    action: Action.DELETE,
    subject: Subject.ROLE,
    inverted: false,
    reason: 'Allow deleting roles',
  },

  // Permission permissions
  {
    action: Action.CREATE,
    subject: Subject.PERMISSION,
    inverted: false,
    reason: 'Allow creating permissions',
  },
  {
    action: Action.READ,
    subject: Subject.PERMISSION,
    inverted: false,
    reason: 'Allow reading permissions',
  },
  {
    action: Action.UPDATE,
    subject: Subject.PERMISSION,
    inverted: false,
    reason: 'Allow updating permissions',
  },
  {
    action: Action.DELETE,
    subject: Subject.PERMISSION,
    inverted: false,
    reason: 'Allow deleting permissions',
  },

  // Admin super-permission
  {
    action: Action.MANAGE,
    subject: Subject.ALL,
    inverted: false,
    reason: 'Admin permission to do everything',
  },

  // Field-level permissions
  {
    action: Action.READ,
    subject: Subject.ARTICLE,
    fields: ['title', 'content'],
    inverted: false,
    reason: 'Allow reading only title and content of articles',
  },

  // Conditions-based permissions
  {
    action: Action.UPDATE,
    subject: Subject.ARTICLE,
    inverted: false,
    reason: 'Allow updating own articles',
    conditions: { authorId: '${user.id}' }, // Template to be replaced at runtime
  },

  // Approval permissions
  {
    action: Action.APPROVE,
    subject: Subject.ARTICLE,
    inverted: false,
    reason: 'Allow approving articles',
  },
];

/**
 * Role definitions with associated permissions
 */
export const roles = [
  {
    name: 'Admin',
    description: 'Administrator with all permissions',
    permissions: [{ action: Action.MANAGE, subject: Subject.ALL }],
  },
  {
    name: 'Editor',
    description: 'Can edit and publish content',
    permissions: [
      { action: Action.READ, subject: Subject.USER },
      { action: Action.CREATE, subject: Subject.ARTICLE },
      { action: Action.READ, subject: Subject.ARTICLE },
      { action: Action.UPDATE, subject: Subject.ARTICLE },
      { action: Action.DELETE, subject: Subject.ARTICLE },
      { action: Action.PUBLISH, subject: Subject.ARTICLE },
      { action: Action.UNPUBLISH, subject: Subject.ARTICLE },
    ],
  },
  {
    name: 'Author',
    description: 'Can create and edit own content',
    permissions: [
      { action: Action.READ, subject: Subject.USER },
      { action: Action.CREATE, subject: Subject.ARTICLE },
      { action: Action.READ, subject: Subject.ARTICLE },
      {
        action: Action.UPDATE,
        subject: Subject.ARTICLE,
        conditions: { authorId: '${user.id}' },
      },
      {
        action: Action.DELETE,
        subject: Subject.ARTICLE,
        conditions: { authorId: '${user.id}' },
      },
    ],
  },
  {
    name: 'Reader',
    description: 'Can only read published content',
    permissions: [
      {
        action: Action.READ,
        subject: Subject.ARTICLE,
        conditions: { published: true },
      },
    ],
  },
];

/**
 * Factory function to create a permission with custom properties
 * @param overrides Properties to override in the default permission
 * @returns A permission object with default values merged with overrides
 */
export const createPermission = (overrides: Record<string, any> = {}) => {
  const defaultPermission = {
    action: Action.READ,
    subject: Subject.ARTICLE,
    inverted: false,
    reason: 'Test permission',
  };

  return { ...defaultPermission, ...overrides };
};
