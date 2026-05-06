"use client";

import { useState, useEffect, useRef } from "react";
import { apiGet, apiPost, apiDelete } from "@/lib/api";
import { type PaginatedResponse, type Category } from "@/types";
import { Plus, Edit, Trash2, X, Image as ImageIcon, Check } from "lucide-react";
import { formatDate } from "@/lib/utils";

export default function AdminCategoriesPage() {
  const [data, setData] = useState<PaginatedResponse<Category> | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingCat, setEditingCat] = useState<Category | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  
  // Form State
  const [formData, setFormData] = useState({ name: "", description: "", is_active: true });
  const [imageFile, setImageFile] = useState<File | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const fetchCategories = async (page = 1) => {
    setIsLoading(true);
    try {
      const res = await apiGet<PaginatedResponse<Category>>(`/admin/categories?page=${page}`);
      setData(res);
    } catch (err) {
      console.error("Failed to load categories", err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchCategories();
  }, []);

  const handleOpenModal = (cat?: Category) => {
    if (cat) {
      setEditingCat(cat);
      setFormData({ name: cat.name, description: cat.description || "", is_active: cat.is_active });
    } else {
      setEditingCat(null);
      setFormData({ name: "", description: "", is_active: true });
    }
    setImageFile(null);
    if(fileInputRef.current) fileInputRef.current.value = '';
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setEditingCat(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    
    const payload = new FormData();
    payload.append("name", formData.name);
    payload.append("description", formData.description);
    payload.append("is_active", formData.is_active ? "1" : "0");
    if (imageFile) {
      payload.append("image", imageFile);
    }

    try {
      if (editingCat) {
        payload.append("_method", "PUT");
        await apiPost(`/admin/categories/${editingCat.id}`, payload);
      } else {
        await apiPost("/admin/categories", payload);
      }
      handleCloseModal();
      fetchCategories(data?.current_page || 1);
    } catch (err: any) {
      alert(err.response?.data?.message || "Failed to save category");
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async (id: number) => {
    if(!confirm("Are you sure you want to delete this category? Make sure no products are attached to it.")) return;
    try {
      await apiDelete(`/admin/categories/${id}`);
      fetchCategories(data?.current_page || 1);
    } catch (err: any) {
      alert(err.response?.data?.message || "Failed to delete category");
    }
  };

  return (
    <div className="space-y-8">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <h1 className="text-3xl font-black text-[#0A0A0A] tracking-tight mb-2">Categories</h1>
          <p className="mono text-[10px] text-[#8A8680] tracking-[0.2em] uppercase">
            System Protocol // Classification
          </p>
        </div>
        <button 
          onClick={() => handleOpenModal()}
          className="inline-flex items-center gap-2 bg-[#0A0A0A] text-[#F2F0EB] px-6 py-3 rounded-xl font-bold hover:bg-[#5C1A1A] transition-colors shadow-sm"
        >
          <Plus size={18} />
          Add Category
        </button>
      </div>

      <div className="bg-white border border-[#C8C4BC] rounded-2xl shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-[#F9F8F6] border-b border-[#C8C4BC]/60 mono text-[9px] text-[#8A8680] uppercase tracking-wider">
                <th className="p-4 pl-6 font-medium w-16">Image</th>
                <th className="p-4 font-medium">Category Name</th>
                <th className="p-4 font-medium">Description</th>
                <th className="p-4 font-medium">Products</th>
                <th className="p-4 font-medium">Status</th>
                <th className="p-4 pr-6 font-medium text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {isLoading && !data ? (
                <>
                  {[1, 2, 3, 4, 5].map((i) => (
                    <tr key={i} className="border-b border-[#C8C4BC]/20 animate-pulse">
                      <td className="p-4 pl-6"><div className="w-10 h-10 bg-[#E8E5DF] rounded-lg" /></td>
                      <td className="p-4"><div className="h-4 w-32 bg-[#E8E5DF] rounded" /></td>
                      <td className="p-4"><div className="h-4 w-48 bg-[#E8E5DF] rounded" /></td>
                      <td className="p-4"><div className="h-4 w-12 bg-[#E8E5DF] rounded" /></td>
                      <td className="p-4"><div className="h-6 w-16 bg-[#E8E5DF] rounded-full" /></td>
                      <td className="p-4 pr-6 text-right"><div className="h-8 w-16 bg-[#E8E5DF] rounded-lg inline-block" /></td>
                    </tr>
                  ))}
                </>
              ) : data && data.data.length > 0 ? (
                data.data.map((cat) => (
                  <tr key={cat.id} className="border-b border-[#C8C4BC]/20 hover:bg-[#F9F8F6]/50 transition-colors">
                    <td className="p-4 pl-6">
                      <div className="w-10 h-10 bg-[#F2F0EB] rounded-lg border border-[#C8C4BC]/60 flex items-center justify-center overflow-hidden shrink-0">
                        {cat.image ? (
                          <img src={`http://localhost:8000/storage/${cat.image}`} alt={cat.name} className="w-full h-full object-cover" />
                        ) : (
                          <ImageIcon className="text-[#C8C4BC]" size={16} />
                        )}
                      </div>
                    </td>
                    <td className="p-4 font-bold text-[#0A0A0A]">{cat.name}</td>
                    <td className="p-4 text-sm text-[#8A8680] max-w-[200px] truncate">{cat.description || '-'}</td>
                    <td className="p-4 text-sm font-bold text-[#4A4845]">{cat.products_count || 0}</td>
                    <td className="p-4">
                      {cat.is_active ? (
                        <span className="inline-block px-2.5 py-1 rounded-full text-[10px] uppercase tracking-wider font-bold bg-[#10B981]/10 text-[#10B981]">Active</span>
                      ) : (
                        <span className="inline-block px-2.5 py-1 rounded-full text-[10px] uppercase tracking-wider font-bold bg-[#8A8680]/10 text-[#8A8680]">Inactive</span>
                      )}
                    </td>
                    <td className="p-4 pr-6 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button onClick={() => handleOpenModal(cat)} className="p-2 text-[#4A4845] hover:bg-[#0A0A0A] hover:text-[#F2F0EB] rounded-lg transition-colors">
                          <Edit size={16} />
                        </button>
                        <button onClick={() => handleDelete(cat.id)} className="p-2 text-[#FF6B6B] hover:bg-[#FF6B6B]/10 rounded-lg transition-colors">
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={6} className="p-12 text-center text-[#8A8680]">No categories found.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#0A0A0A]/50 backdrop-blur-sm">
          <div className="bg-white rounded-2xl w-full max-w-lg shadow-2xl overflow-hidden border border-[#C8C4BC]">
            <div className="flex items-center justify-between p-6 border-b border-[#C8C4BC]/60">
              <h2 className="text-xl font-bold text-[#0A0A0A]">{editingCat ? 'Edit Category' : 'Add New Category'}</h2>
              <button onClick={handleCloseModal} className="text-[#8A8680] hover:text-[#FF6B6B] transition-colors">
                <X size={20} />
              </button>
            </div>
            
            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              <div className="space-y-2">
                <label className="text-xs font-bold text-[#8A8680] uppercase">Category Name *</label>
                <input required type="text" value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} className="w-full px-4 py-2.5 bg-[#F2F0EB] border border-[#C8C4BC] rounded-xl text-sm font-bold text-[#0A0A0A]" />
              </div>
              
              <div className="space-y-2">
                <label className="text-xs font-bold text-[#8A8680] uppercase">Description</label>
                <textarea rows={3} value={formData.description} onChange={e => setFormData({...formData, description: e.target.value})} className="w-full px-4 py-2.5 bg-[#F2F0EB] border border-[#C8C4BC] rounded-xl text-sm resize-none"></textarea>
              </div>

              <div className="space-y-2">
                <label className="text-xs font-bold text-[#8A8680] uppercase">Category Banner (Optional)</label>
                <input type="file" accept="image/*" ref={fileInputRef} onChange={e => setImageFile(e.target.files?.[0] || null)} className="w-full text-sm text-[#8A8680] file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-xs file:font-bold file:bg-[#0A0A0A] file:text-[#F2F0EB] hover:file:bg-[#5C1A1A] file:transition-colors cursor-pointer" />
              </div>

              <div className="pt-2">
                <label className="flex items-center gap-2 text-sm font-bold">
                  <input type="checkbox" checked={formData.is_active} onChange={e => setFormData({...formData, is_active: e.target.checked})} className="w-4 h-4 rounded border-[#C8C4BC] text-[#0A0A0A]" /> Active Category
                </label>
              </div>

              <div className="pt-6 flex justify-end gap-3">
                <button type="button" onClick={handleCloseModal} className="px-5 py-2.5 rounded-xl text-sm font-bold text-[#4A4845] hover:bg-[#F2F0EB] transition-colors">
                  Cancel
                </button>
                <button type="submit" disabled={isSaving} className="px-5 py-2.5 bg-[#00D4FF] text-[#0A0A0A] rounded-xl text-sm font-bold hover:bg-[#00D4FF]/80 transition-colors disabled:opacity-50">
                  {isSaving ? "Saving..." : "Save Category"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
