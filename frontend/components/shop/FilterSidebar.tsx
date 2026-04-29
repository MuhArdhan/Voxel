"use client";

import { X } from "lucide-react";
import { cn } from "@/lib/utils";
import type { Category, ProductFilters } from "@/types";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";

const SIZES = ["XS", "S", "M", "L", "XL", "XXL"];

const SORT_OPTIONS = [
  { value: "created_at:desc", label: "Terbaru" },
  { value: "price:asc", label: "Harga Terendah" },
  { value: "price:desc", label: "Harga Tertinggi" },
  { value: "name:asc", label: "A → Z" },
];

interface FilterSidebarProps {
  filters: ProductFilters;
  categories: Category[];
  onFilterChange: (key: keyof ProductFilters, value: ProductFilters[keyof ProductFilters]) => void;
  onReset: () => void;
  activeFilterCount: number;
}

export function FilterSidebar({
  filters,
  categories,
  onFilterChange,
  onReset,
  activeFilterCount,
}: FilterSidebarProps) {
  const sortValue = filters.sort_by && filters.sort_dir
    ? `${filters.sort_by}:${filters.sort_dir}`
    : "created_at:desc";

  const handleSort = (value: string) => {
    const [sort_by, sort_dir] = value.split(":") as [ProductFilters["sort_by"], ProductFilters["sort_dir"]];
    onFilterChange("sort_by", sort_by);
    onFilterChange("sort_dir", sort_dir);
  };

  const toggleSize = (size: string) => {
    onFilterChange("size", filters.size === size ? undefined : size);
  };

  return (
    <aside className="w-full space-y-7">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <p className="mono text-[9px] text-[#8A8680] tracking-[0.2em] uppercase">Filters</p>
          {activeFilterCount > 0 && (
            <p className="text-[10px] text-[#5C1A1A] font-semibold mt-0.5">
              {activeFilterCount} aktif
            </p>
          )}
        </div>
        {activeFilterCount > 0 && (
          <button
            onClick={onReset}
            className="flex items-center gap-1 text-[10px] text-[#8A8680] hover:text-[#0A0A0A] transition-colors"
          >
            <X size={10} />
            Reset
          </button>
        )}
      </div>

      <Separator className="bg-[#C8C4BC]" />

      {/* Sort */}
      <div className="space-y-3">
        <p className="mono text-[9px] font-semibold text-[#4A4845] tracking-[0.2em] uppercase">Urutkan</p>
        <div className="space-y-1.5">
          {SORT_OPTIONS.map((opt) => (
            <button
              key={opt.value}
              onClick={() => handleSort(opt.value)}
              className={cn(
                "w-full text-left text-xs py-1.5 transition-colors",
                sortValue === opt.value
                  ? "text-[#0A0A0A] font-bold"
                  : "text-[#8A8680] hover:text-[#4A4845]"
              )}
            >
              {sortValue === opt.value && (
                <span className="inline-block w-3 mr-1 text-[#00D4FF]">→</span>
              )}
              {opt.label}
            </button>
          ))}
        </div>
      </div>

      <Separator className="bg-[#C8C4BC]" />

      {/* Categories */}
      <div className="space-y-3">
        <p className="mono text-[9px] font-semibold text-[#4A4845] tracking-[0.2em] uppercase">Kategori</p>
        <div className="space-y-1.5">
          <button
            onClick={() => onFilterChange("category", undefined)}
            className={cn(
              "w-full text-left text-xs py-1 transition-colors",
              !filters.category
                ? "text-[#0A0A0A] font-bold"
                : "text-[#8A8680] hover:text-[#4A4845]"
            )}
          >
            Semua Kategori
          </button>
          {categories.map((cat) => (
            <button
              key={cat.id}
              onClick={() => onFilterChange("category", cat.slug)}
              className={cn(
                "w-full text-left text-xs py-1 transition-colors",
                filters.category === cat.slug
                  ? "text-[#0A0A0A] font-bold"
                  : "text-[#8A8680] hover:text-[#4A4845]"
              )}
            >
              {filters.category === cat.slug && (
                <span className="inline-block w-3 mr-1 text-[#00D4FF]">→</span>
              )}
              {cat.name}
              {cat.products_count != null && (
                <span className="ml-1 text-[#8A8680] text-[9px]">({cat.products_count})</span>
              )}
            </button>
          ))}
        </div>
      </div>

      <Separator className="bg-[#C8C4BC]" />

      {/* Sizes */}
      <div className="space-y-3">
        <p className="mono text-[9px] font-semibold text-[#4A4845] tracking-[0.2em] uppercase">Ukuran</p>
        <div className="grid grid-cols-3 gap-2">
          {SIZES.map((size) => (
            <button
              key={size}
              onClick={() => toggleSize(size)}
              className={cn(
                "h-9 text-xs font-bold rounded-xl border transition-all",
                filters.size === size
                  ? "bg-[#0A0A0A] text-[#F2F0EB] border-[#0A0A0A]"
                  : "bg-transparent text-[#4A4845] border-[#C8C4BC] hover:border-[#0A0A0A] hover:text-[#0A0A0A]"
              )}
            >
              {size}
            </button>
          ))}
        </div>
      </div>

      <Separator className="bg-[#C8C4BC]" />

      {/* Price Range */}
      <div className="space-y-3">
        <p className="mono text-[9px] font-semibold text-[#4A4845] tracking-[0.2em] uppercase">Harga</p>
        <div className="flex gap-2 items-center">
          <input
            type="number"
            placeholder="Min"
            value={filters.min_price ?? ""}
            onChange={(e) => onFilterChange("min_price", e.target.value ? Number(e.target.value) : undefined)}
            className="w-full h-9 px-3 text-xs bg-[#E8E5DF] border border-[#C8C4BC] rounded-xl outline-none focus:border-[#0A0A0A] transition-colors"
          />
          <span className="text-[#8A8680] text-xs flex-shrink-0">—</span>
          <input
            type="number"
            placeholder="Max"
            value={filters.max_price ?? ""}
            onChange={(e) => onFilterChange("max_price", e.target.value ? Number(e.target.value) : undefined)}
            className="w-full h-9 px-3 text-xs bg-[#E8E5DF] border border-[#C8C4BC] rounded-xl outline-none focus:border-[#0A0A0A] transition-colors"
          />
        </div>
      </div>

      <Separator className="bg-[#C8C4BC]" />

      {/* Toggles */}
      <div className="space-y-3">
        <p className="mono text-[9px] font-semibold text-[#4A4845] tracking-[0.2em] uppercase">Tampilkan</p>
        <div className="space-y-2.5">
          {[
            { key: "limited" as const, label: "Limited Drop Only" },
          ].map(({ key, label }) => (
            <button
              key={key}
              onClick={() => onFilterChange(key, !filters[key] || undefined)}
              className="w-full flex items-center justify-between group"
            >
              <span className={cn(
                "text-xs transition-colors",
                filters[key] ? "text-[#0A0A0A] font-semibold" : "text-[#8A8680] group-hover:text-[#4A4845]"
              )}>
                {label}
              </span>
              <div className={cn(
                "w-9 h-5 rounded-full transition-colors flex items-center px-0.5",
                filters[key] ? "bg-[#0A0A0A]" : "bg-[#C8C4BC]"
              )}>
                <div className={cn(
                  "w-4 h-4 rounded-full bg-white transition-transform",
                  filters[key] ? "translate-x-4" : "translate-x-0"
                )} />
              </div>
            </button>
          ))}
        </div>
      </div>

      {activeFilterCount > 0 && (
        <Button
          variant="outline"
          size="sm"
          onClick={onReset}
          className="w-full"
        >
          Reset Semua Filter
        </Button>
      )}
    </aside>
  );
}
