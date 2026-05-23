"use client";

import { useState, useEffect, useRef } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { apiGet, apiPost, apiPut, STORAGE_URL } from "@/lib/api";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { motion, AnimatePresence } from "framer-motion";
import { Search, Loader2 } from "lucide-react";

export default function AccountSettings() {
  const { user, login, refreshUser } = useAuth();
  const [activeTab, setActiveTab] = useState<"profile" | "security">("profile");

  // Profile State
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [address, setAddress] = useState("");
  const [city, setCity] = useState("");
  const [province, setProvince] = useState("");
  const [postalCode, setPostalCode] = useState("");
  const [areaId, setAreaId] = useState("");

  const [avatarPreview, setAvatarPreview] = useState<string | null>(null);
  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [isProfileLoading, setIsProfileLoading] = useState(false);
  const [profileMessage, setProfileMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);

  // Area Search State
  const [areas, setAreas] = useState<any[]>([]);
  const [areaSearch, setAreaSearch] = useState("");
  const [isSearchingArea, setIsSearchingArea] = useState(false);
  const [showAreaDropdown, setShowAreaDropdown] = useState(false);
  const [selectedAreaLabel, setSelectedAreaLabel] = useState("");

  // Security State
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const [isSecurityLoading, setIsSecurityLoading] = useState(false);
  const [securityMessage, setSecurityMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);

  useEffect(() => {
    if (user) {
      setName(user.name || "");
      setPhone(user.phone || "");
      setAddress(user.address || "");
      setCity(user.city || "");
      setProvince(user.province || "");
      setPostalCode(user.postal_code || "");
      setAreaId(user.area_id || "");

      if (user.city && user.province && user.postal_code) {
        const label = `${user.city}, ${user.province}, ${user.postal_code}`;
        setSelectedAreaLabel(label);
        setAreaSearch(label);
      }

      if (user.avatar) {
        setAvatarPreview(`${STORAGE_URL}/${user.avatar}`);
      }
    }
  }, [user]);

  /* ── area search debounce ── */
  useEffect(() => {
    const timer = setTimeout(() => {
      if (areaSearch.length > 2 && areaSearch !== selectedAreaLabel) {
        setIsSearchingArea(true);
        apiGet<any[]>('/shipping/areas', { search: areaSearch })
          .then((data) => {
            setAreas(data);
            setShowAreaDropdown(true);
          })
          .catch((e) => console.error(e))
          .finally(() => setIsSearchingArea(false));
      } else {
        setAreas([]);
        setShowAreaDropdown(false);
      }
    }, 500);

    return () => clearTimeout(timer);
  }, [areaSearch, selectedAreaLabel]);

  const selectArea = (area: any) => {
    setCity(area.administrative_division_level_2_name);
    setProvince(area.administrative_division_level_1_name);
    setPostalCode(String(area.postal_code));
    setAreaId(area.id);

    const label = `${area.name}, ${area.administrative_division_level_2_name}, ${area.postal_code}`;
    setSelectedAreaLabel(label);
    setAreaSearch(label);
    setShowAreaDropdown(false);
  };

  const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setAvatarFile(file);
      setAvatarPreview(URL.createObjectURL(file));
    }
  };

  const handleProfileSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsProfileLoading(true);
    setProfileMessage(null);

    try {
      const formData = new FormData();
      formData.append("_method", "PUT");
      formData.append("name", name);
      if (phone) formData.append("phone", phone);
      if (address) formData.append("address", address);
      if (city) formData.append("city", city);
      if (province) formData.append("province", province);
      if (postalCode) formData.append("postal_code", postalCode);
      if (areaId) formData.append("area_id", areaId);
      if (avatarFile) formData.append("avatar", avatarFile);

      // Using apiPost because Laravel requires POST for FormData with _method=PUT
      const res = await apiPost("/auth/profile", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      setProfileMessage({ type: "success", text: "Profile updated successfully." });
      // Update global context so the UI reflects the new name/avatar immediately
      await refreshUser();
    } catch (err: any) {
      setProfileMessage({
        type: "error",
        text: err.response?.data?.message || "Failed to update profile."
      });
    } finally {
      setIsProfileLoading(false);
    }
  };

  const handleSecuritySubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSecurityLoading(true);
    setSecurityMessage(null);

    try {
      await apiPut("/auth/change-password", {
        current_password: currentPassword,
        password: newPassword,
        password_confirmation: confirmPassword,
      });

      setSecurityMessage({ type: "success", text: "Password changed successfully. You may need to log in again." });
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
    } catch (err: any) {
      const errMsg = err.response?.data?.errors?.password?.[0] ||
        err.response?.data?.errors?.current_password?.[0] ||
        err.response?.data?.message ||
        "Failed to change password.";
      setSecurityMessage({ type: "error", text: errMsg });
    } finally {
      setIsSecurityLoading(false);
    }
  };

  if (!user) return null;

  return (
    <div className="space-y-8">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <h1 className="text-3xl md:text-4xl font-black text-[#0A0A0A] tracking-tight mb-2">
          Account <span className="text-[#5C1A1A]">Settings.</span>
        </h1>
        <p className="mono text-[10px] text-[#8A8680] tracking-[0.2em] uppercase">
          Update your account information
        </p>
      </motion.div>

      {/* Tabs */}
      <div className="flex gap-4 border-b border-[#C8C4BC]/60">
        <button
          onClick={() => setActiveTab("profile")}
          className={`pb-4 px-2 font-bold transition-colors border-b-2 ${activeTab === "profile"
              ? "border-[#0A0A0A] text-[#0A0A0A]"
              : "border-transparent text-[#8A8680] hover:text-[#0A0A0A]"
            }`}
        >
          Profile
        </button>
        <button
          onClick={() => setActiveTab("security")}
          className={`pb-4 px-2 font-bold transition-colors border-b-2 ${activeTab === "security"
              ? "border-[#0A0A0A] text-[#0A0A0A]"
              : "border-transparent text-[#8A8680] hover:text-[#0A0A0A]"
            }`}
        >
          Security
        </button>
      </div>

      <AnimatePresence mode="wait">
        {/* PROFILE TAB */}
        {activeTab === "profile" && (
          <motion.div
            key="profile"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 20 }}
            transition={{ duration: 0.3 }}
            className="bg-[#E8E5DF]/60 border border-[#C8C4BC]/60 rounded-3xl p-6 md:p-10"
          >
            <form onSubmit={handleProfileSubmit} className="space-y-6">
              {profileMessage && (
                <div className={`p-4 rounded-xl text-sm font-bold ${profileMessage.type === "success"
                    ? "bg-[#10B981]/10 text-[#10B981] border border-[#10B981]/30"
                    : "bg-[#FF6B6B]/10 text-[#FF6B6B] border border-[#FF6B6B]/30"
                  }`}>
                  {profileMessage.text}
                </div>
              )}

              <div className="flex items-center gap-6 pb-6 border-b border-[#C8C4BC]/40">
                <div
                  className="w-20 h-20 md:w-24 md:h-24 bg-[#0A0A0A] rounded-2xl overflow-hidden flex items-center justify-center border-2 border-[#C8C4BC] relative group cursor-pointer"
                  onClick={() => fileInputRef.current?.click()}
                >
                  {avatarPreview ? (
                    <img src={avatarPreview} alt="Avatar Preview" className="w-full h-full object-cover" />
                  ) : (
                    <span className="text-3xl">👽</span>
                  )}
                  <div className="absolute inset-0 bg-[#0A0A0A]/60 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                    <span className="mono text-[9px] text-[#F2F0EB] tracking-[0.1em] uppercase font-bold">Upload</span>
                  </div>
                </div>
                <div>
                  <h3 className="font-bold text-[#0A0A0A] mb-1">Avatar Update</h3>
                  <p className="text-xs text-[#8A8680] mb-3">JPG, GIF or PNG. Max size 2MB.</p>
                  <input
                    type="file"
                    ref={fileInputRef}
                    onChange={handleAvatarChange}
                    accept="image/*"
                    className="hidden"
                  />
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    className="px-4 py-2 border border-[#C8C4BC] rounded-full text-xs font-bold hover:bg-[#0A0A0A] hover:text-[#F2F0EB] transition-colors"
                  >
                    Select File
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="name">Full Name</Label>
                  <Input
                    id="name"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="bg-[#F2F0EB] border-[#C8C4BC] focus-visible:ring-[#0A0A0A]"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="email">Email Address</Label>
                  <Input
                    id="email"
                    value={user.email}
                    disabled
                    className="bg-[#D4D0C8] border-[#C8C4BC] text-[#8A8680]"
                  />
                  <p className="text-[10px] text-[#8A8680]">Email cannot be changed.</p>
                </div>
                <div className="space-y-2 md:col-span-2">
                  <Label htmlFor="phone">Phone Number</Label>
                  <Input
                    id="phone"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    className="bg-[#F2F0EB] border-[#C8C4BC] focus-visible:ring-[#0A0A0A]"
                  />
                </div>
                <div className="space-y-2 md:col-span-2">
                  <Label htmlFor="address">Complete Address</Label>
                  <Textarea
                    id="address"
                    value={address}
                    onChange={(e) => setAddress(e.target.value)}
                    className="bg-[#F2F0EB] border-[#C8C4BC] focus-visible:ring-[#0A0A0A] min-h-[100px]"
                  />
                </div>

                {/* Area Search Autocomplete */}
                <div className="space-y-2 md:col-span-2 relative">
                  <Label htmlFor="area_search">District / City / Postal Code</Label>
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-[#8A8680]" size={18} />
                    <Input
                      id="area_search"
                      value={areaSearch}
                      onChange={(e) => setAreaSearch(e.target.value)}
                      placeholder="e.g. Kebayoran Baru or 12110"
                      className="bg-[#F2F0EB] border-[#C8C4BC] pl-10 focus-visible:ring-[#0A0A0A]"
                      autoComplete="off"
                    />
                    {isSearchingArea && (
                      <Loader2 className="absolute right-3 top-1/2 -translate-y-1/2 text-[#5C1A1A] animate-spin" size={18} />
                    )}
                  </div>

                  <AnimatePresence>
                    {showAreaDropdown && areas.length > 0 && (
                      <motion.div
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        className="absolute z-20 w-full mt-2 bg-[#F2F0EB] border border-[#C8C4BC] rounded-xl shadow-2xl max-h-64 overflow-y-auto overflow-x-hidden"
                      >
                        {areas.map((area) => (
                          <div
                            key={area.id}
                            className="px-5 py-3 hover:bg-[#E8E5DF] cursor-pointer border-b border-[#C8C4BC]/40 last:border-0 transition-colors flex flex-col gap-0.5"
                            onClick={() => selectArea(area)}
                          >
                            <p className="font-bold text-sm text-[#0A0A0A]">{area.name}</p>
                            <p className="text-[11px] text-[#8A8680] uppercase tracking-wider mono">
                              {area.administrative_division_level_2_name}, {area.administrative_division_level_1_name} {area.postal_code}
                            </p>
                          </div>
                        ))}
                      </motion.div>
                    )}
                    {showAreaDropdown && areaSearch.length > 2 && areas.length === 0 && !isSearchingArea && areaSearch !== selectedAreaLabel && (
                      <motion.div
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        className="absolute z-20 w-full mt-2 bg-[#F2F0EB] border border-[#C8C4BC] rounded-xl shadow-xl p-6 text-center"
                      >
                        <p className="text-sm font-medium text-[#8A8680]">No areas found.</p>
                        <p className="text-[10px] text-[#8A8680]/60 uppercase tracking-widest mono mt-1">Try another keyword</p>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              </div>

              <div className="pt-4 flex justify-end">
                <button
                  type="submit"
                  disabled={isProfileLoading}
                  className="bg-[#0A0A0A] text-[#F2F0EB] rounded-full px-8 py-3.5 font-bold hover:bg-[#5C1A1A] disabled:opacity-50 transition-colors"
                >
                  {isProfileLoading ? "SAVING..." : "SAVE PROFILE"}
                </button>
              </div>
            </form>
          </motion.div>
        )}

        {/* SECURITY TAB */}
        {activeTab === "security" && (
          <motion.div
            key="security"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 20 }}
            transition={{ duration: 0.3 }}
            className="bg-[#E8E5DF]/60 border border-[#C8C4BC]/60 rounded-3xl p-6 md:p-10"
          >
            <form onSubmit={handleSecuritySubmit} className="space-y-6 max-w-md">
              {securityMessage && (
                <div className={`p-4 rounded-xl text-sm font-bold ${securityMessage.type === "success"
                    ? "bg-[#10B981]/10 text-[#10B981] border border-[#10B981]/30"
                    : "bg-[#FF6B6B]/10 text-[#FF6B6B] border border-[#FF6B6B]/30"
                  }`}>
                  {securityMessage.text}
                </div>
              )}

              <div className="space-y-2">
                <Label htmlFor="currentPassword">Current Password</Label>
                <Input
                  id="currentPassword"
                  type="password"
                  value={currentPassword}
                  onChange={(e) => setCurrentPassword(e.target.value)}
                  className="bg-[#F2F0EB] border-[#C8C4BC] focus-visible:ring-[#0A0A0A]"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="newPassword">New Password</Label>
                <Input
                  id="newPassword"
                  type="password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  className="bg-[#F2F0EB] border-[#C8C4BC] focus-visible:ring-[#0A0A0A]"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="confirmPassword">Confirm New Password</Label>
                <Input
                  id="confirmPassword"
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="bg-[#F2F0EB] border-[#C8C4BC] focus-visible:ring-[#0A0A0A]"
                  required
                />
              </div>

              <div className="pt-4">
                <button
                  type="submit"
                  disabled={isSecurityLoading}
                  className="bg-[#0A0A0A] text-[#F2F0EB] rounded-full px-8 py-3.5 font-bold hover:bg-[#5C1A1A] disabled:opacity-50 transition-colors w-full sm:w-auto"
                >
                  {isSecurityLoading ? "UPDATING..." : "UPDATE PASSWORD"}
                </button>
              </div>
            </form>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
