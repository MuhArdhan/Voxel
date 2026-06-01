"use client";

import { useState, useEffect } from "react";
import { apiGet, apiPost, STORAGE_URL } from "@/lib/api";
import { type PaginatedResponse, type User } from "@/types";
import { Search, ShieldAlert, Shield, User as UserIcon } from "lucide-react";
import { formatDate } from "@/lib/utils";
import { useDialog } from "@/components/ui/dialog-custom";

export default function AdminUsersPage() {
  const [data, setData] = useState<PaginatedResponse<User> | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [actionLoading, setActionLoading] = useState<number | null>(null);
  const { confirm, alert, Dialog } = useDialog();

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

  const handleToggleRole = async (user: User) => {
    const action = user.role === "admin" ? "demote to User" : "promote to Admin";
    const ok = await confirm({
      title: user.role === "admin" ? "Demote to User?" : "Promote to Admin?",
      message: `Are you sure you want to ${action} ${user.name}?`,
      variant: "confirm",
      confirmLabel: "Yes, Proceed",
    });
    if (!ok) return;
    setActionLoading(user.id);
    try {
      await apiPost(`/admin/users/${user.id}/toggle-role`, {});
      fetchUsers();
    } catch (err: any) {
      await alert({ title: "Error", message: err?.response?.data?.message || "Failed to change user role.", variant: "error" });
    } finally {
      setActionLoading(null);
    }
  };

  const handleToggleBlock = async (user: User) => {
    const action = user.is_blocked ? "unblock" : "block";
    const ok = await confirm({
      title: user.is_blocked ? "Unblock User?" : "Block User?",
      message: `Are you sure you want to ${action} ${user.name}?`,
      variant: "confirm",
      confirmLabel: `Yes, ${action.charAt(0).toUpperCase() + action.slice(1)}`,
    });
    if (!ok) return;
    setActionLoading(user.id);
    try {
      await apiPost(`/admin/users/${user.id}/toggle-block`, {});
      fetchUsers();
    } catch (err: any) {
      await alert({ title: "Error", message: err?.response?.data?.message || "Failed to update user status.", variant: "error" });
    } finally {
      setActionLoading(null);
    }
  };

  return (
    <div>
      {Dialog}
      <div className="flex items-end justify-between mb-8">
        <div>
          <h1 className="text-3xl font-black tracking-tight text-[#0A0A0A] uppercase">User Management</h1>
          <p className="mono text-[10px] tracking-[0.2em] text-[#8A8680] mt-1 uppercase">Manage access &amp; roles</p>
        </div>
      </div>

      <div className="bg-white border border-[#C8C4BC] rounded-3xl overflow-hidden shadow-sm">
        {/* Search Bar */}
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
          <p className="mono text-[10px] text-[#8A8680] tracking-widest uppercase">
            {data?.total ?? 0} users
          </p>
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-[#F2F0EB]">
                <th className="p-4 pl-6 mono text-[10px] font-bold text-[#8A8680] tracking-[0.1em] uppercase border-b border-[#C8C4BC]/60">User</th>
                <th className="p-4 mono text-[10px] font-bold text-[#8A8680] tracking-[0.1em] uppercase border-b border-[#C8C4BC]/60">Contact</th>
                <th className="p-4 mono text-[10px] font-bold text-[#8A8680] tracking-[0.1em] uppercase border-b border-[#C8C4BC]/60">Role</th>
                <th className="p-4 mono text-[10px] font-bold text-[#8A8680] tracking-[0.1em] uppercase border-b border-[#C8C4BC]/60">Status</th>
                <th className="p-4 mono text-[10px] font-bold text-[#8A8680] tracking-[0.1em] uppercase border-b border-[#C8C4BC]/60">Joined</th>
                <th className="p-4 pr-6 mono text-[10px] font-bold text-[#8A8680] tracking-[0.1em] uppercase border-b border-[#C8C4BC]/60 text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {isLoading ? (
                Array.from({ length: 5 }).map((_, i) => (
                  <tr key={i} className="border-b border-[#C8C4BC]/30 animate-pulse">
                    <td className="p-4 pl-6">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-[#E8E5DF] rounded-full shrink-0" />
                        <div className="space-y-1.5">
                          <div className="h-4 w-32 bg-[#E8E5DF] rounded" />
                          <div className="h-3 w-40 bg-[#E8E5DF] rounded" />
                        </div>
                      </div>
                    </td>
                    <td className="p-4"><div className="h-4 w-24 bg-[#E8E5DF] rounded" /></td>
                    <td className="p-4"><div className="h-5 w-16 bg-[#E8E5DF] rounded-full" /></td>
                    <td className="p-4"><div className="h-5 w-16 bg-[#E8E5DF] rounded-full" /></td>
                    <td className="p-4"><div className="h-4 w-24 bg-[#E8E5DF] rounded" /></td>
                    <td className="p-4 pr-6 text-right">
                      <div className="flex gap-2 justify-end">
                        <div className="h-8 w-20 bg-[#E8E5DF] rounded-lg" />
                        <div className="h-8 w-16 bg-[#E8E5DF] rounded-lg" />
                      </div>
                    </td>
                  </tr>
                ))
              ) : data?.data.length === 0 ? (
                <tr>
                  <td colSpan={6} className="p-12 text-center text-[#8A8680] mono text-xs uppercase tracking-widest">
                    No users found
                  </td>
                </tr>
              ) : (
                data?.data.map((user) => {
                  const isLoading = actionLoading === user.id;
                  return (
                    <tr key={user.id} className={`border-b border-[#C8C4BC]/30 hover:bg-[#F2F0EB]/50 transition-colors ${user.is_blocked ? "opacity-60" : ""}`}>
                      {/* User */}
                      <td className="p-4 pl-6">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 bg-[#F2F0EB] rounded-full flex items-center justify-center border border-[#C8C4BC]/60 overflow-hidden shrink-0">
                            {user.avatar ? (
                              <img src={`${STORAGE_URL}/${user.avatar}`} alt={user.name} className="w-full h-full object-cover" />
                            ) : (
                              <UserIcon className="text-[#8A8680]" size={16} />
                            )}
                          </div>
                          <div>
                            <p className="font-bold text-sm text-[#0A0A0A]">{user.name}</p>
                            <p className="text-xs text-[#8A8680]">{user.email}</p>
                          </div>
                        </div>
                      </td>

                      {/* Contact */}
                      <td className="p-4 text-sm text-[#4A4845]">{user.phone || <span className="text-[#C8C4BC]">—</span>}</td>

                      {/* Role */}
                      <td className="p-4">
                        {user.role === "admin" ? (
                          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] uppercase tracking-widest font-black bg-[#0A0A0A] text-[#00D4FF]">
                            <Shield size={10} /> Admin
                          </span>
                        ) : (
                          <span className="inline-block px-2.5 py-1 rounded-full text-[10px] uppercase tracking-wider font-bold bg-[#F2F0EB] border border-[#C8C4BC] text-[#4A4845]">
                            User
                          </span>
                        )}
                      </td>

                      {/* Status */}
                      <td className="p-4">
                        {user.is_blocked ? (
                          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] uppercase tracking-wider font-bold bg-[#FF6B6B]/10 text-[#FF6B6B]">
                            <ShieldAlert size={10} /> Blocked
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] uppercase tracking-wider font-bold bg-[#10B981]/10 text-[#10B981]">
                            Active
                          </span>
                        )}
                      </td>

                      {/* Joined */}
                      <td className="p-4 text-sm text-[#8A8680]">{formatDate(user.created_at)}</td>

                      {/* Actions */}
                      <td className="p-4 pr-6 text-right">
                        <div className="flex items-center justify-end gap-2">
                          {/* Toggle Role */}
                          <button
                            onClick={() => handleToggleRole(user)}
                            disabled={isLoading}
                            title={user.role === "admin" ? "Demote to User" : "Promote to Admin"}
                            className={`text-xs font-bold px-3 py-1.5 rounded-lg border transition-colors disabled:opacity-50 ${
                              user.role === "admin"
                                ? "border-[#8B5CF6] text-[#8B5CF6] hover:bg-[#8B5CF6]/10"
                                : "border-[#00D4FF] text-[#00D4FF] hover:bg-[#00D4FF]/10"
                            }`}
                          >
                            {user.role === "admin" ? "Demote" : "Make Admin"}
                          </button>

                          {/* Toggle Block */}
                          <button
                            onClick={() => handleToggleBlock(user)}
                            disabled={isLoading}
                            title={user.is_blocked ? "Unblock user" : "Block user"}
                            className={`text-xs font-bold px-3 py-1.5 rounded-lg border transition-colors disabled:opacity-50 ${
                              user.is_blocked
                                ? "border-[#10B981] text-[#10B981] hover:bg-[#10B981]/10"
                                : "border-[#FF6B6B] text-[#FF6B6B] hover:bg-[#FF6B6B]/10"
                            }`}
                          >
                            {user.is_blocked ? "Unblock" : "Block"}
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
