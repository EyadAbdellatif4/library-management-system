import { Op } from 'sequelize';
import { WhereOptions } from 'sequelize';

/**
 * Filter configuration for a field
 */
export interface FilterFieldConfig {
  type: 'text' | 'date' | 'dateRange' | 'enum' | 'boolean' | 'exact';
  field: string;
  operator?: 'ILIKE' | 'LIKE' | '=' | '!=' | '>' | '<' | '>=' | '<=' | 'BETWEEN' | 'IN';
}

/**
 * Build Sequelize where clause from filter object
 * @param filters - Filter object with field values
 * @param config - Configuration mapping field names to filter types
 * @returns Sequelize where clause
 */
export function buildWhereClause(
  filters: Record<string, any>,
  config: Record<string, FilterFieldConfig>
): WhereOptions {
  const where: WhereOptions = {};

  for (const [key, value] of Object.entries(filters)) {
    if (value === undefined || value === null || value === '') {
      continue;
    }

    const fieldConfig = config[key];
    if (!fieldConfig) {
      continue;
    }

    const { type, field, operator } = fieldConfig;

    switch (type) {
      case 'text':
        // Case-insensitive partial match using ILIKE
        where[field] = {
          [Op.iLike]: `%${value}%`,
        };
        break;

      case 'exact':
        // Exact match
        where[field] = value;
        break;

      case 'boolean':
        // Boolean exact match
        where[field] = value === 'true' || value === true;
        break;

      case 'enum':
        // Exact match for enum values
        where[field] = value;
        break;

      case 'date':
        // Date exact match
        where[field] = {
          [Op.gte]: new Date(value),
          [Op.lt]: new Date(new Date(value).getTime() + 86400000),
        };
        break;

      case 'dateRange': {
        // Handle date range filter (expects string with format "startDate,endDate" or "startDate" for >= filter)
        const dates = Array.isArray(value) ? value : [value];
        if (dates.length === 2) {
          where[field] = {
            [Op.between]: [new Date(dates[0]), new Date(dates[1])],
          };
        } else if (dates.length === 1) {
          where[field] = {
            [Op.gte]: new Date(dates[0]),
          };
        }
        break;
      }

      default:
        break;
    }
  }

  return where;
}

/**
 * Build order clause for Sequelize query
 * @param sortBy - Field name to sort by
 * @param sortOrder - Sort order (ASC or DESC)
 * @returns Sequelize order array
 */
export function buildOrderClause(
  sortBy?: string,
  sortOrder: 'ASC' | 'DESC' = 'DESC'
): Array<[string, string]> {
  if (!sortBy) {
    return [['updatedAt', sortOrder]];
  }
  return [[sortBy, sortOrder]];
}
