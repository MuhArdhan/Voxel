"use client";

import { useState, useEffect, useCallback } from "react";
import { apiGet, apiDelete, apiPost } from "@/lib/api";
import { type PaginatedResponse, type Product, type Category } from "@/types";
import { formatPrice } from "@/lib/utils";
import Link from "next/link";
import { Search, Filter, Plus, Package, Edit, Trash2, RotateCcw, ChevronLeft, ChevronRight } from "lucide-react";

export default function AdminProductsPage() {
  const [data, setData] = useState<PaginatedResponse<Product> | null>(null);
  const [categories, setCategories] = useState<Category[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  
  const [search, setSearch] = useState("");
  const [categoryId, setCategoryId] = useState("");
  const [page, setPage] = useState(1);

  const fetchProducts = useCallback(async () => {
    setIsLoading(true);
    try {
      const params = new URLSearchParams({ page: page.toString() });
      if (search) params.append("search", search);
      if (categoryId) params.append("category_id", categoryId);
      
      const res = await apiGet<PaginatedResponse<Product>>(`/admin/products?${params.toString()}`);
      setData(res);
    } catch (err) {
      console.error("Failed to load products", err);
    } finally {
      setIsLoading(false);
    }
  }, [page, search, categoryId]);

  const fetchCategories = async () => {
    try {
      const res = await apiGet<PaginatedResponse<Category>>("/admin/categories");
      setCategories(res.data);
    } catch (err) {
      console.error("Failed to load categories", err);
    }
  };

  useEffect(() => {
    fetchCategories();
  }, []);

  // Debounced search effect
  useEffect(() => {
    const timer = setTimeout(() => {
      setPage(1); 
      fetchProducts();
    }, 500);
    return () => clearTimeout(timer);
  }, [search, categoryId, fetchProducts]);

  const handleDelete = async (id: number) => {
    if (!confirm("Are you sure you want to deactivate this product?")) return;
    try {
      await apiDelete(`/admin/products/${id}`);
      fetchProducts();
    } catch (err) {
      console.error(err);
      alert("Failed to delete product.");
    }
  };

  const handleRestore = async (id: number) => {
    if (!confirm("Are you sure you want to restore this product?")) return;
    try {
      await apiPost(`/admin/products/${id}/restore`);
      fetchProducts();
    } catch (err) {
      console.error(err);
      alert("Failed to restore product.");
    }
  };

  return (
    <div className="space-y-8">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <h1 className="text-3xl font-black text-[#0A0A0A] tracking-tight mb-2">Products Management</h1>
          <p className="mono text-[10px] text-[#8A8680] tracking-[0.2em] uppercase">
            System Protocol // Inventory
          </p>
        </div>
        <Link 
          href="/admin/products/new"
          className="inline-flex items-center gap-2 bg-[#0A0A0A] text-[#F2F0EB] px-6 py-3 rounded-xl font-bold hover:bg-[#5C1A1A] transition-colors shadow-sm"
        >
          <Plus size={18} />
          Create Product
        </Link>
      </div>

      {/* Filters & Search */}
      <div className="flex flex-col md:flex-row gap-4 bg-white border border-[#C8C4BC] rounded-2xl p-4 shadow-sm">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-[#8A8680]" size={18} />
          <input
            type="text"
            placeholder="Search by Product Name..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 bg-[#F2F0EB] border border-[#C8C4BC] rounded-xl focus:outline-none focus:ring-2 focus:ring-[#0A0A0A] text-sm"
          />
        </div>
        <div className="relative shrink-0 w-full md:w-64">
          <Filter className="absolute left-3 top-1/2 -translate-y-1/2 text-[#8A8680]" size={18} />
          <select
            value={categoryId}
            onChange={(e) => setCategoryId(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 bg-[#F2F0EB] border border-[#C8C4BC] rounded-xl focus:outline-none focus:ring-2 focus:ring-[#0A0A0A] text-sm appearance-none"
          >
            <option value="">All Categories</option>
            {categories.map((c) => (
              <option key={c.id} value={c.id}>{c.name}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Table */}
      <div className="bg-white border border-[#C8C4BC] rounded-2xl shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-[#F9F8F6] border-b border-[#C8C4BC]/60 mono text-[9px] text-[#8A8680] uppercase tracking-wider">
                <th className="p-4 pl-6 font-medium">Product</th>
                <th className="p-4 font-medium">Category</th>
                <th className="p-4 font-medium">SKU</th>
                <th className="p-4 font-medium">Price</th>
                <th className="p-4 font-medium">Status</th>
                <th className="p-4 pr-6 font-medium text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {isLoading && !data ? (
                <>
                  {[1, 2, 3, 4, 5].map((i) => (
                    <tr key={i} className="border-b border-[#C8C4BC]/20 animate-pulse">
                      <td className="p-4 pl-6">
                        <div className="flex gap-4 items-center">
                          <div className="w-12 h-12 bg-[#E8E5DF] rounded-lg shrink-0" />
                          <div className="flex flex-col gap-2">
                            <div className="h-4 w-32 bg-[#E8E5DF] rounded" />
                            <div className="h-2 w-16 bg-[#E8E5DF] rounded" />
                          </div>
                        </div>
                      </td>
                      <td className="p-4"><div className="h-4 w-24 bg-[#E8E5DF] rounded" /></td>
                      <td className="p-4"><div className="h-4 w-20 bg-[#E8E5DF] rounded" /></td>
                      <td className="p-4">
                        <div className="h-4 w-20 bg-[#E8E5DF] rounded mb-1" />
                        <div className="h-3 w-16 bg-[#E8E5DF] rounded" />
                      </td>
                      <td className="p-4"><div className="h-6 w-16 bg-[#E8E5DF] rounded-full" /></td>
                      <td className="p-4 pr-6 text-right"><div className="h-8 w-20 bg-[#E8E5DF] rounded-lg inline-block" /></td>
                    </tr>
                  ))}
                </>
              ) : data && data.data.length > 0 ? (
                data.data.map((product) => {
                  const primaryImg = product.images?.find(img => img.is_primary) || product.images?.[0];
                  const isDeleted = !!product.deleted_at;

                  return (
                    <tr key={product.id} className={`border-b border-[#C8C4BC]/20 hover:bg-[#F9F8F6]/50 transition-colors ${isDeleted ? 'opacity-50' : ''}`}>
                      <td className="p-4 pl-6">
                        <div className="flex items-center gap-4">
                          <div className="w-12 h-12 bg-[#F2F0EB] rounded-lg border border-[#C8C4BC]/60 flex items-center justify-center shrink-0 overflow-hidden">
                            {primaryImg ? (
                              <img src={`http://localhost:8000/storage/${primaryImg.image_path}`} alt={product.name} className="w-full h-full object-cover" />
                            ) : (
                              <Package className="text-[#C8C4BC]" size={20} />
                            )}
                          </div>
                          <div>
                            <span className="font-bold text-[#0A0A0A] block">{product.name}</span>
                            {product.is_limited_drop && (
                              <span className="text-[9px] uppercase tracking-wider font-bold text-[#8B5CF6]">Limited Drop</span>
                            )}
                          </div>
                        </div>
                      </td>
                      <td className="p-4 text-sm text-[#4A4845]">{product.category?.name}</td>
                      <td className="p-4 text-sm text-[#8A8680]">{product.sku || '-'}</td>
                      <td className="p-4">
                        <div className="font-bold text-[#0A0A0A]">{formatPrice(product.price)}</div>
                        {product.discount_price && (
                          <div className="text-xs text-[#FF6B6B] line-through">{formatPrice(product.discount_price)}</div>
                        )}
                      </td>
                      <td className="p-4">
                        {isDeleted ? (
                          <span className="inline-block px-2.5 py-1 rounded-full text-[10px] uppercase tracking-wider font-bold bg-[#FF6B6B]/10 text-[#FF6B6B]">
                            Deleted
                          </span>
                        ) : product.is_active ? (
                          <span className="inline-block px-2.5 py-1 rounded-full text-[10px] uppercase tracking-wider font-bold bg-[#10B981]/10 text-[#10B981]">
                            Active
                          </span>
                        ) : (
                          <span className="inline-block px-2.5 py-1 rounded-full text-[10px] uppercase tracking-wider font-bold bg-[#8A8680]/10 text-[#8A8680]">
                            Inactive
                          </span>
                        )}
                      </td>
                      <td className="p-4 pr-6 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <Link 
                            href={`/admin/products/${product.id}`}
                            className="p-2 text-[#4A4845] hover:bg-[#0A0A0A] hover:text-[#F2F0EB] rounded-lg transition-colors"
                            title="Edit Product"
                          >
                            <Edit size={16} />
                          </Link>
                          {isDeleted ? (
                            <button
                              onClick={() => handleRestore(product.id)}
                              className="p-2 text-[#10B981] hover:bg-[#10B981]/10 rounded-lg transition-colors"
                              title="Restore Product"
                            >
                              <RotateCcw size={16} />
                            </button>
                          ) : (
                            <button
                              onClick={() => handleDelete(product.id)}
                              className="p-2 text-[#FF6B6B] hover:bg-[#FF6B6B]/10 rounded-lg transition-colors"
                              title="Deactivate Product"
                            >
                              <Trash2 size={16} />
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })
              ) : (
                <tr>
                  <td colSpan={6} className="p-12 text-center text-[#8A8680]">No products found matching your criteria.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {data && data.last_page > 1 && (
          <div className="p-4 border-t border-[#C8C4BC]/60 flex items-center justify-between">
            <p className="text-xs text-[#8A8680]">
              Showing <span className="font-bold text-[#0A0A0A]">{data.from || 0}</span> to <span className="font-bold text-[#0A0A0A]">{data.to || 0}</span> of <span className="font-bold text-[#0A0A0A]">{data.total}</span> entries
            </p>
            <div className="flex gap-2">
              <button 
                onClick={() => setPage(p => Math.max(1, p - 1))}
                disabled={page === 1}
                className="w-8 h-8 flex items-center justify-center rounded-lg border border-[#C8C4BC] disabled:opacity-50 hover:bg-[#F2F0EB]"
              >
                <ChevronLeft size={16} />
              </button>
              <button 
                onClick={() => setPage(p => Math.min(data.last_page, p + 1))}
                disabled={page === data.last_page}
                className="w-8 h-8 flex items-center justify-center rounded-lg border border-[#C8C4BC] disabled:opacity-50 hover:bg-[#F2F0EB]"
              >
                <ChevronRight size={16} />
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
