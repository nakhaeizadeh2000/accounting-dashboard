import { applyDecorators, UseInterceptors } from '@nestjs/common';
import { FieldPermissionInterceptor } from '../interceptors/field-permission.interceptor';

/**
 * Apply field-level permission filtering to a controller method
 */
export function FilterFields() {
  return applyDecorators(UseInterceptors(FieldPermissionInterceptor));
}
