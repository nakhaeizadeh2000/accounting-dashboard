import { Injectable, Logger, BadRequestException } from '@nestjs/common';
import { Repository, SelectQueryBuilder, EntityMetadata } from 'typeorm';
import { CaslService } from '../casl.service';

// Define our own interface to match TypeORM's join attributes structure
interface JoinInfo {
  alias: {
    name: string;
  };
  metadata?: EntityMetadata;
  parentAlias?: string;
}

// EntityFieldSelector provides the fluent API for field selection
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
   */
  selectFields<E>(alias: string, fields: string[]): EntityFieldSelector<T> {
    this.fieldMap[alias] = fields;
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

@Injectable()
export class PermissionQueryBuilder {
  private readonly logger = new Logger(PermissionQueryBuilder.name);

  constructor(private caslService: CaslService) {}

  /**
   * Create a field selector builder to use the fluent API
   * This is the entry point for the fluent interface in article.service.ts
   */
  withPermissions<T>(
    queryBuilder: SelectQueryBuilder<T>,
    userId: string,
    action: string,
  ): EntityFieldSelector<T> {
    this.logger.debug(
      `[CASL] withPermissions called for user ${userId}, action ${action}`,
    );
    return new EntityFieldSelector(queryBuilder, this, userId, action);
  }

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
      this.logger.debug(
        `[CASL] Starting permission filtering for user ${userId}, action: ${action}`,
      );

      const ability = await this.caslService.getUserAbility(userId);
      this.logger.debug(`[CASL] Retrieved ability for user ${userId}`);

      const mainAlias = queryBuilder.expressionMap.mainAlias;

      if (!mainAlias) {
        this.logger.error(`[CASL] Query builder missing main alias`);
        throw new BadRequestException('Query builder must have a main alias');
      }

      const entityName = mainAlias.metadata?.name;
      const alias = mainAlias.name;

      if (!entityName || !alias) {
        this.logger.error(
          `[CASL] Invalid query builder configuration - missing entity name or alias`,
        );
        throw new BadRequestException('Invalid query builder configuration');
      }

      this.logger.debug(
        `[CASL] Checking permissions for entity: ${entityName}, alias: ${alias}`,
      );

      // Get all rules that apply to this entity and action
      // Check if rulesFor method exists
      let rules = [];

      if (typeof ability.rulesFor === 'function') {
        rules = ability.rulesFor(action, entityName);
        this.logger.debug(
          `[CASL] Found ${rules.length} rules using rulesFor method`,
        );
      } else {
        // Fallback: manually filter rules
        rules = ability.rules.filter(
          (rule) =>
            (rule.action === action || rule.action === 'manage') &&
            (rule.subject === entityName || rule.subject === 'all'),
        );
        this.logger.debug(
          `[CASL] Found ${rules.length} rules using manual filtering`,
        );
      }

      this.logger.debug(`[CASL] Rules: ${JSON.stringify(rules, null, 2)}`);

      // If no rules allow this action, return empty result
      if (rules.length === 0 || rules.every((rule) => rule.inverted)) {
        this.logger.warn(
          `[CASL] User ${userId} has no permission for ${action} on ${entityName}`,
        );
        // Force empty result by adding impossible condition
        return queryBuilder.andWhere('1 = 0');
      }

      // Get only the "allow" rules (not inverted)
      const allowRules = rules.filter((rule) => !rule.inverted);
      this.logger.debug(`[CASL] Found ${allowRules.length} allow rules`);

      if (allowRules.length === 0) {
        this.logger.warn(
          `[CASL] User ${userId} has no allow rules for ${action} on ${entityName}`,
        );
        // If no allow rules, return empty result
        return queryBuilder.andWhere('1 = 0');
      }

      // Apply field-level permissions to main entity and joined entities
      this.logger.debug(`[CASL] Applying field permissions with joins`);
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
        .map((rule) => {
          this.logger.debug(
            `[CASL] Processing conditions: ${JSON.stringify(rule.conditions)}`,
          );
          return this.processConditions(rule.conditions, alias);
        });

      if (conditions.length > 0) {
        // Combine all conditions with OR (any matching condition grants access)
        const whereCondition = conditions
          .map((cond) => `(${cond})`)
          .join(' OR ');
        this.logger.debug(`[CASL] Applying WHERE condition: ${whereCondition}`);
        queryBuilder.andWhere(whereCondition);
      } else {
        this.logger.debug(
          `[CASL] No conditions to apply - user has full access to this entity`,
        );
      }

      this.logger.debug(`[CASL] Final query SQL: ${queryBuilder.getSql()}`);
      return queryBuilder;
    } catch (error) {
      this.logger.error(
        `[CASL] Error applying permission filters: ${error.message}`,
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
      const entityName = entityMetadata.name;

      // Use the new method for getting allowed fields
      const allowedMainEntityFields = this.getFieldsFromAbility(
        ability,
        entityName,
        action,
        entityMetadata,
      );

      this.logger.debug(
        `[CASL] Allowed fields: ${allowedMainEntityFields.join(', ')}`,
      );

      // Start with a clean slate - clear all selections
      queryBuilder.select([]);
      this.logger.debug(`[CASL] Cleared all field selections`);

      // If specific fields requested for main entity, narrow down allowed fields
      const mainEntityFieldsToSelect =
        specificFields && specificFields[alias]
          ? this.narrowFields(allowedMainEntityFields, specificFields[alias])
          : allowedMainEntityFields;

      this.logger.debug(
        `[CASL] Fields to select for ${alias}: ${mainEntityFieldsToSelect.join(', ')}`,
      );

      // Add the main entity fields
      if (mainEntityFieldsToSelect.length > 0) {
        for (const field of mainEntityFieldsToSelect) {
          queryBuilder.addSelect(`${alias}.${field}`);
          this.logger.debug(`[CASL] Added select: ${alias}.${field}`);
        }
      } else {
        this.logger.warn(
          `[CASL] No fields to select for ${alias} - this may cause empty results`,
        );
      }

      // Handle all joined entities
      const joinCount = queryBuilder.expressionMap.joinAttributes.length;
      this.logger.debug(`[CASL] Processing ${joinCount} joins`);

      if (joinCount > 0) {
        await Promise.all(
          queryBuilder.expressionMap.joinAttributes.map(async (join) => {
            this.logger.debug(
              `[CASL] Processing join for alias: ${join.alias.name}`,
            );
            await this.applyJoinEntityFieldPermissions(
              queryBuilder,
              join,
              ability,
              action,
              userId,
              specificFields,
            );
          }),
        );
      }
    } catch (error) {
      this.logger.error(
        `[CASL] Error applying field permissions: ${error.message}`,
        error.stack,
      );
      // On error, default to minimal field selection for security
      queryBuilder.select([]);
      this.logger.debug(`[CASL] Cleared selections due to error`);

      // Only select primary key of main entity
      const primaryColumn = entityMetadata.primaryColumns[0]?.propertyName;
      if (primaryColumn) {
        queryBuilder.addSelect(`${alias}.${primaryColumn}`);
        this.logger.debug(
          `[CASL] Added only primary key: ${alias}.${primaryColumn}`,
        );
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

    // Get allowed fields with enhanced method
    const allowedJoinFields = this.getEntityAllowedFields(
      joinAllowRules,
      joinMetadata,
      ability,
      joinEntityName,
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
   * Get allowed fields for an entity based on permission rules with proper rule merging
   * Enhanced to handle mixed permissions (specific field rules + general permissions)
   */
  private getEntityAllowedFields(
    rules: any[],
    entityMetadata: EntityMetadata,
    ability?: any,
    entityName?: string,
  ): string[] {
    this.logger.debug(
      `[CASL] Computing allowed fields for ${entityName || entityMetadata.name}`,
    );

    // Get all possible fields from entity metadata
    const allEntityFields = entityMetadata.columns
      .map((column) => column.propertyName)
      .filter((name) => !!name);

    // Always ensure primary key is included
    const primaryKey = entityMetadata.primaryColumns[0]?.propertyName;
    if (primaryKey && !allEntityFields.includes(primaryKey)) {
      allEntityFields.push(primaryKey);
    }

    // If no specific rules or if any rule allows all fields, return all fields
    const hasWildcardRule = rules.some(
      (rule) =>
        !rule.fields ||
        (Array.isArray(rule.fields) && rule.fields.includes('*')),
    );

    // If there's a "manage all" type rule, we should check per-field permissions
    const hasManageAll =
      ability &&
      rules.some(
        (rule) =>
          rule.action === 'manage' &&
          (rule.subject === 'all' || rule.subject === entityName),
      );

    // If we have wildcard permission and no ability to check, return all fields
    if (hasWildcardRule && !hasManageAll) {
      this.logger.debug(`[CASL] Using wildcard rule, allowing all fields`);
      return allEntityFields;
    }

    // Initialize allowed fields set
    const allowedFieldsSet = new Set<string>();

    // First, add fields from explicit field rules
    const fieldRules = rules.filter(
      (rule) => rule.fields && Array.isArray(rule.fields) && !rule.inverted,
    );

    for (const rule of fieldRules) {
      for (const field of rule.fields) {
        if (field === '*') {
          // Wildcard - add all fields
          allEntityFields.forEach((f) => allowedFieldsSet.add(f));
        } else {
          const sanitizedField = this.sanitizeFieldName(field);
          if (sanitizedField) {
            allowedFieldsSet.add(sanitizedField);
          }
        }
      }
    }

    // If we have the ability object, perform per-field permission check for completeness
    if (ability && entityName) {
      this.logger.debug(
        `[CASL] Performing per-field permission checks for ${entityName}`,
      );

      for (const field of allEntityFields) {
        // Check if this specific field is permitted by any rule
        if (ability.can('read', entityName, field)) {
          allowedFieldsSet.add(field);
          this.logger.debug(
            `[CASL] Field ${field} is permitted by ability check`,
          );
        }
      }
    }

    // Always ensure primary key is included for proper record retrieval
    if (primaryKey) {
      allowedFieldsSet.add(primaryKey);
    }

    // Convert set to array and filter for valid fields
    const allowedFields = Array.from(allowedFieldsSet).filter((field) =>
      this.isValidEntityField(field, entityMetadata),
    );

    this.logger.debug(
      `[CASL] Final allowed fields for ${entityName || entityMetadata.name}: ${allowedFields.join(', ')}`,
    );

    return allowedFields;
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
            // Return our own function to apply permissions later
            return this.withPermissions(qb, userId, action);
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

  /**
   * Advanced method to determine allowed fields by directly analyzing the CASL ability object
   */
  private getFieldsFromAbility(
    ability: any,
    entityName: string,
    action: string,
    entityMetadata: EntityMetadata,
  ): string[] {
    this.logger.debug(
      `[CASL] Analyzing ability object for ${entityName} fields`,
    );

    // Get all possible fields from the entity
    const allEntityFields = entityMetadata.columns
      .map((column) => column.propertyName)
      .filter((name) => !!name);

    // Primary key should always be included
    const primaryKey = entityMetadata.primaryColumns[0]?.propertyName;
    if (primaryKey && !allEntityFields.includes(primaryKey)) {
      allEntityFields.push(primaryKey);
    }

    // Set to collect all allowed fields
    const allowedFields = new Set<string>();

    // Extract relevant rules from the ability object
    const relevantRules = ability.M.filter(
      (rule) =>
        (rule.action === action || rule.action === 'manage') &&
        (rule.subject === entityName || rule.subject === 'all') &&
        !rule.inverted,
    );

    this.logger.debug(
      `[CASL] Found ${relevantRules.length} relevant rules for ${action} ${entityName}`,
    );

    // Enhanced wildcard detection - check for undefined, null or wildcard in fields
    const hasUnrestrictedAccess = relevantRules.some(
      (rule) =>
        !rule.fields || // No fields property = all fields
        (Array.isArray(rule.fields) && rule.fields.length === 0) || // Empty array = all fields
        (Array.isArray(rule.fields) && rule.fields.includes('*')), // Wildcard = all fields
    );

    if (hasUnrestrictedAccess) {
      this.logger.debug(
        `[CASL] Unrestricted access found, allowing all fields`,
      );
      // Add all entity fields since we have unrestricted access
      allEntityFields.forEach((field) => allowedFields.add(field));
    } else {
      // No wildcard, so we need to check each rule for specific fields
      for (const rule of relevantRules) {
        if (rule.fields && Array.isArray(rule.fields)) {
          for (const field of rule.fields) {
            const sanitizedField = this.sanitizeFieldName(field);
            if (sanitizedField) {
              allowedFields.add(sanitizedField);
            }
          }
        }
      }
    }

    // As a final safeguard, explicitly check each field using ability.can
    for (const field of allEntityFields) {
      try {
        // If any check passes, add the field
        if (
          // First check without direct ability.can for performance
          hasUnrestrictedAccess ||
          // Then try explicit rule checks
          relevantRules.some(
            (rule) =>
              rule.fields &&
              Array.isArray(rule.fields) &&
              rule.fields.includes(field),
          ) ||
          // Finally fall back to the CASL API
          ability.can(action, entityName, field)
        ) {
          allowedFields.add(field);
          this.logger.debug(`[CASL] Field ${field} allowed for ${entityName}`);
        }
      } catch (error) {
        this.logger.warn(
          `[CASL] Error checking permission for field ${field}: ${error.message}`,
        );
      }
    }

    // Always ensure primary key is included
    if (primaryKey) {
      allowedFields.add(primaryKey);
    }

    // Convert to array and filter for valid fields
    const result = Array.from(allowedFields).filter((field) =>
      this.isValidEntityField(field, entityMetadata),
    );

    this.logger.debug(`[CASL] Final allowed fields: ${result.join(', ')}`);
    return result;
  }
}
