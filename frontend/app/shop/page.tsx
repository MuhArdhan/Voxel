"use client";

import { useState, useEffect, Suspense } from "react";
import { useSearchParams, useRouter, usePathname } from "next/navigation";
import { motion } from "framer-motion";
import { Search, SlidersHorizontal, ChevronRight } from "lucide-react";
import Link from "next/link";
import { useProducts } from "@/hooks/useProducts";
import { useCategories } from "@/hooks/useCategories";
import { useDebounce } from "@/hooks/useDebounce";
import { FilterSidebar } from "@/components/shop/FilterSidebar";
import ProductCard from "@/components/ProductCard";
import { ProductCardSkeleton } from "@/components/ui/skeleton";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import type { ProductFilters } from "@/types";

function ShopContent() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  // Parse initial filters from URL
  const initialFilters: ProductFilters = {
    search: searchParams.get("search") || undefined,
    category: searchParams.get("category") || undefined,
    size: searchParams.get("size") || undefined,
    min_price: searchParams.has("min_price") ? Number(searchParams.get("min_price")) : undefined,
    max_price: searchParams.has("max_price") ? Number(searchParams.get("max_price")) : undefined,
    sort_by: (searchParams.get("sort_by") as ProductFilters["sort_by"]) || "created_at",
    sort_dir: (searchParams.get("sort_dir") as ProductFilters["sort_dir"]) || "desc",
    limited: searchParams.get("limited") === "true",
    featured: searchParams.get("featured") === "true",
  };

  const [filters, setFilters] = useState<ProductFilters>(initialFilters);
  const [searchInput, setSearchInput] = useState(initialFilters.search || "");
  const debouncedSearch = useDebounce(searchInput, 500);
  const [isMobileFilterOpen, setIsMobileFilterOpen] = useState(false);

  const { products, isLoading, isLoadingMore, hasMore, total, loadMore } = useProducts(filters);
  const { categories } = useCategories();

  // Update URL when filters change
  useEffect(() => {
    const params = new URLSearchParams();
    if (filters.search) params.set("search", filters.search);
    if (filters.category) params.set("category", filters.category);
    if (filters.size) params.set("size", filters.size);
    if (filters.min_price != null) params.set("min_price", filters.min_price.toString());
    if (filters.max_price != null) params.set("max_price", filters.max_price.toString());
    if (filters.sort_by && filters.sort_by !== "created_at") params.set("sort_by", filters.sort_by);
    if (filters.sort_dir && filters.sort_dir !== "desc") params.set("sort_dir", filters.sort_dir);
    if (filters.limited) params.set("limited", "true");
    if (filters.featured) params.set("featured", "true");

    const newUrl = params.toString() ? `${pathname}?${params.toString()}` : pathname;
    router.replace(newUrl, { scroll: false });
  }, [filters, pathname, router]);

  // Sync debounced search to filters
  useEffect(() => {
    setFilters((prev) => ({ ...prev, search: debouncedSearch || undefined }));
  }, [debouncedSearch]);

  const handleFilterChange = (key: keyof ProductFilters, value: any) => {
    setFilters((prev) => ({ ...prev, [key]: value }));
  };

  const handleResetFilters = () => {
    setFilters({
      sort_by: "created_at",
      sort_dir: "desc",
    });
    setSearchInput("");
  };

  // Count active filters (excluding default sorts and search)
  const activeFilterCount = Object.entries(filters).filter(([key, val]) => {
    if (key === "sort_by" || key === "sort_dir" || key === "search") return false;
    return val !== undefined && val !== false;
  }).length;

  return (
    <div className="min-h-screen pt-24 pb-16 px-6 md:px-10 max-w-[1400px] mx-auto">
      {/* Breadcrumbs */}
      <nav className="flex items-center gap-2 mb-8 text-[10px] font-semibold tracking-[0.15em] uppercase text-[#8A8680]">
        <Link href="/" className="hover:text-[#0A0A0A] transition-colors">Home</Link>
        <ChevronRight size={12} />
        <span className="text-[#0A0A0A]">Shop</span>
      </nav>

      {/* Header & Mobile Actions */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-10">
        <div>
          <h1 className="text-4xl md:text-5xl font-black text-[#0A0A0A] tracking-tight leading-[0.9] mb-3">
            SHOP
          </h1>
          <p className="text-sm text-[#4A4845]">
            Menampilkan <span className="font-bold text-[#0A0A0A]">{total}</span> produk
          </p>
        </div>

        <div className="flex items-center gap-3 w-full md:w-auto">
          {/* Search */}
          <div className="relative flex-1 md:w-64">
            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#8A8680]" />
            <Input
              type="text"
              placeholder="Cari produk..."
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              className="pl-9 h-11 bg-white border-[#C8C4BC] focus-visible:border-[#0A0A0A] rounded-full text-xs w-full"
            />
          </div>
          {/* Mobile Filter Toggle */}
          <Button
            variant="outline"
            size="icon"
            className="md:hidden h-11 w-11 rounded-full shrink-0 border-[#C8C4BC]"
            onClick={() => setIsMobileFilterOpen(!isMobileFilterOpen)}
          >
            <SlidersHorizontal size={16} />
          </Button>
        </div>
      </div>

      <div className="flex flex-col md:flex-row gap-10">
        {/* Sidebar (Desktop) */}
        <div className="hidden md:block w-64 shrink-0">
          <div className="sticky top-24">
            <FilterSidebar
              filters={filters}
              categories={categories}
              onFilterChange={handleFilterChange}
              onReset={handleResetFilters}
              activeFilterCount={activeFilterCount}
            />
          </div>
        </div>

        {/* Mobile Filter Drawer (Simple inline expansion for now) */}
        {isMobileFilterOpen && (
          <div className="md:hidden bg-white p-5 rounded-2xl border border-[#C8C4BC] mb-6">
            <FilterSidebar
              filters={filters}
              categories={categories}
              onFilterChange={handleFilterChange}
              onReset={handleResetFilters}
              activeFilterCount={activeFilterCount}
            />
          </div>
        )}

        {/* Product Grid */}
        <div className="flex-1">
          {isLoading ? (
            <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 md:gap-6">
              {[...Array(8)].map((_, i) => (
                <ProductCardSkeleton key={i} />
              ))}
            </div>
          ) : products.length > 0 ? (
            <>
              <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 md:gap-6">
                {products.map((product, i) => (
                  <ProductCard key={product.id} product={product} index={i} />
                ))}
              </div>

              {/* Load More */}
              {hasMore && (
                <div className="mt-12 text-center">
                  <Button
                    variant="outline"
                    onClick={loadMore}
                    disabled={isLoadingMore}
                    className="rounded-full bg-transparent border-[#0A0A0A] text-[#0A0A0A] hover:bg-[#0A0A0A] hover:text-[#F2F0EB]"
                  >
                    {isLoadingMore ? "Memuat..." : "Load More"}
                  </Button>
                </div>
              )}
            </>
          ) : (
            /* Empty State */
            <div className="flex flex-col items-center justify-center py-24 text-center">
              <div className="w-16 h-16 bg-[#E8E5DF] rounded-full flex items-center justify-center mb-4">
                <Search size={24} className="text-[#8A8680]" />
              </div>
              <h3 className="text-xl font-bold text-[#0A0A0A] mb-2">Produk tidak ditemukan</h3>
              <p className="text-[#4A4845] text-sm max-w-md mx-auto mb-6">
                Kami tidak dapat menemukan produk yang sesuai dengan filter pencarian Anda. Coba kurangi filter atau cari dengan kata kunci lain.
              </p>
              <Button onClick={handleResetFilters} className="rounded-full">
                Reset Pencarian
              </Button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default function ShopPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen pt-24 px-6 md:px-10 max-w-[1400px] mx-auto">
        <div className="h-10 w-48 bg-[#E8E5DF] animate-pulse rounded mb-10" />
        <div className="flex gap-10">
          <div className="hidden md:block w-64 shrink-0 h-[600px] bg-[#E8E5DF] animate-pulse rounded-xl" />
          <div className="flex-1 grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 md:gap-6">
            {[...Array(8)].map((_, i) => (
              <ProductCardSkeleton key={i} />
            ))}
          </div>
        </div>
      </div>
    }>
      <ShopContent />
    </Suspense>
  );
}
