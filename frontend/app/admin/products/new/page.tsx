"use client";

import { useState, useEffect } from "react";
import { apiGet, apiPost } from "@/lib/api";
import { type Category, type Product } from "@/types";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, ArrowRight } from "lucide-react";

export default function NewProductPage() {
  const router = useRouter();
  const [categories, setCategories] = useState<Category[]>([]);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState("");

  const [formData, setFormData] = useState({
    name: "",
    category_id: "",
    price: "",
    sku: "",
    is_active: true,
  });

  useEffect(() => {
    async function fetchCategories() {
      try {
        const res = await apiGet<{ data: Category[] }>("/admin/categories");
        setCategories(res.data);
        if (res.data.length > 0) {
          setFormData(prev => ({ ...prev, category_id: res.data[0].id.toString() }));
        }
      } catch (err) {
        console.error("Failed to load categories", err);
      }
    }
    fetchCategories();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    setError("");

    try {
      // Create a dummy variant since backend requires at least 1 variant
      const payload = {
        ...formData,
        price: parseFloat(formData.price),
        category_id: parseInt(formData.category_id),
        variants: [
          { size: "M", stock: 0, additional_price: 0 }
        ]
      };

      const res = await apiPost<{ product: Product }>("/admin/products", payload);
      router.push(`/admin/products/${res.product.id}`);
    } catch (err: any) {
      setError(err.response?.data?.message || "Failed to create product");
      setIsSaving(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto space-y-8">
      <div>
        <Link 
          href="/admin/products"
          className="inline-flex items-center gap-2 text-xs font-bold text-[#8A8680] hover:text-[#0A0A0A] transition-colors mb-6"
        >
          <ArrowLeft size={14} /> Back to Products
        </Link>
        <h1 className="text-3xl font-black text-[#0A0A0A] tracking-tight mb-2">Create New Product</h1>
        <p className="mono text-[10px] text-[#8A8680] tracking-[0.2em] uppercase">
          Step 1: Basic Information
        </p>
      </div>

      <div className="bg-white border border-[#C8C4BC] rounded-2xl p-8 shadow-sm">
        {error && (
          <div className="mb-6 p-4 bg-[#FF6B6B]/10 text-[#FF6B6B] rounded-xl text-sm font-bold">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-2">
            <label className="text-xs font-bold text-[#8A8680] uppercase">Product Name *</label>
            <input
              type="text"
              required
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              className="w-full px-4 py-3 bg-[#F2F0EB] border border-[#C8C4BC] rounded-xl focus:outline-none focus:ring-2 focus:ring-[#0A0A0A] text-sm font-bold text-[#0A0A0A]"
              placeholder="e.g. Cyber Punk Jacket V2"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <label className="text-xs font-bold text-[#8A8680] uppercase">Category *</label>
              <select
                required
                value={formData.category_id}
                onChange={(e) => setFormData({ ...formData, category_id: e.target.value })}
                className="w-full px-4 py-3 bg-[#F2F0EB] border border-[#C8C4BC] rounded-xl focus:outline-none focus:ring-2 focus:ring-[#0A0A0A] text-sm appearance-none"
              >
                {categories.map((c) => (
                  <option key={c.id} value={c.id}>{c.name}</option>
                ))}
              </select>
            </div>
            
            <div className="space-y-2">
              <label className="text-xs font-bold text-[#8A8680] uppercase">SKU (Optional)</label>
              <input
                type="text"
                value={formData.sku}
                onChange={(e) => setFormData({ ...formData, sku: e.target.value })}
                className="w-full px-4 py-3 bg-[#F2F0EB] border border-[#C8C4BC] rounded-xl focus:outline-none focus:ring-2 focus:ring-[#0A0A0A] text-sm"
                placeholder="e.g. JKT-CPV2-01"
              />
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-xs font-bold text-[#8A8680] uppercase">Base Price (Rp) *</label>
            <input
              type="number"
              required
              min="0"
              value={formData.price}
              onChange={(e) => setFormData({ ...formData, price: e.target.value })}
              className="w-full px-4 py-3 bg-[#F2F0EB] border border-[#C8C4BC] rounded-xl focus:outline-none focus:ring-2 focus:ring-[#0A0A0A] text-sm font-bold text-[#0A0A0A]"
              placeholder="e.g. 500000"
            />
          </div>

          <div className="flex items-center gap-3 pt-2">
            <input
              type="checkbox"
              id="is_active"
              checked={formData.is_active}
              onChange={(e) => setFormData({ ...formData, is_active: e.target.checked })}
              className="w-5 h-5 rounded border-[#C8C4BC] text-[#0A0A0A] focus:ring-[#0A0A0A]"
            />
            <label htmlFor="is_active" className="text-sm font-bold text-[#0A0A0A]">
              Publish product immediately (Active)
            </label>
          </div>

          <div className="pt-6 border-t border-[#C8C4BC]/60 flex items-center justify-between">
            <p className="text-xs text-[#8A8680] w-2/3">
              After creating, you will be directed to the Edit page to add <strong>Variants</strong> (sizes, colors), <strong>Images</strong>, and detailed descriptions.
            </p>
            <button
              type="submit"
              disabled={isSaving}
              className="inline-flex items-center gap-2 bg-[#0A0A0A] text-[#F2F0EB] px-6 py-3 rounded-xl font-bold hover:bg-[#5C1A1A] transition-colors disabled:opacity-50"
            >
              {isSaving ? "Saving..." : "Next Step"}
              <ArrowRight size={16} />
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
