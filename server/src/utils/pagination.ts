export type PaginationParams = {
  page: number;
  limit: number;
  skip: number;
};

export function parsePagination(
  query: Record<string, unknown>,
  defaultLimit = 10,
  maxLimit = 50,
): PaginationParams {
  const page = Math.max(1, parseInt(String(query.page ?? 1), 10));
  const limit = Math.min(
    maxLimit,
    Math.max(1, parseInt(String(query.limit ?? defaultLimit), 10)),
  );
  const skip = (page - 1) * limit;
  return { page, limit, skip };
}
