"use client";

import React, { useState, useRef, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LogOut,
  UserPlus,
  Check,
  ChevronDown,
  Settings,
  Trash2,
  Shield,
  Wallet,
  Pencil,
} from "lucide-react";
import { useExpenseStore } from "@/store/useExpenseStore";
import { DeleteAccountModal } from "@/components/delete-account-modal";
import { isSuperUser } from "@/types";

export function UserMenu() {
  const pathname = usePathname();
  const {
    currentUser,
    isAuthenticated,
    users,
    incomes,
    selectedMonth,
    paydayDay,
    setAuthModalOpen,
    setPaydayModalOpen,
    switchUser,
    logout,
  } = useExpenseStore();

  const [menuOpen, setMenuOpen] = useState(false);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
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

  // Close dropdown when route/pathname changes
  useEffect(() => {
    setMenuOpen(false);
  }, [pathname]);

  // ONE auth button when logged out: Sign In only (Register link is inside Sign In modal/page)
  if (!isAuthenticated || !currentUser) {
    return (
      <button
        onClick={() => setAuthModalOpen(true, "login")}
        className="h-9 px-3.5 rounded-full border border-[#0D0D0C]/[0.12] bg-[#FFFDFA] hover:bg-[#0D0D0C] hover:text-[#FFFDFA] text-xs font-medium text-[#0D0D0C] transition-all shadow-sm shrink-0 active:scale-95"
      >
        Sign In
      </button>
    );
  }

  const isSuper = isSuperUser(currentUser);

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
    <div className="relative shrink-0" ref={menuRef}>
      {/* Profile Pill Trigger (Avatar) */}
      <button
        onClick={() => setMenuOpen(!menuOpen)}
        className="flex items-center gap-2 p-1 pr-2.5 rounded-full border border-[#0D0D0C]/[0.1] bg-[#FFFDFA] hover:bg-[#FBF6EF] text-[#0D0D0C] transition-all shadow-sm active:scale-95 shrink-0"
        aria-expanded={menuOpen}
        aria-label="User profile menu"
      >
        <div
          className="w-7 h-7 rounded-full flex items-center justify-center text-xs font-medium text-[#FFFDFA] shrink-0"
          style={{ backgroundColor: currentUser.avatarColor || "#0D0D0C" }}
        >
          {initials}
        </div>
        <span className="text-xs font-medium text-[#0D0D0C] hidden sm:inline max-w-[90px] truncate">
          {firstName}
        </span>
        {isSuper && (
          <span className="hidden md:inline-flex items-center px-1.5 py-0.5 rounded-full bg-[#0D0D0C] text-[#FFFDFA] text-[9px] font-semibold uppercase tracking-wider">
            Super
          </span>
        )}
        <ChevronDown className="w-3 h-3 text-[#0D0D0C]/50 stroke-[1.5]" />
      </button>

      {/* Dropdown Menu */}
      {menuOpen && (
        <div className="absolute right-0 mt-2 w-64 bg-[#FFFDFA] border border-[#0D0D0C]/[0.1] rounded-[22px] shadow-[0_16px_36px_rgba(0,0,0,0.1)] p-2 z-50 animate-in fade-in zoom-in-95 duration-150">
          {/* User profile card */}
          <div className="p-3 rounded-[16px] bg-[#FBF6EF] border border-[#0D0D0C]/[0.06] mb-2">
            <div className="flex items-center gap-2.5">
              <div
                className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-semibold text-[#FFFDFA] shrink-0 shadow-sm"
                style={{ backgroundColor: currentUser.avatarColor || "#0D0D0C" }}
              >
                {initials}
              </div>
              <div className="truncate flex-1">
                <div className="flex items-center gap-1.5">
                  <span className="text-xs font-medium text-[#0D0D0C] block truncate">
                    {currentUser.name}
                  </span>
                </div>
                <span className="text-[10px] text-[#0D0D0C]/50 block truncate">
                  {currentUser.email}
                </span>
                <span
                  className={`inline-flex items-center gap-1 mt-1 px-2 py-0.5 rounded-full text-[9px] font-semibold uppercase tracking-wider ${
                    isSuper
                      ? "bg-[#0D0D0C] text-[#FFFDFA]"
                      : "bg-[#0D0D0C]/[0.07] text-[#0D0D0C]/70"
                  }`}
                >
                  {isSuper ? (
                    <>
                      <Shield className="w-2.5 h-2.5" />
                      <span>Super User</span>
                    </>
                  ) : (
                    <span>Standard Account</span>
                  )}
                </span>
              </div>
            </div>

            {/* Take-Home Salary Quick Summary & 1-Click Edit inside Profile Card */}
            <div className="mt-2.5 pt-2.5 border-t border-[#0D0D0C]/[0.06] flex items-center justify-between gap-2">
              <div className="min-w-0">
                <span className="text-[10px] text-[#0D0D0C]/45 uppercase tracking-wider font-medium block">
                  Take-Home Pay
                </span>
                <span className="text-xs font-semibold text-[#0D0D0C] block truncate">
                  R{(incomes[selectedMonth] || incomes.default || currentUser.monthlySalary || 25000).toLocaleString()}/mo · {paydayDay || currentUser.paydayDay || 25}th
                </span>
              </div>
              <button
                type="button"
                onClick={() => {
                  setMenuOpen(false);
                  setPaydayModalOpen(true);
                }}
                className="px-2.5 py-1 rounded-full bg-[#0D0D0C] text-[#FFFDFA] hover:opacity-90 text-[10px] font-medium inline-flex items-center gap-1 shrink-0 transition-all shadow-sm"
              >
                <Pencil className="w-2.5 h-2.5" />
                <span>Edit</span>
              </button>
            </div>
          </div>

          {/* Switch Account Section (only if multiple accounts exist) */}
          {users.length > 1 && (
            <>
              <div className="px-2 py-1.5 text-[10px] font-medium uppercase tracking-[0.05em] text-[#0D0D0C]/40">
                Switch Account ({users.length})
              </div>

              <div className="space-y-0.5 mb-1 max-h-40 overflow-y-auto">
                {users.map((u) => {
                  const isCurrent = u.id === currentUser.id;
                  const uSuper = isSuperUser(u);
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
                          ? "bg-[#0D0D0C] text-[#FFFDFA] font-medium"
                          : "text-[#0D0D0C]/75 hover:bg-[#FBF6EF] hover:text-[#0D0D0C]"
                      }`}
                    >
                      <div className="flex items-center gap-2 truncate">
                        <div
                          className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] shrink-0 ${
                            isCurrent
                              ? "bg-[#FFFDFA] text-[#0D0D0C]"
                              : "text-[#FFFDFA]"
                          }`}
                          style={{
                            backgroundColor: isCurrent ? "#FFFDFA" : u.avatarColor || "#0D0D0C",
                          }}
                        >
                          {uInitials}
                        </div>
                        <span className="truncate">{u.name}</span>
                        {uSuper && (
                          <span
                            className={`text-[9px] px-1.5 py-0.2 rounded-full font-semibold uppercase ${
                              isCurrent
                                ? "bg-[#FFFDFA]/20 text-[#FFFDFA]"
                                : "bg-[#0D0D0C]/10 text-[#0D0D0C]"
                            }`}
                          >
                            Super
                          </span>
                        )}
                      </div>
                      {isCurrent && <Check className="w-3.5 h-3.5 stroke-[2]" />}
                    </button>
                  );
                })}
              </div>
            </>
          )}

          <div className="border-t border-[#0D0D0C]/[0.06] pt-1 space-y-0.5">
            {/* Edit Take-Home Salary available to EVERY user */}
            <button
              onClick={() => {
                setMenuOpen(false);
                setPaydayModalOpen(true);
              }}
              className="w-full p-2 rounded-[14px] text-xs text-[#0D0D0C]/80 hover:bg-[#FBF6EF] hover:text-[#0D0D0C] flex items-center justify-between transition-colors"
            >
              <div className="flex items-center gap-2">
                <Wallet className="w-3.5 h-3.5 stroke-[1.5]" />
                <span>Edit Take-Home Salary</span>
              </div>
              <span className="text-[10px] font-semibold text-[#0D0D0C]/55">
                R{(incomes[selectedMonth] || incomes.default || currentUser.monthlySalary || 25000).toLocaleString()}
              </span>
            </button>

            {/* Settings & Privacy link ONLY visible to Super User (RBAC) */}
            {isSuper && (
              <Link
                href="/settings"
                onClick={() => setMenuOpen(false)}
                className="w-full p-2 rounded-[14px] text-xs text-[#0D0D0C]/80 hover:bg-[#FBF6EF] hover:text-[#0D0D0C] flex items-center gap-2 transition-colors"
              >
                <Settings className="w-3.5 h-3.5 stroke-[1.5]" />
                <span>Settings & Privacy</span>
              </Link>
            )}

            <button
              onClick={handleRegisterNew}
              className="w-full p-2 rounded-[14px] text-xs text-[#0D0D0C]/80 hover:bg-[#FBF6EF] hover:text-[#0D0D0C] flex items-center gap-2 transition-colors"
            >
              <UserPlus className="w-3.5 h-3.5 stroke-[1.5]" />
              <span>Register New Account</span>
            </button>

            <button
              onClick={handleLogout}
              className="w-full p-2 rounded-[14px] text-xs text-[#0D0D0C]/80 hover:bg-[#FBF6EF] hover:text-[#0D0D0C] flex items-center gap-2 transition-colors"
            >
              <LogOut className="w-3.5 h-3.5 stroke-[1.5]" />
              <span>Sign Out</span>
            </button>

            {!isSuper && (
              <button
                onClick={() => {
                  setMenuOpen(false);
                  setDeleteModalOpen(true);
                }}
                className="w-full p-2 rounded-[14px] text-xs text-rose-600 hover:bg-rose-50 flex items-center gap-2 transition-colors"
              >
                <Trash2 className="w-3.5 h-3.5 stroke-[1.5]" />
                <span>Delete Account...</span>
              </button>
            )}
          </div>
        </div>
      )}

      {/* Permanently Delete Account Modal */}
      <DeleteAccountModal
        open={deleteModalOpen}
        onClose={() => setDeleteModalOpen(false)}
      />
    </div>
  );
}
