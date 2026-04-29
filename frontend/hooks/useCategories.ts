import { useState, useEffect } from "react";
import { apiGet } from "@/lib/api";
import type { Category } from "@/types";

interface UseCategoriesReturn {
  categories: Category[];
  isLoading: boolean;
}

export function useCategories(): UseCategoriesReturn {
  const [categories, setCategories] = useState<Category[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    apiGet<Category[]>("/categories")
      .then((res) => setCategories(res || []))
      .catch(() => setCategories([]))
      .finally(() => setIsLoading(false));
  }, []);

  return { categories, isLoading };
}
