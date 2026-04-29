import { useState, useEffect, useCallback, useRef } from "react";
import { apiGet } from "@/lib/api";
import type { Product, PaginatedResponse, ProductFilters } from "@/types";

interface UseProductsReturn {
  products: Product[];
  isLoading: boolean;
  isLoadingMore: boolean;
  hasMore: boolean;
  total: number;
  currentPage: number;
  loadMore: () => void;
  refresh: () => void;
}

export function useProducts(filters: ProductFilters): UseProductsReturn {
  const [products, setProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [lastPage, setLastPage] = useState(1);
  const [total, setTotal] = useState(0);
  const abortRef = useRef<AbortController | null>(null);

  const fetchPage = useCallback(
    async (page: number, append: boolean) => {
      // Cancel previous request
      abortRef.current?.abort();
      abortRef.current = new AbortController();

      if (append) {
        setIsLoadingMore(true);
      } else {
        setIsLoading(true);
        setProducts([]);
      }

      try {
        const params: Record<string, string | number | boolean> = { page, per_page: filters.per_page ?? 12 };
        if (filters.search) params.search = filters.search;
        if (filters.category) params.category = filters.category;
        if (filters.min_price != null) params.min_price = filters.min_price;
        if (filters.max_price != null) params.max_price = filters.max_price;
        if (filters.size) params.size = filters.size;
        if (filters.limited) params.limited = true;
        if (filters.featured) params.featured = true;
        if (filters.sort_by) params.sort_by = filters.sort_by;
        if (filters.sort_dir) params.sort_dir = filters.sort_dir;

        const res = await apiGet<PaginatedResponse<Product>>("/products", params);
        setProducts((prev) => (append ? [...prev, ...res.data] : res.data));
        setCurrentPage(res.current_page);
        setLastPage(res.last_page);
        setTotal(res.total);
      } catch (err: unknown) {
        if (err instanceof Error && err.name === "CanceledError") return;
      } finally {
        setIsLoading(false);
        setIsLoadingMore(false);
      }
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [
      filters.search,
      filters.category,
      filters.min_price,
      filters.max_price,
      filters.size,
      filters.limited,
      filters.featured,
      filters.sort_by,
      filters.sort_dir,
      filters.per_page,
    ]
  );

  // Re-fetch from page 1 whenever filters change
  useEffect(() => {
    fetchPage(1, false);
  }, [fetchPage]);

  const loadMore = useCallback(() => {
    if (!isLoadingMore && currentPage < lastPage) {
      fetchPage(currentPage + 1, true);
    }
  }, [isLoadingMore, currentPage, lastPage, fetchPage]);

  const refresh = useCallback(() => fetchPage(1, false), [fetchPage]);

  return {
    products,
    isLoading,
    isLoadingMore,
    hasMore: currentPage < lastPage,
    total,
    currentPage,
    loadMore,
    refresh,
  };
}
