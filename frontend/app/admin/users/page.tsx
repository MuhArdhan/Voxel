"use client";

import { useState, useEffect } from "react";
import { apiGet, apiPost } from "@/lib/api";
import { type PaginatedResponse, type User } from "@/types";
import { Search, ShieldAlert, ShieldCheck, User as UserIcon, MoreVertical } from "lucide-react";
import { formatDate } from "@/lib/utils";

export default function AdminUsersPage() {
  const [data, setData] = useState<PaginatedResponse<User> | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [search, setSearch] = useState("");

  const fetchUsers = async () => {
    setIsLoading(true);
    try {
      const res = await apiGet<PaginatedResponse<User>>(`/admin/users?search=${search}`);
      setData(res);
    } catch (err) {
      console.error("Failed to load users", err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    const timer = setTimeout(() => fetchUsers(), 500);
    return () => clearTimeout(timer);
  }, [search]);

  const handleToggleBlock = async (user: User) => {
    const action = user.is_blocked ? "unblock" : "block";
    if (!confirm(`Are you sure you want to ${action} ${user.name}?`)) return;
    
    try {
      await apiPost(`/admin/users/${user.id}/toggle-block`);
      fetchUsers();
    } catch (err) {
      alert(`Failed to ${action} user`);
    }
  };

  return (
    <div className="space-y-8">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <h1 className="text-3xl font-black text-[#0A0A0A] tracking-tight mb-2">Users Management</h1>
          <p className="mono text-[10px] text-[#8A8680] tracking-[0.2em] uppercase">
            System Protocol // Identities
          </p>
        </div>
      </div>

      {/* Search */}
      <div className="bg-white border border-[#C8C4BC] rounded-2xl p-4 shadow-sm">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-[#8A8680]" size={18} />
          <input
            type="text"
            placeholder="Search by Name or Email..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 bg-[#F2F0EB] border border-[#C8C4BC] rounded-xl focus:outline-none focus:ring-2 focus:ring-[#0A0A0A] text-sm"
          />
        </div>
      </div>

      <div className="bg-white border border-[#C8C4BC] rounded-2xl shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-[#F9F8F6] border-b border-[#C8C4BC]/60 mono text-[9px] text-[#8A8680] uppercase tracking-wider">
                <th className="p-4 pl-6 font-medium">User</th>
                <th className="p-4 font-medium">Contact</th>
                <th className="p-4 font-medium">Role</th>
                <th className="p-4 font-medium">Joined</th>
                <th className="p-4 font-medium">Status</th>
                <th className="p-4 pr-6 font-medium text-right">Action</th>
              </tr>
            </thead>
            <tbody>
              {isLoading && !data ? (
                <>
                  {[1, 2, 3, 4, 5].map((i) => (
                    <tr key={i} className="border-b border-[#C8C4BC]/20 animate-pulse">
                      <td className="p-4 pl-6">
                        <div className="flex gap-3 items-center">
                          <div className="w-10 h-10 bg-[#E8E5DF] rounded-full shrink-0" />
                          <div className="flex flex-col gap-2">
                            <div className="h-4 w-32 bg-[#E8E5DF] rounded" />
                            <div className="h-3 w-48 bg-[#E8E5DF] rounded" />
                          </div>
                        </div>
                      </td>
                      <td className="p-4"><div className="h-4 w-24 bg-[#E8E5DF] rounded" /></td>
                      <td className="p-4"><div className="h-6 w-16 bg-[#E8E5DF] rounded-full" /></td>
                      <td className="p-4"><div className="h-4 w-24 bg-[#E8E5DF] rounded" /></td>
                      <td className="p-4"><div className="h-6 w-20 bg-[#E8E5DF] rounded-full" /></td>
                      <td className="p-4 pr-6 text-right"><div className="h-8 w-16 bg-[#E8E5DF] rounded-lg inline-block" /></td>
                    </tr>
                  ))}
                </>
              ) : data && data.data.length > 0 ? (
                data.data.map((user) => (
                  <tr key={user.id} className="border-b border-[#C8C4BC]/20 hover:bg-[#F9F8F6]/50 transition-colors">
                    <td className="p-4 pl-6">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-[#0A0A0A] rounded-full flex items-center justify-center overflow-hidden shrink-0">
                          {user.avatar ? (
                            <img src={`http://localhost:8000/storage/${user.avatar}`} alt={user.name} className="w-full h-full object-cover" />
                          ) : (
                            <UserIcon className="text-[#F2F0EB]" size={16} />
                          )}
                        </div>
                        <div>
                          <p className="font-bold text-[#0A0A0A]">{user.name}</p>
                          <p className="text-xs text-[#8A8680]">{user.email}</p>
                        </div>
                      </div>
                    </td>
                    <td className="p-4 text-sm text-[#4A4845]">{user.phone || '-'}</td>
                    <td className="p-4">
                      {user.role === 'admin' ? (
                        <span className="inline-block px-2.5 py-1 rounded-full text-[10px] uppercase tracking-widest font-black bg-[#0A0A0A] text-[#00D4FF]">Admin</span>
                      ) : (
                        <span className="inline-block px-2.5 py-1 rounded-full text-[10px] uppercase tracking-wider font-bold bg-[#F2F0EB] border border-[#C8C4BC] text-[#4A4845]">User</span>
                      )}
                    </td>
                    <td className="p-4 text-sm text-[#8A8680]">{formatDate(user.created_at)}</td>
                    <td className="p-4">
                      {user.is_blocked ? (
                        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] uppercase tracking-wider font-bold bg-[#FF6B6B]/10 text-[#FF6B6B]">
                          <ShieldAlert size={12} /> Blocked
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] uppercase tracking-wider font-bold bg-[#10B981]/10 text-[#10B981]">
                          <ShieldCheck size={12} /> Active
                        </span>
                      )}
                    </td>
                    <td className="p-4 pr-6 text-right">
                      {user.role !== 'admin' && (
                        <button 
                          onClick={() => handleToggleBlock(user)}
                          className={`text-xs font-bold px-3 py-1.5 rounded-lg border transition-colors ${
                            user.is_blocked 
                              ? "border-[#10B981] text-[#10B981] hover:bg-[#10B981]/10" 
                              : "border-[#FF6B6B] text-[#FF6B6B] hover:bg-[#FF6B6B]/10"
                          }`}
                        >
                          {user.is_blocked ? "Unblock" : "Block"}
                        </button>
                      )}
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={6} className="p-12 text-center text-[#8A8680]">No users found.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
