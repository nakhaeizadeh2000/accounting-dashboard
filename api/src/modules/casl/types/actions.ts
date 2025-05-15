// export enum Actions {
//   SuperAccess = 'super-modify',
//   Manage = 'manage',
//   Create = 'create',
//   Read = 'read',
//   Update = 'update',
//   Delete = 'delete',
// }

export type Actions =
  | 'super-modify'
  | 'manage'
  | 'read'
  | 'update'
  | 'delete'
  | 'create'
  | 'update-user-roles';
