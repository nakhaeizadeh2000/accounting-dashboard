import { SetMetadata } from '@nestjs/common';

export const IS_ADMIN_KEY = 'isAdmin';
export const RequireAdmin = (isAdmin: boolean) =>
  SetMetadata(IS_ADMIN_KEY, isAdmin);
