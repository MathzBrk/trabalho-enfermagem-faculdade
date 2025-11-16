import type { PaginationParams } from '@shared/interfaces/pagination';

export const buildPaginationArgs = (
  params: PaginationParams,
  allowedSortFields?: string[],
) => {
  const { page, perPage, sortBy = 'createdAt', sortOrder = 'desc' } = params;

  const skip = (page - 1) * perPage;
  const take = perPage;

  const safeSortBy = allowedSortFields?.includes(sortBy) ? sortBy : 'createdAt';

  const orderBy = { [safeSortBy]: sortOrder };

  return {
    skip,
    take,
    orderBy,
  };
};
