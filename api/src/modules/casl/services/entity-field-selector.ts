import { SelectQueryBuilder } from 'typeorm';
import { PermissionQueryBuilder } from './permission-query-builder.service';

/**
 * Type-safe field selector builder for entity permissions
 */
export class EntityFieldSelector<T> {
  private fieldMap: Record<string, string[]> = {};

  constructor(
    private queryBuilder: SelectQueryBuilder<T>,
    private permissionQueryBuilder: PermissionQueryBuilder,
    private userId: string,
    private action: string,
  ) {}

  /**
   * Select specific fields for an entity alias
   * @param alias The entity alias in the query
   * @param fields Array of field names to select
   */
  selectFields<E>(
    alias: string,
    fields: (keyof E & string)[],
  ): EntityFieldSelector<T> {
    this.fieldMap[alias] = fields as string[];
    return this;
  }

  /**
   * Apply the field selection with permission filtering
   */
  async apply(): Promise<SelectQueryBuilder<T>> {
    return this.permissionQueryBuilder.applyPermissionFilters(
      this.queryBuilder,
      this.userId,
      this.action,
      this.fieldMap,
    );
  }
}

// Add extension method to TypeORM's SelectQueryBuilder
declare module 'typeorm/query-builder/SelectQueryBuilder' {
  interface SelectQueryBuilder<Entity> {
    withPermissions(
      permissionQueryBuilder: PermissionQueryBuilder,
      userId: string,
      action: string,
    ): EntityFieldSelector<Entity>;
  }
}

// Implement the extension
SelectQueryBuilder.prototype.withPermissions = function (
  permissionQueryBuilder: PermissionQueryBuilder,
  userId: string,
  action: string,
) {
  return new EntityFieldSelector(this, permissionQueryBuilder, userId, action);
};
