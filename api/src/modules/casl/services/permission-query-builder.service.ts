import { Injectable, Logger, BadRequestException } from '@nestjs/common';
import { Repository, SelectQueryBuilder, EntityMetadata } from 'typeorm';
import { CaslService } from '../casl.service';

// Create our own interface to replace the internal TypeORM JoinAttribute
interface JoinInfo {
  alias: {
    name: string;
  };
  metadata?: EntityMetadata;
  parentAlias?: string;
}

@Injectable()
export class PermissionQueryBuilder {
  private readonly logger = new Logger(PermissionQueryBuilder.name);

  constructor(private caslService: CaslService) {}

  /**
   * Apply permission filters to a query builder including field-level permissions
   * Enhanced to support nested entity permissions and specific field selection
   * @param specificFields Optional parameter to further narrow down fields by entity alias
   */
  async applyPermissionFilters<T>(
    queryBuilder: SelectQueryBuilder<T>,
    userId: string,
    action: string,
    specificFields?: Record<string, string[]>,
  ): Promise<SelectQueryBuilder<T>> {
    try {
      const ability = await this.caslService.getUserAbility(userId);
      const mainAlias = queryBuilder.expressionMap.mainAlias;

      if (!mainAlias) {
        throw new BadRequestException('Query builder must have a main alias');
      }

      const entityName = mainAlias.metadata?.name;
      const alias = mainAlias.name;

      if (!entityName || !alias) {
        throw new BadRequestException('Invalid query builder configuration');
      }

      // Get all rules that apply to this entity and action
      const rules = ability.rulesFor(action, entityName);

      // If no rules allow this action, return empty result
      if (rules.length === 0 || rules.every((rule) => rule.inverted)) {
        // Force empty result by adding impossible condition
        return queryBuilder.andWhere('1 = 0');
      }

      // Get only the "allow" rules (not inverted)
      const allowRules = rules.filter((rule) => !rule.inverted);

      if (allowRules.length === 0) {
        // If no allow rules, return empty result
        return queryBuilder.andWhere('1 = 0');
      }

      // Apply field-level permissions to main entity and joined entities
      await this.applyFieldPermissionsWithJoins(
        queryBuilder,
        ability,
        allowRules,
        mainAlias.metadata,
        alias,
        action,
        userId,
        specificFields,
      );

      // Process each rule's conditions
      const conditions = allowRules
        .filter((rule) => rule.conditions)
        .map((rule) => this.processConditions(rule.conditions, alias));

      if (conditions.length > 0) {
        // Combine all conditions with OR (any matching condition grants access)
        const whereCondition = conditions
          .map((cond) => `(${cond})`)
          .join(' OR ');
        queryBuilder.andWhere(whereCondition);
      }

      return queryBuilder;
    } catch (error) {
      this.logger.error(
        `Error applying permission filters: ${error.message}`,
        error.stack,
      );
      // Don't expose internal errors, but make sure query returns nothing on error
      return queryBuilder.andWhere('1 = 0');
    }
  }

  /**
   * Apply field-level permissions to the query builder with support for nested joins
   * Enhanced to support specific field selection
   */
  private async applyFieldPermissionsWithJoins<T>(
    queryBuilder: SelectQueryBuilder<T>,
    ability: any,
    mainEntityRules: any[],
    entityMetadata: EntityMetadata,
    alias: string,
    action: string,
    userId: string,
    specificFields?: Record<string, string[]>,
  ): Promise<void> {
    try {
      // First, handle the main entity fields
      const allowedMainEntityFields = this.getEntityAllowedFields(
        mainEntityRules,
        entityMetadata,
      );

      // Start with a clean slate - clear all selections
      queryBuilder.select([]);

      // If specific fields requested for main entity, narrow down allowed fields
      const mainEntityFieldsToSelect =
        specificFields && specificFields[alias]
          ? this.narrowFields(allowedMainEntityFields, specificFields[alias])
          : allowedMainEntityFields;

      // Add the main entity fields
      if (mainEntityFieldsToSelect.length > 0) {
        for (const field of mainEntityFieldsToSelect) {
          queryBuilder.addSelect(`${alias}.${field}`);
        }
      }

      // Handle all joined entities
      if (queryBuilder.expressionMap.joinAttributes.length > 0) {
        await Promise.all(
          queryBuilder.expressionMap.joinAttributes.map(
            async (join: JoinInfo) => {
              await this.applyJoinEntityFieldPermissions(
                queryBuilder,
                join,
                ability,
                action,
                userId,
                specificFields,
              );
            },
          ),
        );
      }
    } catch (error) {
      this.logger.error(
        `Error applying field permissions: ${error.message}`,
        error.stack,
      );
      // On error, default to minimal field selection for security
      queryBuilder.select([]);

      // Only select primary key of main entity
      const primaryColumn = entityMetadata.primaryColumns[0]?.propertyName;
      if (primaryColumn) {
        queryBuilder.addSelect(`${alias}.${primaryColumn}`);
      }
    }
  }

  /**
   * Helper to narrow down permitted fields to only those specifically requested
   */
  private narrowFields(
    permittedFields: string[],
    requestedFields: string[],
  ): string[] {
    // Create set of permitted fields for efficient lookup
    const permittedSet = new Set(permittedFields);

    // Filter requested fields to only those that are permitted
    return requestedFields
      .map((field) => this.sanitizeFieldName(field))
      .filter((field) => field && permittedSet.has(field));
  }

  /**
   * Apply field permissions to a joined entity
   */
  private async applyJoinEntityFieldPermissions<T>(
    queryBuilder: SelectQueryBuilder<T>,
    join: JoinInfo,
    ability: any,
    action: string,
    userId: string,
    specificFields?: Record<string, string[]>,
  ): Promise<void> {
    const joinAlias = join.alias.name;
    const joinMetadata = join.metadata;

    if (!joinMetadata) {
      return;
    }

    const joinEntityName = joinMetadata.name;

    // Get rules for this joined entity
    const joinRules = ability.rulesFor(action, joinEntityName);
    const joinAllowRules = joinRules.filter((rule) => !rule.inverted);

    // Get allowed fields for this joined entity
    const allowedJoinFields = this.getEntityAllowedFields(
      joinAllowRules,
      joinMetadata,
    );

    // Always include primary key for proper joining
    const primaryKey = joinMetadata.primaryColumns[0]?.propertyName;
    if (primaryKey && !allowedJoinFields.includes(primaryKey)) {
      allowedJoinFields.push(primaryKey);
    }

    // If specific fields requested for this join, narrow down allowed fields
    const joinFieldsToSelect =
      specificFields && specificFields[joinAlias]
        ? this.narrowFields(allowedJoinFields, specificFields[joinAlias])
        : allowedJoinFields;

    // Always ensure primary key is included
    if (primaryKey && !joinFieldsToSelect.includes(primaryKey)) {
      joinFieldsToSelect.push(primaryKey);
    }

    // Add the allowed joined entity fields to the select
    for (const field of joinFieldsToSelect) {
      queryBuilder.addSelect(`${joinAlias}.${field}`);
    }

    // Recursively handle nested joins if any
    // This is important for supporting deeper nestings like Article -> User -> Role
    const nestedJoins = queryBuilder.expressionMap.joinAttributes.filter(
      (nestedJoin: JoinInfo) => nestedJoin.parentAlias === joinAlias,
    );

    if (nestedJoins.length > 0) {
      await Promise.all(
        nestedJoins.map(async (nestedJoin: JoinInfo) => {
          await this.applyJoinEntityFieldPermissions(
            queryBuilder,
            nestedJoin,
            ability,
            action,
            userId,
            specificFields,
          );
        }),
      );
    }
  }

  /**
   * Get allowed fields for an entity based on permission rules
   */
  private getEntityAllowedFields(
    rules: any[],
    entityMetadata: EntityMetadata,
  ): string[] {
    // Extract all allowed fields from rules
    const fieldRules = rules.filter(
      (rule) => rule.fields && Array.isArray(rule.fields),
    );

    // If no field rules or contains wildcard, return all valid fields
    if (
      fieldRules.length === 0 ||
      fieldRules.some((rule) => rule.fields.includes('*'))
    ) {
      return entityMetadata.columns
        .map((column) => column.propertyName)
        .filter((name) => !!name);
    }

    // Collect all allowed fields
    const allowedFieldsSet = new Set<string>();

    for (const rule of fieldRules) {
      // Add each field to our allowed set
      for (const field of rule.fields) {
        const sanitizedField = this.sanitizeFieldName(field);
        if (sanitizedField) {
          allowedFieldsSet.add(sanitizedField);
        }
      }
    }

    // Make sure we include primary key
    if (entityMetadata.primaryColumns.length > 0) {
      const primaryKey = entityMetadata.primaryColumns[0].propertyName;
      allowedFieldsSet.add(primaryKey);
    }

    // Validate fields against entity schema
    return Array.from(allowedFieldsSet).filter((field) =>
      this.isValidEntityField(field, entityMetadata),
    );
  }

  /**
   * Validate if a field exists on the entity to prevent errors
   */
  private isValidEntityField(
    fieldName: string,
    entityMetadata: EntityMetadata,
  ): boolean {
    // Check if it's a direct property of the entity
    const hasProperty = entityMetadata.columns.some(
      (column) => column.propertyName === fieldName,
    );

    if (hasProperty) {
      return true;
    }

    // Check if it's a relation
    return entityMetadata.relations.some(
      (relation) => relation.propertyName === fieldName,
    );
  }

  /**
   * Sanitize field name to prevent SQL injection
   */
  private sanitizeFieldName(field: string): string {
    // Only allow alphanumeric characters and underscores
    // This is a strict whitelist approach
    if (!/^[a-zA-Z0-9_]+$/.test(field)) {
      this.logger.warn(`Invalid field name detected and sanitized: ${field}`);
      return '';
    }
    return field;
  }

  /**
   * Create a permission-filtered repository
   * Updated to support field selection options
   */
  async createPermissionFilteredRepository<T>(
    repository: Repository<T>,
    userId: string,
    action: string,
    specificFields?: Record<string, string[]>,
  ): Promise<Repository<T>> {
    // Create a proxy around the repository to intercept calls
    return new Proxy(repository, {
      get: (target, prop, receiver) => {
        // Intercept methods that need permission filtering
        if (prop === 'find' || prop === 'findOne' || prop === 'findAndCount') {
          return async (...args: any[]) => {
            const queryBuilder = repository.createQueryBuilder();
            await this.applyPermissionFilters(
              queryBuilder,
              userId,
              action,
              specificFields,
            );

            // Add any other conditions from the original call
            if (args[0]?.where) {
              const whereConditions = args[0].where;
              Object.entries(whereConditions).forEach(([key, value]) => {
                queryBuilder.andWhere(
                  `${queryBuilder.alias}.${this.sanitizeFieldName(key)} = :${key}`,
                  { [key]: value },
                );
              });
            }

            // Apply pagination if provided
            if (args[0]?.skip) queryBuilder.skip(args[0].skip);
            if (args[0]?.take) queryBuilder.take(args[0].take);

            // Apply ordering if provided
            if (args[0]?.order) {
              Object.entries(args[0].order).forEach(([key, value]) => {
                if (this.sanitizeFieldName(key)) {
                  queryBuilder.orderBy(
                    `${queryBuilder.alias}.${key}`,
                    value as 'ASC' | 'DESC',
                  );
                }
              });
            }

            // Call the appropriate method on the query builder
            if (prop === 'find') return queryBuilder.getMany();
            if (prop === 'findOne') return queryBuilder.getOne();
            if (prop === 'findAndCount') return queryBuilder.getManyAndCount();
          };
        }

        // For createQueryBuilder, return a function that applies permissions
        if (prop === 'createQueryBuilder') {
          return (...args: any[]) => {
            const qb = target[prop](...args);
            return qb;
          };
        }

        // For all other methods, use the original
        return Reflect.get(target, prop, receiver);
      },
    });
  }

  /**
   * Process CASL conditions into TypeORM conditions
   * This is a simplified version that handles common cases
   */
  private processConditions(conditions: any, alias: string): string {
    const clauses: string[] = [];

    for (const [key, value] of Object.entries(conditions)) {
      const sanitizedKey = this.sanitizeFieldName(key);
      if (!sanitizedKey) continue;

      if (value === null) {
        clauses.push(`${alias}.${sanitizedKey} IS NULL`);
      } else if (typeof value === 'object') {
        // Handle operators like $eq, $ne, $in, etc.
        for (const [op, opValue] of Object.entries(value)) {
          switch (op) {
            case '$eq':
              clauses.push(
                `${alias}.${sanitizedKey} = ${this.formatValue(opValue)}`,
              );
              break;
            case '$ne':
              clauses.push(
                `${alias}.${sanitizedKey} != ${this.formatValue(opValue)}`,
              );
              break;
            case '$gt':
              clauses.push(
                `${alias}.${sanitizedKey} > ${this.formatValue(opValue)}`,
              );
              break;
            case '$gte':
              clauses.push(
                `${alias}.${sanitizedKey} >= ${this.formatValue(opValue)}`,
              );
              break;
            case '$lt':
              clauses.push(
                `${alias}.${sanitizedKey} < ${this.formatValue(opValue)}`,
              );
              break;
            case '$lte':
              clauses.push(
                `${alias}.${sanitizedKey} <= ${this.formatValue(opValue)}`,
              );
              break;
            case '$in':
              if (Array.isArray(opValue) && opValue.length > 0) {
                const values = opValue
                  .map((v) => this.formatValue(v))
                  .join(', ');
                clauses.push(`${alias}.${sanitizedKey} IN (${values})`);
              }
              break;
          }
        }
      } else {
        // Simple equality
        clauses.push(`${alias}.${sanitizedKey} = ${this.formatValue(value)}`);
      }
    }

    return clauses.join(' AND ');
  }

  /**
   * Format a value for SQL with security precautions
   */
  private formatValue(value: any): string {
    if (value === null) return 'NULL';
    if (typeof value === 'string') {
      // Escape single quotes to prevent SQL injection
      return `'${value.replace(/'/g, "''")}'`;
    }
    if (typeof value === 'boolean') return value ? 'TRUE' : 'FALSE';
    if (value instanceof Date) return `'${value.toISOString()}'`;
    // For numbers, ensure it's really a number
    if (typeof value === 'number' && !isNaN(value)) return String(value);
    // For anything else, convert to string but limit length
    const stringValue = String(value).substring(0, 1000);
    return `'${stringValue.replace(/'/g, "''")}'`;
  }
}
