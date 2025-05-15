import { Injectable } from '@nestjs/common';
import { Repository, SelectQueryBuilder } from 'typeorm';
import { CaslService } from '../casl.service';

@Injectable()
export class PermissionQueryBuilder {
  constructor(private caslService: CaslService) {}

  /**
   * Apply permission filters to a query builder
   * This is a simplified approach that works with TypeORM
   */
  async applyPermissionFilters<T>(
    queryBuilder: SelectQueryBuilder<T>,
    userId: string,
    action: string,
  ): Promise<SelectQueryBuilder<T>> {
    const ability = await this.caslService.getUserAbility(userId);
    const entityName = queryBuilder.expressionMap.mainAlias?.metadata?.name;
    const alias = queryBuilder.expressionMap.mainAlias?.name;

    if (!entityName || !alias) {
      throw new Error('Query builder must have a main alias');
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

    // Process each rule's conditions
    const conditions = allowRules
      .filter((rule) => rule.conditions)
      .map((rule) => this.processConditions(rule.conditions, alias));

    if (conditions.length > 0) {
      // Combine all conditions with OR (any matching condition grants access)
      const whereCondition = conditions.map((cond) => `(${cond})`).join(' OR ');
      queryBuilder.andWhere(whereCondition);
    }

    return queryBuilder;
  }

  /**
   * Create a permission-filtered repository
   */
  async createPermissionFilteredRepository<T>(
    repository: Repository<T>,
    userId: string,
    action: string,
  ): Promise<Repository<T>> {
    // Create a proxy around the repository to intercept calls
    return new Proxy(repository, {
      get: (target, prop, receiver) => {
        // Intercept methods that need permission filtering
        if (prop === 'find' || prop === 'findOne' || prop === 'findAndCount') {
          return async (...args: any[]) => {
            const queryBuilder = repository.createQueryBuilder();
            await this.applyPermissionFilters(queryBuilder, userId, action);

            // Add any other conditions from the original call
            if (args[0]?.where) {
              const whereConditions = args[0].where;
              Object.entries(whereConditions).forEach(([key, value]) => {
                queryBuilder.andWhere(
                  `${queryBuilder.alias}.${key} = :${key}`,
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
                queryBuilder.orderBy(
                  `${queryBuilder.alias}.${key}`,
                  value as 'ASC' | 'DESC',
                );
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
            return this.applyPermissionFilters(qb, userId, action);
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
      if (value === null) {
        clauses.push(`${alias}.${key} IS NULL`);
      } else if (typeof value === 'object') {
        // Handle operators like $eq, $ne, $in, etc.
        for (const [op, opValue] of Object.entries(value)) {
          switch (op) {
            case '$eq':
              clauses.push(`${alias}.${key} = ${this.formatValue(opValue)}`);
              break;
            case '$ne':
              clauses.push(`${alias}.${key} != ${this.formatValue(opValue)}`);
              break;
            case '$gt':
              clauses.push(`${alias}.${key} > ${this.formatValue(opValue)}`);
              break;
            case '$gte':
              clauses.push(`${alias}.${key} >= ${this.formatValue(opValue)}`);
              break;
            case '$lt':
              clauses.push(`${alias}.${key} < ${this.formatValue(opValue)}`);
              break;
            case '$lte':
              clauses.push(`${alias}.${key} <= ${this.formatValue(opValue)}`);
              break;
            case '$in':
              if (Array.isArray(opValue) && opValue.length > 0) {
                const values = opValue
                  .map((v) => this.formatValue(v))
                  .join(', ');
                clauses.push(`${alias}.${key} IN (${values})`);
              }
              break;
          }
        }
      } else {
        // Simple equality
        clauses.push(`${alias}.${key} = ${this.formatValue(value)}`);
      }
    }

    return clauses.join(' AND ');
  }

  /**
   * Format a value for SQL
   */
  private formatValue(value: any): string {
    if (value === null) return 'NULL';
    if (typeof value === 'string') return `'${value.replace(/'/g, "''")}'`;
    if (typeof value === 'boolean') return value ? 'TRUE' : 'FALSE';
    if (value instanceof Date) return `'${value.toISOString()}'`;
    return String(value);
  }
}
