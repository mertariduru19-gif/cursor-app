const DEFAULT_PAGE = 1;
const DEFAULT_PAGE_SIZE = 10;
const MAX_PAGE_SIZE = 50;

const toNumber = (value: string | undefined, fallback: number) => {
  if (!value) return fallback;
  const parsed = Number(value);
  return Number.isNaN(parsed) ? fallback : parsed;
};

export const getPagination = (pageRaw?: string, pageSizeRaw?: string) => {
  const page = Math.max(toNumber(pageRaw, DEFAULT_PAGE), 1);
  const pageSize = Math.min(
    Math.max(toNumber(pageSizeRaw, DEFAULT_PAGE_SIZE), 1),
    MAX_PAGE_SIZE
  );
  const skip = (page - 1) * pageSize;

  return {
    page,
    pageSize,
    skip,
    take: pageSize,
  };
};
