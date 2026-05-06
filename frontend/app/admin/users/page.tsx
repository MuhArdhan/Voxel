"use client";

import { useState, useEffect } from "react";
import { apiGet, apiPost, STORAGE_URL } from "@/lib/api";
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
    const timer = setTimeout(() => {
      fetchUsers();
    }, 500);
    return () => clearTimeout(timer);
  }, [search]);

  const toggleRole = async (userId: number) => {
    try {
      await apiPost(`/admin/users/${userId}/toggle-role`, {});
      fetchUsers();
    } catch (err) {
      alert("Failed to change user role.");
    }
  };

  return (
    <div>
      <div className="flex items-end justify-between mb-8">
        <div>
          <h1 className="text-3xl font-black tracking-tight text-[#0A0A0A] uppercase">User Management</h1>
          <p className="mono text-[10px] tracking-[0.2em] text-[#8A8680] mt-1 uppercase">Manage access & roles</p>
        </div>
      </div>

      <div className="bg-white border border-[#C8C4BC] rounded-3xl overflow-hidden shadow-sm">
        <div className="p-6 border-b border-[#C8C4BC]/60 flex justify-between items-center bg-[#F2F0EB]/50">
          <div className="relative w-72">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-[#8A8680]" size={16} />
            <input
              type="text"
              placeholder="Search users..."
              className="w-full pl-10 pr-4 py-2 bg-white border border-[#C8C4BC] rounded-xl text-sm focus:outline-none focus:border-[#0A0A0A] focus:ring-1 focus:ring-[#0A0A0A] transition-all"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-[#F2F0EB]">
                <th className="p-4 pl-6 mono text-[10px] font-bold text-[#8A8680] tracking-[0.1em] uppercase border-b border-[#C8C4BC]/60">User</th>
                <th className="p-4 mono text-[10px] font-bold text-[#8A8680] tracking-[0.1em] uppercase border-b border-[#C8C4BC]/60">Contact</th>
                <th className="p-4 mono text-[10px] font-bold text-[#8A8680] tracking-[0.1em] uppercase border-b border-[#C8C4BC]/60">Role</th>
                <th className="p-4 mono text-[10px] font-bold text-[#8A8680] tracking-[0.1em] uppercase border-b border-[#C8C4BC]/60">Joined</th>
                <th className="p-4 pr-6 mono text-[10px] font-bold text-[#8A8680] tracking-[0.1em] uppercase border-b border-[#C8C4BC]/60 text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {isLoading ? (
                Array.from({ length: 5 }).map((_, i) => (
                  <tr key={i} className="border-b border-[#C8C4BC]/30">
                    <td className="p-4 pl-6">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-[#E8E5DF]/50 rounded-full shrink-0" />
                        <div className="space-y-1.5">
                          <div className="h-4 w-32 bg-[#E8E5DF] rounded" />
                          <div className="h-3 w-40 bg-[#E8E5DF] rounded" />
                        </div>
                      </div>
                    </td>
                    <td className="p-4">
                      <div className="h-4 w-24 bg-[#E8E5DF] rounded" />
                    </td>
                    <td className="p-4">
                      <div className="h-5 w-16 bg-[#E8E5DF] rounded-md" />
                    </td>
                    <td className="p-4">
                      <div className="h-4 w-24 bg-[#E8E5DF] rounded" />
                    </td>
                    <td className="p-4 pr-6 text-right">
                      <div className="h-8 w-24 bg-[#E8E5DF] rounded-lg ml-auto" />
                    </td>
                  </tr>
                ))
              ) : data?.data.length === 0 ? (
                <tr>
                  <td colSpan={5} className="p-12 text-center text-[#8A8680] mono text-xs uppercase tracking-widest">
                    No users found
                  </td>
                </tr>
              ) : (
                data?.data.map((user) => (
                  <tr key={user.id} className="border-b border-[#C8C4BC]/30 hover:bg-[#F2F0EB]/50 transition-colors group">
                    <td className="p-4 pl-6">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-[#F2F0EB] rounded-full flex items-center justify-center border border-[#C8C4BC]/60 overflow-hidden shrink-0">
                          {user.avatar ? (
                            <img src={`${STORAGE_URL}/${user.avatar}`} alt={user.name} className="w-full h-full object-cover" />
                          ) : (
                            <UserIcon className="text-[#0A0A0A]" size={16} />
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
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
