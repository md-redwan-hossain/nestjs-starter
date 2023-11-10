export function calculatePagination(page: number, limit: number) {
  return (page - 1) * limit;
}
