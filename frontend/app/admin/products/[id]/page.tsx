"use client";

import { useState, useEffect, useRef } from "react";
import { apiGet, apiPut, apiPost, apiDelete, API_BASE_URL, STORAGE_URL } from "@/lib/api";
import { type Product, type Category, type ProductVariant, type ProductImage } from "@/types";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Save, Image as ImageIcon, Plus, Trash2, Star, Check } from "lucide-react";

export default function EditProductPage() {
  const params = useParams();
  const id = params.id as string;
  const router = useRouter();
  
  const [product, setProduct] = useState<Product | null>(null);
  const [categories, setCategories] = useState<Category[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  
  // Forms states
  const [isSavingInfo, setIsSavingInfo] = useState(false);
  const [newVariant, setNewVariant] = useState({ size: "M", color: "", stock: 0, additional_price: 0 });
  const [isAddingVariant, setIsAddingVariant] = useState(false);

  // File Upload
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isUploading, setIsUploading] = useState(false);

  const fetchProduct = async () => {
    try {
      const res = await apiGet<Product>(`/admin/products/${id}`);
      setProduct(res);
    } catch (err) {
      console.error(err);
      alert("Failed to load product");
      router.push("/admin/products");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    async function init() {
      try {
        const catRes = await apiGet<{ data: Category[] }>("/admin/categories");
        setCategories(catRes.data);
      } catch (err) {
        console.error(err);
      }
      if (id) fetchProduct();
    }
    init();
  }, [id]);

  const handleUpdateInfo = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!product) return;
    setIsSavingInfo(true);
    try {
      const payload = {
        name: product.name,
        category_id: product.category_id,
        description: product.description || "",
        material: product.material || "",
        sku: product.sku || "",
        price: product.price,
        discount_price: product.discount_price || null,
        weight: product.weight || 0,
        is_active: product.is_active,
        is_limited_drop: product.is_limited_drop,
        is_featured: product.is_featured,
      };
      await apiPut(`/admin/products/${id}`, payload);
      alert("Information updated successfully");
      fetchProduct();
    } catch (err: any) {
      alert(err.response?.data?.message || "Failed to update");
    } finally {
      setIsSavingInfo(false);
    }
  };

  const handleAddVariant = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsAddingVariant(true);
    try {
      await apiPost(`/admin/products/${id}/variants`, newVariant);
      setNewVariant({ size: "M", color: "", stock: 0, additional_price: 0 });
      fetchProduct();
    } catch (err: any) {
      alert(err.response?.data?.message || "Failed to add variant");
    } finally {
      setIsAddingVariant(false);
    }
  };

  const handleDeleteVariant = async (variantId: number) => {
    if(!confirm("Delete this variant?")) return;
    try {
      await apiDelete(`/admin/products/${id}/variants/${variantId}`);
      fetchProduct();
    } catch (err) {
      alert("Failed to delete variant");
    }
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || e.target.files.length === 0) return;
    setIsUploading(true);
    
    const formData = new FormData();
    Array.from(e.target.files).forEach(file => {
      formData.append('images[]', file);
    });

    try {
      const token = localStorage.getItem('voxel_token');
      const res = await fetch(`${API_BASE_URL}/admin/products/${id}/images`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Accept': 'application/json'
        },
        body: formData
      });
      if (!res.ok) throw new Error("Upload failed");
      fetchProduct();
    } catch (err) {
      alert("Failed to upload images");
    } finally {
      setIsUploading(false);
      if(fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  const handleSetPrimaryImage = async (imageId: number) => {
    try {
      await apiPut(`/admin/products/${id}/images/${imageId}/primary`, {});
      fetchProduct();
    } catch (err) {
      alert("Failed to set primary image");
    }
  };

  const handleDeleteImage = async (imageId: number) => {
    if(!confirm("Delete this image?")) return;
    try {
      await apiDelete(`/admin/products/${id}/images/${imageId}`);
      fetchProduct();
    } catch (err) {
      alert("Failed to delete image");
    }
  };

  if (isLoading || !product) {
    return (
      <div className="max-w-5xl mx-auto space-y-8 animate-pulse">
        <div className="h-4 w-32 bg-[#E8E5DF] rounded mb-6" />
        <div className="flex justify-between">
          <div>
            <div className="h-8 w-64 bg-[#E8E5DF] rounded mb-2" />
            <div className="h-3 w-48 bg-[#E8E5DF] rounded" />
          </div>
          <div className="h-4 w-24 bg-[#E8E5DF] rounded" />
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-8">
            {/* Form Skeleton */}
            <div className="bg-white border border-[#C8C4BC] rounded-2xl p-6 shadow-sm">
              <div className="h-5 w-40 bg-[#E8E5DF] rounded mb-6 border-b border-[#C8C4BC]/60 pb-4" />
              <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div><div className="h-3 w-20 bg-[#E8E5DF] rounded mb-2" /><div className="h-10 w-full bg-[#E8E5DF]/50 rounded-xl" /></div>
                  <div><div className="h-3 w-20 bg-[#E8E5DF] rounded mb-2" /><div className="h-10 w-full bg-[#E8E5DF]/50 rounded-xl" /></div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div><div className="h-3 w-20 bg-[#E8E5DF] rounded mb-2" /><div className="h-10 w-full bg-[#E8E5DF]/50 rounded-xl" /></div>
                  <div><div className="h-3 w-20 bg-[#E8E5DF] rounded mb-2" /><div className="h-10 w-full bg-[#E8E5DF]/50 rounded-xl" /></div>
                </div>
                <div><div className="h-3 w-20 bg-[#E8E5DF] rounded mb-2" /><div className="h-10 w-full bg-[#E8E5DF]/50 rounded-xl" /></div>
                <div><div className="h-3 w-20 bg-[#E8E5DF] rounded mb-2" /><div className="h-24 w-full bg-[#E8E5DF]/50 rounded-xl" /></div>
                <div className="h-4 w-32 bg-[#E8E5DF] rounded mt-6 mb-4" />
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div><div className="h-3 w-20 bg-[#E8E5DF] rounded mb-2" /><div className="h-10 w-full bg-[#E8E5DF]/50 rounded-xl" /></div>
                  <div><div className="h-3 w-20 bg-[#E8E5DF] rounded mb-2" /><div className="h-10 w-full bg-[#E8E5DF]/50 rounded-xl" /></div>
                </div>
                <div className="h-12 w-full bg-[#E8E5DF] rounded-xl mt-6" />
              </div>
            </div>
            {/* Variants Skeleton */}
            <div className="bg-white border border-[#C8C4BC] rounded-2xl p-6 shadow-sm">
              <div className="h-5 w-40 bg-[#E8E5DF] rounded mb-6 border-b border-[#C8C4BC]/60 pb-4" />
              <div className="h-32 w-full bg-[#E8E5DF]/50 rounded-xl mb-4" />
              <div className="h-24 w-full bg-[#E8E5DF]/50 rounded-xl" />
            </div>
          </div>
          <div className="space-y-6">
            {/* Images Skeleton */}
            <div className="bg-white border border-[#C8C4BC] rounded-2xl p-6 shadow-sm">
              <div className="h-5 w-32 bg-[#E8E5DF] rounded mb-6 border-b border-[#C8C4BC]/60 pb-4" />
              <div className="grid grid-cols-2 gap-4">
                <div className="aspect-square bg-[#E8E5DF]/50 rounded-xl" />
                <div className="aspect-square bg-[#E8E5DF]/50 rounded-xl border-2 border-dashed border-[#C8C4BC]" />
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto space-y-8">
      <div>
        <Link 
          href="/admin/products"
          className="inline-flex items-center gap-2 text-xs font-bold text-[#8A8680] hover:text-[#0A0A0A] transition-colors mb-6"
        >
          <ArrowLeft size={14} /> Back to Products
        </Link>
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-black text-[#0A0A0A] tracking-tight mb-2">Edit Product</h1>
            <p className="mono text-[10px] text-[#8A8680] tracking-[0.2em] uppercase">
              {product.name} // {product.sku}
            </p>
          </div>
          <a 
            href={`/products/${product.slug}`} 
            target="_blank"
            className="text-xs font-bold text-[#00D4FF] hover:underline"
          >
            View in Store ↗
          </a>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Column: Info & Variants */}
        <div className="lg:col-span-2 space-y-8">
          
          {/* Basic Information */}
          <div className="bg-white border border-[#C8C4BC] rounded-2xl p-6 shadow-sm">
            <h2 className="text-lg font-bold text-[#0A0A0A] mb-6 border-b border-[#C8C4BC]/60 pb-4">Basic Information</h2>
            <form onSubmit={handleUpdateInfo} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-xs font-bold text-[#8A8680] uppercase">Product Name</label>
                  <input type="text" required value={product.name} onChange={e => setProduct({...product, name: e.target.value})} className="w-full px-4 py-2.5 bg-[#F2F0EB] border border-[#C8C4BC] rounded-xl text-sm font-bold text-[#0A0A0A]" />
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-bold text-[#8A8680] uppercase">Category</label>
                  <select required value={product.category_id} onChange={e => setProduct({...product, category_id: parseInt(e.target.value)})} className="w-full px-4 py-2.5 bg-[#F2F0EB] border border-[#C8C4BC] rounded-xl text-sm appearance-none">
                    {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-xs font-bold text-[#8A8680] uppercase">SKU</label>
                  <input type="text" value={product.sku || ''} onChange={e => setProduct({...product, sku: e.target.value})} className="w-full px-4 py-2.5 bg-[#F2F0EB] border border-[#C8C4BC] rounded-xl text-sm" />
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-bold text-[#8A8680] uppercase">Weight (grams)</label>
                  <input type="number" value={product.weight || 0} onChange={e => setProduct({...product, weight: parseInt(e.target.value)})} className="w-full px-4 py-2.5 bg-[#F2F0EB] border border-[#C8C4BC] rounded-xl text-sm" />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-xs font-bold text-[#8A8680] uppercase">Material</label>
                <input type="text" value={product.material || ''} onChange={e => setProduct({...product, material: e.target.value})} className="w-full px-4 py-2.5 bg-[#F2F0EB] border border-[#C8C4BC] rounded-xl text-sm" placeholder="e.g. 100% Cotton, Heavyweight" />
              </div>

              <div className="space-y-2">
                <label className="text-xs font-bold text-[#8A8680] uppercase">Description</label>
                <textarea rows={4} value={product.description || ''} onChange={e => setProduct({...product, description: e.target.value})} className="w-full px-4 py-2.5 bg-[#F2F0EB] border border-[#C8C4BC] rounded-xl text-sm resize-none"></textarea>
              </div>

              <h3 className="text-sm font-bold text-[#0A0A0A] pt-4 border-t border-[#C8C4BC]/60">Pricing & Status</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-xs font-bold text-[#8A8680] uppercase">Base Price (Rp)</label>
                  <input type="number" required value={product.price} onChange={e => setProduct({...product, price: parseInt(e.target.value)})} className="w-full px-4 py-2.5 bg-[#F2F0EB] border border-[#C8C4BC] rounded-xl text-sm font-bold" />
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-bold text-[#8A8680] uppercase">Discount Price (Rp) - Optional</label>
                  <input type="number" value={product.discount_price || ''} onChange={e => setProduct({...product, discount_price: e.target.value ? parseInt(e.target.value) : undefined})} className="w-full px-4 py-2.5 bg-[#F2F0EB] border border-[#C8C4BC] rounded-xl text-sm" />
                </div>
              </div>

              <div className="flex flex-wrap gap-6 pt-2">
                <label className="flex items-center gap-2 text-sm font-bold">
                  <input type="checkbox" checked={product.is_active} onChange={e => setProduct({...product, is_active: e.target.checked})} className="w-4 h-4 rounded border-[#C8C4BC] text-[#0A0A0A]" /> Active
                </label>
                <label className="flex items-center gap-2 text-sm font-bold">
                  <input type="checkbox" checked={product.is_limited_drop} onChange={e => setProduct({...product, is_limited_drop: e.target.checked})} className="w-4 h-4 rounded border-[#C8C4BC] text-[#8B5CF6] focus:ring-[#8B5CF6]" /> Limited Drop
                </label>
                <label className="flex items-center gap-2 text-sm font-bold">
                  <input type="checkbox" checked={product.is_featured} onChange={e => setProduct({...product, is_featured: e.target.checked})} className="w-4 h-4 rounded border-[#C8C4BC] text-[#F59E0B] focus:ring-[#F59E0B]" /> Featured Product
                </label>
              </div>

              <button type="submit" disabled={isSavingInfo} className="w-full bg-[#0A0A0A] text-[#F2F0EB] rounded-xl px-4 py-3 text-sm font-bold hover:bg-[#5C1A1A] transition-colors mt-4">
                {isSavingInfo ? "Saving..." : "Save Changes"}
              </button>
            </form>
          </div>

          {/* Variants Management */}
          <div className="bg-white border border-[#C8C4BC] rounded-2xl p-6 shadow-sm">
            <h2 className="text-lg font-bold text-[#0A0A0A] mb-6 border-b border-[#C8C4BC]/60 pb-4">Variants & Stock</h2>
            
            <div className="overflow-x-auto mb-6">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-[#F9F8F6] border-b border-[#C8C4BC]/60 mono text-[9px] text-[#8A8680] uppercase tracking-wider">
                    <th className="p-3">Size</th>
                    <th className="p-3">Color</th>
                    <th className="p-3">Stock</th>
                    <th className="p-3">Add. Price</th>
                    <th className="p-3 text-right">Action</th>
                  </tr>
                </thead>
                <tbody>
                  {product.variants.map(v => (
                    <tr key={v.id} className="border-b border-[#C8C4BC]/20">
                      <td className="p-3 font-bold text-sm">{v.size}</td>
                      <td className="p-3 text-sm">{v.color || '-'}</td>
                      <td className="p-3 text-sm">{v.stock}</td>
                      <td className="p-3 text-sm">+{v.additional_price}</td>
                      <td className="p-3 text-right">
                        <button onClick={() => handleDeleteVariant(v.id)} className="text-[#FF6B6B] hover:bg-[#FF6B6B]/10 p-1.5 rounded-lg">
                          <Trash2 size={14} />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <form onSubmit={handleAddVariant} className="bg-[#F9F8F6] p-4 rounded-xl border border-[#C8C4BC]/60">
              <h3 className="text-xs font-bold text-[#0A0A0A] uppercase mb-4">Add Variant</h3>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-4">
                <input type="text" placeholder="Size (S, M, L...)" required value={newVariant.size} onChange={e => setNewVariant({...newVariant, size: e.target.value})} className="px-3 py-2 bg-white border border-[#C8C4BC] rounded-lg text-sm" />
                <input type="text" placeholder="Color (Opt)" value={newVariant.color} onChange={e => setNewVariant({...newVariant, color: e.target.value})} className="px-3 py-2 bg-white border border-[#C8C4BC] rounded-lg text-sm" />
                <input type="number" placeholder="Stock" required min="0" value={newVariant.stock} onChange={e => setNewVariant({...newVariant, stock: parseInt(e.target.value)})} className="px-3 py-2 bg-white border border-[#C8C4BC] rounded-lg text-sm" />
                <input type="number" placeholder="+ Price (Opt)" min="0" value={newVariant.additional_price} onChange={e => setNewVariant({...newVariant, additional_price: parseInt(e.target.value)})} className="px-3 py-2 bg-white border border-[#C8C4BC] rounded-lg text-sm" />
              </div>
              <button type="submit" disabled={isAddingVariant} className="bg-[#00D4FF] text-[#0A0A0A] px-4 py-2 rounded-lg text-xs font-bold hover:bg-[#00D4FF]/80">
                {isAddingVariant ? "Adding..." : "+ Add Variant"}
              </button>
            </form>
          </div>
        </div>

        {/* Right Column: Images */}
        <div className="space-y-6">
          <div className="bg-white border border-[#C8C4BC] rounded-2xl p-6 shadow-sm">
            <div className="flex items-center justify-between mb-6 border-b border-[#C8C4BC]/60 pb-4">
              <h2 className="text-lg font-bold text-[#0A0A0A] flex items-center gap-2">
                <ImageIcon size={18} /> Product Images
              </h2>
            </div>

            <div className="grid grid-cols-2 gap-4 mb-6">
              {product.images.map((img) => (
                <div key={img.id} className={`relative group aspect-square rounded-xl overflow-hidden border-2 ${img.is_primary ? 'border-[#00D4FF]' : 'border-[#C8C4BC]'}`}>
                  <img src={`${STORAGE_URL}/${img.image_path}`} alt="Product" className="w-full h-full object-cover" />
                  
                  {img.is_primary && (
                    <div className="absolute top-2 left-2 bg-[#00D4FF] text-[#0A0A0A] text-[9px] font-bold uppercase px-2 py-0.5 rounded shadow">
                      Primary
                    </div>
                  )}

                  <div className="absolute inset-0 bg-[#0A0A0A]/60 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center gap-2">
                    {!img.is_primary && (
                      <button onClick={() => handleSetPrimaryImage(img.id)} className="bg-white text-[#0A0A0A] text-xs font-bold px-3 py-1.5 rounded-lg flex items-center gap-1">
                        <Star size={12} /> Set Primary
                      </button>
                    )}
                    <button onClick={() => handleDeleteImage(img.id)} className="bg-[#FF6B6B] text-white text-xs font-bold px-3 py-1.5 rounded-lg flex items-center gap-1">
                      <Trash2 size={12} /> Delete
                    </button>
                  </div>
                </div>
              ))}

              <button 
                onClick={() => fileInputRef.current?.click()}
                disabled={isUploading}
                className="aspect-square rounded-xl border-2 border-dashed border-[#C8C4BC] flex flex-col items-center justify-center text-[#8A8680] hover:border-[#0A0A0A] hover:text-[#0A0A0A] transition-colors bg-[#F9F8F6]"
              >
                {isUploading ? (
                  <div className="w-6 h-6 border-2 border-[#0A0A0A] border-t-transparent rounded-full animate-spin" />
                ) : (
                  <>
                    <Plus size={24} className="mb-2" />
                    <span className="text-xs font-bold uppercase tracking-wider">Upload</span>
                  </>
                )}
              </button>
              <input 
                type="file" 
                multiple 
                accept="image/*" 
                className="hidden" 
                ref={fileInputRef} 
                onChange={handleFileUpload}
              />
            </div>
            <p className="text-[10px] text-[#8A8680] text-center">First image uploaded acts as the thumbnail.</p>
          </div>
        </div>
      </div>
    </div>
  );
}
