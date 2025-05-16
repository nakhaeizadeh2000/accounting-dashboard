/**
 * Defines all possible actions for permission-based authorization
 * Using enum for better type safety
 */
export enum Action {
  SUPER_MODIFY = 'super-modify',
  MANAGE = 'manage',
  READ = 'read',
  UPDATE = 'update',
  DELETE = 'delete',
  CREATE = 'create',
  UPDATE_USER_ROLES = 'update-user-roles',
}

// For backward compatibility
export type Actions = Action | string;
