export interface PaginatedResponse<T> {
  items: T[];
  total: number;
  currentPage: number;
  totalPages: number;
  pageSize: number;
}

/**
 * Utility function to create a paginated response.
 *
 * @param items - The array of items to include in the response.
 * @param total - The total number of items available.
 * @param currentPage - The current page number.
 * @returns A structured paginated response.
 */
export function paginateResponse<T>(
  items: T[],
  total: number,
  currentPage: number,
  limit: number,
): PaginatedResponse<T> {
  const pageSize = items.length; // The number of items returned in the current page
  const totalPages = Math.ceil(total / limit);

  return {
    items,
    total,
    currentPage,
    totalPages,
    pageSize,
  };
}
