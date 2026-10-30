"use client";

import React, { useState, useRef, useEffect } from "react";
import {
  User as UserIcon,
  LogOut,
  UserPlus,
  Users,
  Check,
  ChevronDown,
  Sparkles,
} from "lucide-react";
import { useExpenseStore } from "@/store/useExpenseStore";

export function UserMenu() {
  const {
    currentUser,
    isAuthenticated,
    users,
    setAuthModalOpen,
    switchUser,
    logout,
  } = useExpenseStore();

  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  // Close dropdown on click outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setMenuOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  if (!isAuthenticated || !currentUser) {
    return (
      <div className="flex items-center gap-2">
        <button
          onClick={() => setAuthModalOpen(true, "login")}
          className="h-10 px-4 rounded-full border border-[#0D0D0C]/[0.12] text-xs font-medium text-[#0D0D0C] hover:bg-[#0D0D0C] hover:text-[#FFFDF8] transition-all"
        >
          Sign In
        </button>
        <button
          onClick={() => setAuthModalOpen(true, "register")}
          className="h-10 px-4 rounded-full bg-[#0D0D0C] text-[#FFFDF8] text-xs font-medium hover:opacity-90 transition-all shadow-sm hidden sm:inline-flex items-center"
        >
          Register
        </button>
      </div>
    );
  }

  // Generate initials
  const initials = currentUser.name
    ? currentUser.name
        .split(" ")
        .filter(Boolean)
        .map((p) => p[0])
        .slice(0, 2)
        .join("")
        .toUpperCase()
    : "U";

  const firstName = currentUser.name ? currentUser.name.split(" ")[0] : "Account";

  const handleSwitch = (userId: string) => {
    switchUser(userId);
    setMenuOpen(false);
  };

  const handleRegisterNew = () => {
    setMenuOpen(false);
    setAuthModalOpen(true, "register");
  };

  const handleLogout = () => {
    setMenuOpen(false);
    logout();
  };

  return (
    <div className="relative" ref={menuRef}>
      {/* Profile Pill Trigger */}
      <button
        onClick={() => setMenuOpen(!menuOpen)}
        className="flex items-center gap-2 p-1.5 pr-3 rounded-full border border-[#0D0D0C]/[0.1] bg-[#FFFDF8] hover:bg-[#FBF6EF] text-[#0D0D0C] transition-all shadow-sm active:scale-95"
        aria-expanded={menuOpen}
        aria-label="User profile menu"
      >
        <div
          className="w-7 h-7 rounded-full flex items-center justify-center text-xs font-medium text-[#FFFDF8] shrink-0"
          style={{ backgroundColor: currentUser.avatarColor || "#0D0D0C" }}
        >
          {initials}
        </div>
        <span className="text-xs font-medium text-[#0D0D0C] hidden sm:inline max-w-[110px] truncate">
          {firstName}
        </span>
        <ChevronDown className="w-3.5 h-3.5 text-[#0D0D0C]/50 stroke-[1.5]" />
      </button>

      {/* Dropdown Menu */}
      {menuOpen && (
        <div className="absolute right-0 mt-2 w-64 bg-[#FFFDF8] border border-[#0D0D0C]/[0.1] rounded-[22px] shadow-[0_16px_36px_rgba(0,0,0,0.1)] p-2 z-50 animate-in fade-in zoom-in-95 duration-150">
          {/* User profile card */}
          <div className="p-3 rounded-[16px] bg-[#FBF6EF] border border-[#0D0D0C]/[0.06] mb-2">
            <div className="flex items-center gap-2.5">
              <div
                className="w-9 h-9 rounded-full flex items-center justify-center text-xs font-semibold text-[#FFFDF8] shrink-0 shadow-sm"
                style={{ backgroundColor: currentUser.avatarColor || "#0D0D0C" }}
              >
                {initials}
              </div>
              <div className="truncate">
                <span className="text-sm font-medium text-[#0D0D0C] block truncate">
                  {currentUser.name}
                </span>
                <span className="text-[11px] text-[#0D0D0C]/50 block truncate">
                  {currentUser.email}
                </span>
              </div>
            </div>
          </div>

          {/* Switch Account Section */}
          <div className="px-2 py-1.5 text-[10px] font-medium uppercase tracking-[0.05em] text-[#0D0D0C]/40">
            Switch Account ({users.length})
          </div>

          <div className="space-y-0.5 mb-1 max-h-40 overflow-y-auto">
            {users.map((u) => {
              const isCurrent = u.id === currentUser.id;
              const uInitials = u.name
                .split(" ")
                .filter(Boolean)
                .map((p) => p[0])
                .slice(0, 2)
                .join("")
                .toUpperCase();

              return (
                <button
                  key={u.id}
                  onClick={() => handleSwitch(u.id)}
                  className={`w-full p-2 rounded-[14px] text-xs flex items-center justify-between transition-colors ${
                    isCurrent
                      ? "bg-[#0D0D0C] text-[#FFFDF8] font-medium"
                      : "text-[#0D0D0C]/75 hover:bg-[#FBF6EF] hover:text-[#0D0D0C]"
                  }`}
                >
                  <div className="flex items-center gap-2 truncate">
                    <div
                      className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] shrink-0 ${
                        isCurrent
                          ? "bg-[#FFFDF8] text-[#0D0D0C]"
                          : "text-[#FFFDF8]"
                      }`}
                      style={{
                        backgroundColor: isCurrent ? "#FFFDF8" : u.avatarColor || "#0D0D0C",
                      }}
                    >
                      {uInitials}
                    </div>
                    <span className="truncate">{u.name}</span>
                  </div>
                  {isCurrent && <Check className="w-3.5 h-3.5 stroke-[2]" />}
                </button>
              );
            })}
          </div>

          <div className="border-t border-[#0D0D0C]/[0.06] pt-1 space-y-0.5">
            <button
              onClick={handleRegisterNew}
              className="w-full p-2 rounded-[14px] text-xs text-[#0D0D0C]/80 hover:bg-[#FBF6EF] hover:text-[#0D0D0C] flex items-center gap-2 transition-colors"
            >
              <UserPlus className="w-3.5 h-3.5 stroke-[1.5]" />
              <span>Register New Account</span>
            </button>

            <button
              onClick={handleLogout}
              className="w-full p-2 rounded-[14px] text-xs text-rose-600 hover:bg-rose-50 flex items-center gap-2 transition-colors"
            >
              <LogOut className="w-3.5 h-3.5 stroke-[1.5]" />
              <span>Sign Out</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

