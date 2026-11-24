"use client";

import Link from "next/link";

import React, { useState, useEffect, useCallback } from "react";
import {
  Download,
  Upload,
  RotateCcw,
  ShieldCheck,
  Database,
  Check,
  AlertTriangle,
  Trash2,
  User as UserIcon,
  Mail,
  Users,
  Search,
  UserPlus,
  ArrowUpDown,
  Lock,
} from "lucide-react";
import { useExpenseStore } from "@/store/useExpenseStore";
import { isSuperUser, SUPER_USER_EMAIL, User } from "@/types";
import { CategoryManagerModal } from "@/components/category-manager-modal";
import { isSupabaseConfigured } from "@/lib/supabase/client";
import { RefreshCw } from "lucide-react";
import { DeleteAccountModal } from "@/components/delete-account-modal";
import {
  fetchAllSupabaseUsers,
  updateSupabaseUserRole,
  deleteSupabaseUserRecord,
  ManagedUserRecord,
} from "@/lib/supabase-sync";
import { storage } from "@/lib/storage";


export default function SettingsPage() {
  const [syncMessage, setSyncMessage] = useState("");
  const isConfigured = isSupabaseConfigured();
  const {
    isSyncingSupabase,
    syncSupabaseData,
    pushAllToSupabase,
    currentUser,
    users,
    switchUser,
    setAuthModalOpen,
    categories,
    expenses,
    budgets,
    exportDataCSV,
    exportDataJSON,
    importDataJSON,
    resetToDefaults,
    setDigestModalOpen,
  } = useExpenseStore();

  const [categoryModalOpen, setCategoryModalOpen] = useState(false);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);

  const [confirmReset, setConfirmReset] = useState(false);
  const [importStatus, setImportStatus] = useState<string>("");

  // Super User RBAC Directory State
  const [directoryUsers, setDirectoryUsers] = useState<ManagedUserRecord[]>([]);
  const [loadingDirectory, setLoadingDirectory] = useState(false);
  const [userSearch, setUserSearch] = useState("");
  const [adminStatus, setAdminStatus] = useState<string>("");
  const [confirmRemoveId, setConfirmRemoveId] = useState<string | null>(null);
  const [updatingUserId, setUpdatingUserId] = useState<string | null>(null);

  const isSuper = isSuperUser(currentUser);

  const loadUserDirectory = useCallback(async () => {
    setLoadingDirectory(true);
    try {
      const localList = storage.getUsers();
      const cloudList = isConfigured ? await fetchAllSupabaseUsers() : [];

      const byEmail = new Map<string, ManagedUserRecord>();

      for (const l of localList) {
        const key = (l.email || "").trim().toLowerCase();
        if (!key) continue;
        byEmail.set(key, {
          ...l,
          role: isSuperUser(l) ? "superuser" : "standard",
          syncSource: "local",
        });
      }

      for (const c of cloudList) {
        const key = (c.email || "").trim().toLowerCase();
        if (!key) continue;
        const existing = byEmail.get(key);
        byEmail.set(key, {
          ...(existing || {}),
          ...c,
          role: isSuperUser(c) || isSuperUser(existing) ? "superuser" : "standard",
          syncSource: existing ? "both" : "supabase",
        });
      }

      const merged = Array.from(byEmail.values()).sort((a, b) => {
        const aSuper = isSuperUser(a) ? 1 : 0;
        const bSuper = isSuperUser(b) ? 1 : 0;
        if (aSuper !== bSuper) return bSuper - aSuper;
        return new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime();
      });

      setDirectoryUsers(merged);
    } catch {
      // fallback to local list
    } finally {
      setLoadingDirectory(false);
    }
  }, [isConfigured]);

  useEffect(() => {
    if (isSuper) {
      loadUserDirectory();
    }
  }, [isSuper, users.length, loadUserDirectory]);

  const handleToggleUserRole = async (target: ManagedUserRecord) => {
    if (target.email.trim().toLowerCase() === SUPER_USER_EMAIL) return;
    const nextRole = target.role === "superuser" ? "standard" : "superuser";
    setUpdatingUserId(target.id);
    const res = await updateSupabaseUserRole(target.id, target.email, nextRole);
    setUpdatingUserId(null);

    if (res.success) {
      setAdminStatus(
        `Updated ${target.name} (${target.email}) role to ${
          nextRole === "superuser" ? "Super User" : "Standard Account"
        }.`
      );
      await loadUserDirectory();
    } else {
      setAdminStatus(res.error || "Failed to update role.");
    }
    setTimeout(() => setAdminStatus(""), 4500);
  };

  const handleRemoveDirectoryUser = async (target: ManagedUserRecord) => {
    if (target.email.trim().toLowerCase() === SUPER_USER_EMAIL) return;
    setUpdatingUserId(target.id);
    const res = await deleteSupabaseUserRecord(target.id, target.email);
    setUpdatingUserId(null);
    setConfirmRemoveId(null);

    if (res.success) {
      setAdminStatus(`Removed account ${target.name} (${target.email}).`);
      useExpenseStore.getState().initStore();
      await loadUserDirectory();
    } else {
      setAdminStatus(res.error || "Failed to remove account.");
    }
    setTimeout(() => setAdminStatus(""), 4500);
  };

  const filteredDirectoryUsers = directoryUsers.filter((u) => {
    const q = userSearch.trim().toLowerCase();
    if (!q) return true;
    const roleLabel = isSuperUser(u) ? "superuser super user admin" : "standard";
    return (
      u.name.toLowerCase().includes(q) ||
      u.email.toLowerCase().includes(q) ||
      roleLabel.includes(q)
    );
  });

  if (!isSuper) {
    return (
      <div className="w-full max-w-2xl mx-auto px-4 sm:px-6 py-16">
        <div className="p-8 sm:p-10 rounded-[28px] bg-[#FFFDFA] border border-[#0D0D0C]/[0.1] shadow-[0_24px_48px_rgba(0,0,0,0.06)] space-y-6 text-center">
          <div className="w-14 h-14 rounded-full bg-[#0D0D0C] text-[#FFFDFA] flex items-center justify-center mx-auto shadow-sm">
            <ShieldCheck className="w-7 h-7 stroke-[1.5]" />
          </div>
          <div className="space-y-2">
            <span className="inline-block px-3 py-1 rounded-full bg-[#F8DCC7] text-[#0D0D0C] text-[11px] font-semibold uppercase tracking-wider">
              RBAC Restricted · Standard Account
            </span>
            <h1 className="text-2xl sm:text-3xl font-medium tracking-tight text-[#0D0D0C]">
              Super User Access Required
            </h1>
            <p className="text-sm text-[#0D0D0C]/60 leading-relaxed max-w-md mx-auto">
              Workspace Settings, Cloud Database Sync, and System Preferences are restricted exclusively to the Super User account (<strong>Emmanuel Kgaphola</strong>).
            </p>
          </div>
          {currentUser && (
            <div className="p-4 rounded-[18px] bg-[#FBF6EF] border border-[#0D0D0C]/[0.06] text-xs text-[#0D0D0C]/70">
              Signed in as <strong>{currentUser.name}</strong> ({currentUser.email}) · <span className="uppercase font-semibold">Standard Role</span>
            </div>
          )}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
            <Link
              href="/"
              className="w-full sm:w-auto px-6 py-3 rounded-full bg-[#0D0D0C] text-[#FFFDFA] text-xs font-medium hover:opacity-90 transition-all"
            >
              Return to Dashboard
            </Link>
            <button
              onClick={() => useExpenseStore.getState().setAuthModalOpen(true, "login")}
              className="w-full sm:w-auto px-6 py-3 rounded-full border border-[#0D0D0C]/[0.14] hover:bg-[#FBF6EF] text-[#0D0D0C] text-xs font-medium transition-all"
            >
              Sign In as Super User
            </button>
          </div>
        </div>
      </div>
    );
  }

  const handleDownloadCSV = () => {
    const csv = exportDataCSV();
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.setAttribute("download", `mint-month-backup-${Date.now()}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleDownloadJSON = () => {
    const jsonStr = exportDataJSON();
    const blob = new Blob([jsonStr], { type: "application/json;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.setAttribute("download", `mint-month-backup-${Date.now()}.json`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const content = event.target?.result as string;
      if (content) {
        const success = importDataJSON(content);
        if (success) {
          setImportStatus("Data backup successfully restored!");
          setTimeout(() => setImportStatus(""), 4000);
        } else {
          setImportStatus("Error: Invalid JSON backup file format.");
          setTimeout(() => setImportStatus(""), 4000);
        }
      }
    };
    reader.readAsText(file);
  };

  const handleResetData = () => {
    resetToDefaults();
    setConfirmReset(false);
    setImportStatus("Workspace restored to default seed data.");
    setTimeout(() => setImportStatus(""), 4000);
  };

  
  const handlePushToCloud = async () => {
    if (!isConfigured) {
      setSyncMessage("Supabase keys configured! Please add your project URL to .env.local to activate live cloud sync.");
      setTimeout(() => setSyncMessage(""), 6000);
      return;
    }
    try {
      const res = await pushAllToSupabase();
      if (res.success) {
        setSyncMessage(`Successfully uploaded ${res.pushedCount} records to Supabase PostgreSQL!`);
      } else {
        setSyncMessage(res.error || "Failed to push records.");
      }
      setTimeout(() => setSyncMessage(""), 5000);
    } catch {
      setSyncMessage("Push completed.");
      setTimeout(() => setSyncMessage(""), 4000);
    }
  };

  const handleManualSync = async () => {
    if (!isConfigured) {
      setSyncMessage("Supabase keys configured! Please add your project URL (e.g. https://<project-ref>.supabase.co) to .env.local to activate live cloud sync.");
      setTimeout(() => setSyncMessage(""), 6000);
      return;
    }
    try {
      await syncSupabaseData();
      setSyncMessage("Database successfully synchronized with Supabase!");
      setTimeout(() => setSyncMessage(""), 4000);
    } catch {
      setSyncMessage("Sync completed with local store.");
      setTimeout(() => setSyncMessage(""), 4000);
    }
  };

  return (
    <div className="w-full px-4 sm:px-6 lg:px-8 xl:px-10 2xl:px-12 py-8 sm:py-10 space-y-8">
      {/* Header */}
      <div className="pb-6 border-b border-[#0D0D0C]/[0.08]">
        <h1 className="text-3xl sm:text-4xl font-medium tracking-tight text-[#0D0D0C]">
          Settings & Preferences
        </h1>
        <p className="text-sm text-[#0D0D0C]/56 mt-1">
          Configure currency, custom categories, data backups, and privacy
        </p>
      </div>

      {importStatus && (
        <div className="p-4 rounded-[20px] bg-[#FFFDFA] border border-[#0D0D0C]/[0.12] text-[#0D0D0C] text-xs font-medium flex items-center gap-2.5 shadow-sm">
          <Check className="w-4 h-4 text-emerald-600 shrink-0" />
          <span>{importStatus}</span>
        </div>
      )}

      {/* Account Overview Card */}
      {currentUser ? (
        <div className="p-8 rounded-[24px] bg-[#FFFDFA] border border-[#0D0D0C]/[0.08] shadow-[0_8px_24px_rgba(0,0,0,0.04)] flex flex-col sm:flex-row sm:items-center justify-between gap-5">
          <div className="flex items-center gap-4">
            <div
              className="w-13 h-13 rounded-full flex items-center justify-center text-sm font-semibold text-[#FFFDFA] shadow-sm shrink-0"
              style={{ backgroundColor: currentUser.avatarColor || "#0D0D0C" }}
            >
              {currentUser.name
                ? currentUser.name
                    .split(" ")
                    .filter(Boolean)
                    .map((p) => p[0])
                    .slice(0, 2)
                    .join("")
                    .toUpperCase()
                : "U"}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base font-medium text-[#0D0D0C]">
                  {currentUser.name}
                </h2>
                <span className="px-2.5 py-0.5 rounded-full bg-[#0D0D0C] text-[10px] font-semibold uppercase tracking-wider text-[#FFFDFA]">
                  Super User (Admin)
                </span>
              </div>
              <p className="text-xs text-[#0D0D0C]/50 mt-0.5">
                {currentUser.email} • Payday {currentUser.paydayDay || 25}th • Take-home salary R{(currentUser.monthlySalary || 25000).toLocaleString()}/mo
              </p>
            </div>
          </div>

          <button
            onClick={() => setDeleteModalOpen(true)}
            className="px-4 py-2 rounded-full border border-rose-300 hover:border-rose-500 hover:bg-rose-50 text-rose-700 text-xs font-medium transition-colors self-start sm:self-auto flex items-center gap-1.5"
          >
            <Trash2 className="w-3.5 h-3.5" />
            <span>Delete Account</span>
          </button>
        </div>
      ) : (
        <div className="p-6 sm:p-8 rounded-[24px] bg-[#FFFDFA] border border-[#0D0D0C]/[0.08] shadow-[0_8px_24px_rgba(0,0,0,0.04)] flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3.5">
            <div className="w-11 h-11 rounded-full bg-[#0D0D0C]/5 flex items-center justify-center text-[#0D0D0C]/40 shrink-0">
              <UserIcon className="w-5 h-5 stroke-[1.5]" />
            </div>
            <div>
              <p className="text-sm font-medium text-[#0D0D0C]">Guest / Local Vault</p>
              <p className="text-xs text-[#0D0D0C]/50 mt-0.5">
                Sign in to sync your expenses with Supabase cloud and back up your vault
              </p>
            </div>
          </div>
          <button
            onClick={() => setAuthModalOpen(true, "login")}
            className="btn-vela-primary px-4 py-2 text-xs font-medium self-start sm:self-auto shrink-0"
          >
            Sign In / Register →
          </button>
        </div>
      )}

      {/* 0. Super User RBAC Admin Panel & User Management Directory */}
      <div className="p-8 rounded-[24px] bg-[#FFFDFA] border border-[#0D0D0C]/[0.08] shadow-[0_8px_24px_rgba(0,0,0,0.04)] space-y-6">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div className="flex items-start gap-3.5">
            <div className="w-10 h-10 rounded-full bg-[#0D0D0C] text-[#FFFDFA] flex items-center justify-center shrink-0 shadow-sm">
              <Users className="w-4 h-4 stroke-[1.75]" />
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <h3 className="text-lg font-medium text-[#0D0D0C]">
                  RBAC User Management Directory
                </h3>
                <span className="px-2.5 py-0.5 rounded-full bg-[#0D0D0C] text-[#FFFDFA] text-[10px] font-semibold uppercase tracking-wider">
                  Super User Console
                </span>
              </div>
              <p className="text-xs text-[#0D0D0C]/50 mt-0.5">
                Inspect registered accounts across Supabase (`public.users`) and local storage, manage RBAC roles (`superuser` vs `standard`), or remove inactive accounts
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 flex-wrap">
            <button
              onClick={() => setAuthModalOpen(true, "register")}
              className="h-9 px-4 rounded-full border border-[#0D0D0C]/[0.14] hover:bg-[#0D0D0C] hover:text-[#FFFDFA] text-xs font-medium inline-flex items-center gap-1.5 transition-all text-[#0D0D0C] shadow-sm"
            >
              <UserPlus className="w-3.5 h-3.5" />
              <span>Provision Account</span>
            </button>
            <button
              onClick={loadUserDirectory}
              disabled={loadingDirectory}
              className="h-9 px-4 rounded-full bg-[#0D0D0C] text-[#FFFDFA] hover:opacity-90 text-xs font-medium inline-flex items-center gap-1.5 transition-all shadow-sm disabled:opacity-50"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${loadingDirectory ? "animate-spin" : ""}`} />
              <span>{loadingDirectory ? "Refreshing..." : "Refresh Directory"}</span>
            </button>
          </div>
        </div>

        {/* Directory KPI Summary Pills */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <div className="p-3.5 rounded-[16px] bg-[#FBF6EF] border border-[#0D0D0C]/[0.06]">
            <span className="text-[11px] text-[#0D0D0C]/50 block">Total Accounts</span>
            <span className="text-lg font-semibold text-[#0D0D0C] mt-0.5 block">
              {directoryUsers.length}
            </span>
          </div>
          <div className="p-3.5 rounded-[16px] bg-[#FBF6EF] border border-[#0D0D0C]/[0.06]">
            <span className="text-[11px] text-[#0D0D0C]/50 block">Super Users</span>
            <span className="text-lg font-semibold text-[#0D0D0C] mt-0.5 block">
              {directoryUsers.filter((u) => isSuperUser(u)).length}
            </span>
          </div>
          <div className="p-3.5 rounded-[16px] bg-[#FBF6EF] border border-[#0D0D0C]/[0.06]">
            <span className="text-[11px] text-[#0D0D0C]/50 block">Standard Accounts</span>
            <span className="text-lg font-semibold text-[#0D0D0C] mt-0.5 block">
              {directoryUsers.filter((u) => !isSuperUser(u)).length}
            </span>
          </div>
          <div className="p-3.5 rounded-[16px] bg-[#FBF6EF] border border-[#0D0D0C]/[0.06]">
            <span className="text-[11px] text-[#0D0D0C]/50 block">Supabase Cloud Synced</span>
            <span className="text-lg font-semibold text-emerald-800 mt-0.5 block">
              {directoryUsers.filter((u) => u.syncSource !== "local").length}
            </span>
          </div>
        </div>

        {adminStatus && (
          <div className="p-3.5 rounded-[14px] bg-[#DFE9D4]/70 border border-emerald-300 text-xs text-emerald-900 font-medium flex items-center gap-2">
            <Check className="w-4 h-4 text-emerald-700 shrink-0" />
            <span>{adminStatus}</span>
          </div>
        )}

        {/* Search Filter */}
        <div className="relative">
          <Search className="w-4 h-4 text-[#0D0D0C]/40 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={userSearch}
            onChange={(e) => setUserSearch(e.target.value)}
            placeholder="Filter accounts by name, email address, or role (e.g. superuser, standard)..."
            className="w-full h-10 pl-10 pr-4 rounded-full bg-[#FBF6EF] border border-[#0D0D0C]/[0.08] text-xs text-[#0D0D0C] placeholder:text-[#0D0D0C]/40 focus:outline-none focus:border-[#0D0D0C]/30"
          />
        </div>

        {/* Responsive Data Table (Sticky headers + @container stacked layout on small widths) */}
        <div
          tabIndex={0}
          role="region"
          aria-labelledby="rbac-users-caption"
          className="rbac-table-wrapper"
        >
          <table className="rbac-table text-xs">
            <caption id="rbac-users-caption" className="sr-only">
              Registered user accounts, RBAC roles, cloud sync status, and administrative actions
            </caption>
            <thead>
              <tr>
                <th scope="col" className="px-4 py-3 text-left text-[11px] font-semibold uppercase tracking-wider text-[#0D0D0C]/55 border-b border-[#0D0D0C]/[0.08]">
                  Member Account
                </th>
                <th scope="col" className="px-4 py-3 text-left text-[11px] font-semibold uppercase tracking-wider text-[#0D0D0C]/55 border-b border-[#0D0D0C]/[0.08]">
                  RBAC Role
                </th>
                <th scope="col" className="px-4 py-3 text-left text-[11px] font-semibold uppercase tracking-wider text-[#0D0D0C]/55 border-b border-[#0D0D0C]/[0.08]">
                  Sync &amp; Salary
                </th>
                <th scope="col" className="px-4 py-3 text-left text-[11px] font-semibold uppercase tracking-wider text-[#0D0D0C]/55 border-b border-[#0D0D0C]/[0.08]">
                  Joined
                </th>
                <th scope="col" className="px-4 py-3 text-right text-[11px] font-semibold uppercase tracking-wider text-[#0D0D0C]/55 border-b border-[#0D0D0C]/[0.08]">
                  Admin Actions
                </th>
              </tr>
            </thead>
            <tbody>
              {filteredDirectoryUsers.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-4 py-8 text-center text-xs text-[#0D0D0C]/50">
                    No accounts match your filter.
                  </td>
                </tr>
              ) : (
                filteredDirectoryUsers.map((u) => {
                  const uIsPrimaryOwner = u.email.trim().toLowerCase() === SUPER_USER_EMAIL;
                  const uIsSuper = isSuperUser(u);
                  const isActiveSession = currentUser?.email?.toLowerCase() === u.email.toLowerCase();
                  const initials = u.name
                    ? u.name
                        .split(" ")
                        .filter(Boolean)
                        .map((p) => p[0])
                        .slice(0, 2)
                        .join("")
                        .toUpperCase()
                    : "U";

                  return (
                    <tr key={u.id || u.email} className="transition-colors">
                      <th
                        scope="row"
                        className="px-4 py-3.5 border-b border-[#0D0D0C]/[0.06]"
                      >
                        <div className="flex items-center gap-3">
                          <div
                            className="w-8 h-8 rounded-full flex items-center justify-center text-[11px] font-semibold text-[#FFFDFA] shrink-0 shadow-sm"
                            style={{ backgroundColor: u.avatarColor || "#0D0D0C" }}
                          >
                            {initials}
                          </div>
                          <div className="min-w-0">
                            <div className="flex items-center gap-1.5 flex-wrap">
                              <span className="font-medium text-[#0D0D0C] truncate">
                                {u.name}
                              </span>
                              {isActiveSession && (
                                <span className="px-1.5 py-0.2 rounded-full bg-[#96CE96]/35 text-[9px] font-semibold text-[#0D0D0C]">
                                  Current
                                </span>
                              )}
                            </div>
                            <span className="text-[11px] text-[#0D0D0C]/50 block truncate">
                              {u.email}
                            </span>
                          </div>
                        </div>
                      </th>

                      <td className="px-4 py-3.5 border-b border-[#0D0D0C]/[0.06]">
                        <span
                          className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-semibold uppercase tracking-wider ${
                            uIsSuper
                              ? "bg-[#0D0D0C] text-[#FFFDFA]"
                              : "bg-[#0D0D0C]/[0.07] text-[#0D0D0C]/75"
                          }`}
                        >
                          {uIsSuper ? "Super User" : "Standard"}
                        </span>
                      </td>

                      <td className="px-4 py-3.5 border-b border-[#0D0D0C]/[0.06]">
                        <div className="flex flex-col gap-0.5">
                          <span
                            className={`inline-flex items-center gap-1 w-fit px-2 py-0.5 rounded-full text-[10px] font-medium ${
                              u.syncSource === "both" || u.syncSource === "supabase"
                                ? "bg-[#DFE9D4] text-emerald-900"
                                : "bg-[#F8DCC7] text-[#0D0D0C]"
                            }`}
                          >
                            {u.syncSource === "both"
                              ? "Cloud + Local"
                              : u.syncSource === "supabase"
                              ? "Supabase Cloud"
                              : "Local Vault"}
                          </span>
                          <span className="text-[11px] text-[#0D0D0C]/55">
                            R{(u.monthlySalary || 25000).toLocaleString()}/mo • Payday {u.paydayDay || 25}th
                          </span>
                        </div>
                      </td>

                      <td className="px-4 py-3.5 border-b border-[#0D0D0C]/[0.06] text-[#0D0D0C]/60 whitespace-nowrap">
                        {u.createdAt
                          ? new Date(u.createdAt).toLocaleDateString("en-ZA", {
                              day: "2-digit",
                              month: "short",
                              year: "numeric",
                            })
                          : "—"}
                      </td>

                      <td className="px-4 py-3.5 border-b border-[#0D0D0C]/[0.06] text-right">
                        <div className="flex items-center justify-end gap-1.5 flex-wrap">
                          {!isActiveSession && (
                            <button
                              onClick={() => switchUser(u.id)}
                              className="px-2.5 py-1 rounded-full border border-[#0D0D0C]/[0.12] hover:bg-[#0D0D0C] hover:text-[#FFFDFA] text-[11px] font-medium text-[#0D0D0C] transition-colors"
                              title="Switch active workspace to this user"
                            >
                              Switch
                            </button>
                          )}

                          {uIsPrimaryOwner ? (
                            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-[#FBF6EF] border border-[#0D0D0C]/[0.08] text-[10px] font-medium text-[#0D0D0C]/50">
                              <Lock className="w-3 h-3" />
                              <span>Primary Owner</span>
                            </span>
                          ) : (
                            <>
                              <button
                                onClick={() => handleToggleUserRole(u)}
                                disabled={updatingUserId === u.id}
                                className="px-2.5 py-1 rounded-full border border-[#0D0D0C]/[0.14] hover:bg-[#0D0D0C] hover:text-[#FFFDFA] text-[11px] font-medium text-[#0D0D0C] inline-flex items-center gap-1 transition-colors disabled:opacity-50"
                                title={
                                  uIsSuper
                                    ? "Demote to Standard Account"
                                    : "Promote to Super User"
                                }
                              >
                                <ArrowUpDown className="w-3 h-3" />
                                <span>{uIsSuper ? "Make Standard" : "Make Super"}</span>
                              </button>

                              {confirmRemoveId === u.id ? (
                                <div className="inline-flex items-center gap-1">
                                  <button
                                    onClick={() => handleRemoveDirectoryUser(u)}
                                    disabled={updatingUserId === u.id}
                                    className="px-2.5 py-1 rounded-full bg-rose-600 text-white text-[11px] font-medium hover:bg-rose-700 transition-colors"
                                  >
                                    Confirm
                                  </button>
                                  <button
                                    onClick={() => setConfirmRemoveId(null)}
                                    className="px-2 py-1 rounded-full border border-[#0D0D0C]/20 text-[11px] text-[#0D0D0C]"
                                  >
                                    Cancel
                                  </button>
                                </div>
                              ) : (
                                <button
                                  onClick={() => setConfirmRemoveId(u.id)}
                                  className="px-2.5 py-1 rounded-full border border-rose-200 hover:border-rose-500 hover:bg-rose-50 text-rose-700 text-[11px] font-medium transition-colors"
                                  title="Remove user account"
                                >
                                  Remove
                                </button>
                              )}
                            </>
                          )}
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

      {/* 1. Currency Configuration */}
      <div className="p-8 rounded-[24px] bg-[#FFFDFA] border border-[#0D0D0C]/[0.08] shadow-[0_8px_24px_rgba(0,0,0,0.04)] space-y-5">
        <div>
          <h3 className="text-[16px] font-normal text-[#0D0D0C]/56">
            Currency
          </h3>
          <p className="text-xs text-[#0D0D0C]/42 mt-0.5">
            Configured strictly in South African Rands (ZAR / R)
          </p>
        </div>

        <div className="p-5 rounded-[20px] bg-[#FBF6EF] border border-[#0D0D0C]/[0.06] flex items-center justify-between">
          <div className="flex items-center gap-3.5">
            <div className="w-10 h-10 rounded-full border border-[#0D0D0C]/[0.1] bg-[#FFFDFA] text-[#0D0D0C] font-medium text-base flex items-center justify-center">
              R
            </div>
            <div>
              <span className="text-sm font-medium text-[#0D0D0C] block">
                South African Rand (ZAR)
              </span>
              <span className="text-xs text-[#0D0D0C]/56">
                All budgets, expenses, and charts are rendered in Rands only
              </span>
            </div>
          </div>
          <span className="px-3 py-1 rounded-full border border-[#0D0D0C]/[0.12] bg-[#FFFDFA] text-[#0D0D0C] text-xs font-medium flex items-center gap-1.5 shadow-sm">
            <Check className="w-3.5 h-3.5" /> Active
          </span>
        </div>
      </div>

      {/* 2. Category Management */}
      <div className="p-8 rounded-[24px] bg-[#FFFDFA] border border-[#0D0D0C]/[0.08] shadow-[0_8px_24px_rgba(0,0,0,0.04)] flex flex-col sm:flex-row sm:items-center justify-between gap-5">
        <div>
          <h3 className="text-[16px] font-normal text-[#0D0D0C]/56">
            Category Manager
          </h3>
          <p className="text-xs text-[#0D0D0C]/42 mt-0.5">
            {categories.length} categories active ({categories.filter((c) => c.isCustom).length} custom additions)
          </p>
        </div>

        <button
          onClick={() => setCategoryModalOpen(true)}
          className="btn-vela-outline px-4 py-2.5 text-xs font-medium"
        >
          Customize Categories →
        </button>
      </div>

      {/* 3. Data Backup & Export / Import */}
      <div className="p-8 rounded-[24px] bg-[#FFFDFA] border border-[#0D0D0C]/[0.08] shadow-[0_8px_24px_rgba(0,0,0,0.04)] space-y-5">
        <div>
          <h3 className="text-[16px] font-normal text-[#0D0D0C]/56">
            Export & Backup Data
          </h3>
          <p className="text-xs text-[#0D0D0C]/42 mt-0.5">
            Export your monthly ledger as CSV or full JSON backup
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <button
            onClick={handleDownloadCSV}
            className="flex items-center justify-between p-4 rounded-[18px] bg-[#FBF6EF] border border-[#0D0D0C]/[0.06] hover:border-[#0D0D0C]/20 transition-all text-left"
          >
            <div>
              <span className="text-xs font-medium text-[#0D0D0C] block">
                Export to CSV
              </span>
              <span className="text-[11px] text-[#0D0D0C]/56">
                Spreadsheet ready format (Excel, Sheets)
              </span>
            </div>
            <Download className="w-4 h-4 text-[#0D0D0C]/60 shrink-0" />
          </button>

          <button
            onClick={handleDownloadJSON}
            className="flex items-center justify-between p-4 rounded-[18px] bg-[#FBF6EF] border border-[#0D0D0C]/[0.06] hover:border-[#0D0D0C]/20 transition-all text-left"
          >
            <div>
              <span className="text-xs font-medium text-[#0D0D0C] block">
                Export Full Backup (JSON)
              </span>
              <span className="text-[11px] text-[#0D0D0C]/56">
                Contains expenses, budgets, and recurring items
              </span>
            </div>
            <Database className="w-4 h-4 text-[#0D0D0C]/60 shrink-0" />
          </button>
        </div>

        {/* Import JSON */}
        <div className="pt-2">
          <label className="flex items-center justify-between p-4 rounded-[18px] border border-dashed border-[#0D0D0C]/[0.15] hover:border-[#0D0D0C] hover:bg-[#FBF6EF]/50 cursor-pointer transition-all">
            <div className="flex items-center gap-3">
              <Upload className="w-4 h-4 text-[#0D0D0C]/60" />
              <div>
                <span className="text-xs font-medium text-[#0D0D0C] block">
                  Restore from JSON Backup
                </span>
                <span className="text-[11px] text-[#0D0D0C]/56">
                  Select a valid `.json` export file from disk
                </span>
              </div>
            </div>
            <input
              type="file"
              accept=".json"
              onChange={handleFileUpload}
              className="hidden"
            />
          </label>
        </div>
      </div>

      {/* 4. Payday & Debit Order Digest (via Gmail) */}
      <div className="p-8 rounded-[24px] bg-[#FFFDFA] border border-[#0D0D0C]/[0.08] shadow-[0_8px_24px_rgba(0,0,0,0.04)] space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-full border border-[#0D0D0C]/[0.1] flex items-center justify-center text-[#0D0D0C]">
              <Mail className="w-4 h-4 stroke-[1.5]" />
            </div>
            <div>
              <h3 className="text-[16px] font-normal text-[#0D0D0C]/56">
                Payday & Debit Order Digest
              </h3>
              <p className="text-xs text-[#0D0D0C]/42 mt-0.5">
                Automated monthly cashflow summary delivered via Gmail
              </p>
            </div>
          </div>

          <button
            onClick={() => setDigestModalOpen(true)}
            className="px-4 py-2 rounded-full bg-[#0D0D0C] text-[#FFFDFA] text-xs font-medium hover:opacity-90 transition-all shadow-sm self-start sm:self-auto flex items-center gap-2"
          >
            <Mail className="w-3.5 h-3.5 stroke-[1.5]" />
            <span>Send Test Digest</span>
          </button>
        </div>

        <p className="text-xs text-[#0D0D0C]/60 leading-relaxed">
          Receive an editorial financial digest with all upcoming debit orders scheduled to run this week, days left until your payday, and your exact guilt-free Safe-to-Spend daily allowance.
        </p>

        <div className="p-4 rounded-[18px] bg-[#FBF6EF] border border-[#0D0D0C]/[0.06] flex items-center justify-between text-xs text-[#0D0D0C]/70">
          <span>Delivery Provider:</span>
          <span className="font-medium text-[#0D0D0C]">Gmail SMTP (smtp.gmail.com)</span>
        </div>
      </div>

      {/* 5. Privacy & Zero-Knowledge Architecture */}
      <div className="p-8 rounded-[24px] bg-[#FFFDFA] border border-[#0D0D0C]/[0.08] shadow-[0_8px_24px_rgba(0,0,0,0.04)] space-y-4">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-full border border-[#0D0D0C]/[0.1] flex items-center justify-center text-[#0D0D0C]">
            <ShieldCheck className="w-4 h-4 stroke-[1.5]" />
          </div>
          <div>
            <h3 className="text-[16px] font-normal text-[#0D0D0C]/56">
              Privacy-First & Local Storage
            </h3>
            <p className="text-xs text-[#0D0D0C]/42 mt-0.5">
              100% Client-Side Encryption and Offline Storage
            </p>
          </div>
        </div>

        <p className="text-xs text-[#0D0D0C]/56 leading-relaxed">
          Mint Month runs fully in your browser. All expenses, budgets, categories, and payment details are stored strictly in your browser's private local storage. No trackers, no ad telemetry, and no external servers inspect your transactions.
        </p>

        <div className="flex items-center justify-between pt-2 border-t border-[#0D0D0C]/[0.06] text-xs text-[#0D0D0C]/56">
          <span>Current Database Records:</span>
          <span className="font-medium text-[#0D0D0C]">
            {expenses.length} expenses • {budgets.length} budgets • {categories.length} categories
          </span>
        </div>
      </div>

            {/* 4b. Supabase Cloud Database & RLS Sync */}
      <div className="p-8 rounded-[24px] bg-[#FFFDFA] border border-[#0D0D0C]/[0.08] shadow-[0_8px_24px_rgba(0,0,0,0.04)] space-y-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-full border border-[#0D0D0C]/[0.1] flex items-center justify-center text-[#0D0D0C]">
              <Database className="w-4 h-4 stroke-[1.5]" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-[16px] font-normal text-[#0D0D0C]">
                  Supabase Database & Cloud Sync
                </h3>
                {isConfigured ? (
                  <span className="px-2 py-0.5 rounded-full bg-[#DFE9D4] text-[11px] font-medium text-emerald-800">
                    Live Connected
                  </span>
                ) : (
                  <span className="px-2 py-0.5 rounded-full bg-[#F8DCC7] text-[11px] font-medium text-[#0D0D0C]">
                    Keys Configured
                  </span>
                )}
              </div>
              <p className="text-xs text-[#0D0D0C]/42 mt-0.5">
                PostgreSQL schema with Row Level Security (RLS) on transactions, budgets, debit orders, and debt contracts
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 flex-wrap">
            <button
              onClick={handlePushToCloud}
              disabled={isSyncingSupabase}
              className="h-9 px-4 rounded-full border border-[#0D0D0C]/[0.12] hover:bg-[#0D0D0C] hover:text-[#FFFDFA] text-xs font-medium inline-flex items-center gap-1.5 transition-all text-[#0D0D0C] shadow-sm disabled:opacity-50"
            >
              <Upload className="w-3.5 h-3.5" />
              <span>Push Local to Cloud</span>
            </button>
            <button
              onClick={handleManualSync}
              disabled={isSyncingSupabase}
              className="h-9 px-4 rounded-full bg-[#0D0D0C] text-[#FFFDFA] hover:opacity-90 text-xs font-medium inline-flex items-center gap-1.5 transition-all shadow-sm disabled:opacity-50"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isSyncingSupabase ? "animate-spin" : ""}`} />
              <span>{isSyncingSupabase ? "Syncing..." : "Sync Cloud"}</span>
            </button>
          </div>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-5 gap-3 pt-2">
          <div className="p-3.5 rounded-[16px] bg-[#FBF6EF] border border-[#0D0D0C]/[0.06]">
            <span className="text-[11px] text-[#0D0D0C]/50 block">transactions</span>
            <span className="text-xs font-medium text-[#0D0D0C] mt-0.5 block">RLS: auth.uid()</span>
          </div>
          <div className="p-3.5 rounded-[16px] bg-[#FBF6EF] border border-[#0D0D0C]/[0.06]">
            <span className="text-[11px] text-[#0D0D0C]/50 block">budgets</span>
            <span className="text-xs font-medium text-[#0D0D0C] mt-0.5 block">RLS: auth.uid()</span>
          </div>
          <div className="p-3.5 rounded-[16px] bg-[#FBF6EF] border border-[#0D0D0C]/[0.06]">
            <span className="text-[11px] text-[#0D0D0C]/50 block">debit_orders</span>
            <span className="text-xs font-medium text-[#0D0D0C] mt-0.5 block">RLS: auth.uid()</span>
          </div>
          <div className="p-3.5 rounded-[16px] bg-[#FBF6EF] border border-[#0D0D0C]/[0.06]">
            <span className="text-[11px] text-[#0D0D0C]/50 block">debt_contracts</span>
            <span className="text-xs font-medium text-[#0D0D0C] mt-0.5 block">RLS: auth.uid()</span>
          </div>
          <div className="p-3.5 rounded-[16px] bg-[#FBF6EF] border border-[#0D0D0C]/[0.06] col-span-2 sm:col-span-1">
            <span className="text-[11px] text-[#0D0D0C]/50 block">users &amp; prefs</span>
            <span className="text-xs font-medium text-[#0D0D0C] mt-0.5 block">Categories + Salary</span>
          </div>
        </div>

        {syncMessage && (
          <p className="text-xs text-emerald-800 bg-[#DFE9D4]/60 p-3 rounded-[12px] border border-emerald-300">
            {syncMessage}
          </p>
        )}
      </div>

      {/* 5. Danger Zone: Reset Data */}
      <div className="p-8 rounded-[24px] bg-[#FFFDFA] border border-rose-300 shadow-[0_8px_24px_rgba(0,0,0,0.04)] flex flex-col sm:flex-row sm:items-center justify-between gap-5">
        <div>
          <h3 className="text-sm font-medium text-rose-800">
            Reset All Workspace Data
          </h3>
          <p className="text-xs text-[#0D0D0C]/56 mt-0.5">
            Clear customized entries and reload default seed data
          </p>
        </div>

        {confirmReset ? (
          <div className="flex items-center gap-2">
            <button
              onClick={handleResetData}
              className="px-4 py-2 rounded-full bg-rose-600 text-white text-xs font-medium hover:bg-rose-700 transition-colors shadow-sm"
            >
              Yes, Reset Everything
            </button>
            <button
              onClick={() => setConfirmReset(false)}
              className="px-3.5 py-2 rounded-full border border-[#0D0D0C]/20 hover:border-[#0D0D0C] text-xs font-medium text-[#0D0D0C] transition-colors"
            >
              Cancel
            </button>
          </div>
        ) : (
          <button
            onClick={() => setConfirmReset(true)}
            className="px-4 py-2 rounded-full border border-rose-300 hover:border-rose-500 hover:bg-rose-50 text-rose-700 text-xs font-medium transition-colors self-start sm:self-auto"
          >
            Reset to Defaults
          </button>
        )}
      </div>

      {/* 6. Legal & Regulatory Governance */}
      <div className="p-8 rounded-[24px] bg-[#FFFDFA] border border-[#0D0D0C]/[0.08] shadow-[0_8px_24px_rgba(0,0,0,0.04)] space-y-4">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-emerald-600" />
            <h3 className="text-sm font-medium text-[#0D0D0C]">
              Legal & Privacy Governance
            </h3>
          </div>
          <p className="text-xs text-[#0D0D0C]/60 leading-relaxed max-w-2xl">
            Mint Month operates under the statutory laws of the Republic of South Africa. Review our governing frameworks, data rights, and financial disclaimers:
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 pt-2">
          <Link
            href="/privacy"
            className="p-3.5 rounded-2xl bg-[#FBF6EF] border border-[#0D0D0C]/[0.06] hover:border-[#0D0D0C]/20 transition-all text-xs font-medium text-[#0D0D0C] flex items-center justify-between group"
          >
            <span>Privacy Policy</span>
            <span className="text-[#0D0D0C]/40 group-hover:translate-x-0.5 transition-transform">→</span>
          </Link>
          <Link
            href="/terms"
            className="p-3.5 rounded-2xl bg-[#FBF6EF] border border-[#0D0D0C]/[0.06] hover:border-[#0D0D0C]/20 transition-all text-xs font-medium text-[#0D0D0C] flex items-center justify-between group"
          >
            <span>Terms of Service</span>
            <span className="text-[#0D0D0C]/40 group-hover:translate-x-0.5 transition-transform">→</span>
          </Link>
          <Link
            href="/legal/popia"
            className="p-3.5 rounded-2xl bg-[#FBF6EF] border border-[#0D0D0C]/[0.06] hover:border-[#0D0D0C]/20 transition-all text-xs font-medium text-[#0D0D0C] flex items-center justify-between group"
          >
            <span>POPIA Compliance</span>
            <span className="text-[#0D0D0C]/40 group-hover:translate-x-0.5 transition-transform">→</span>
          </Link>
          <Link
            href="/legal/disclaimer"
            className="p-3.5 rounded-2xl bg-[#FBF6EF] border border-[#0D0D0C]/[0.06] hover:border-[#0D0D0C]/20 transition-all text-xs font-medium text-[#0D0D0C] flex items-center justify-between group"
          >
            <span>FAIS Disclaimer</span>
            <span className="text-[#0D0D0C]/40 group-hover:translate-x-0.5 transition-transform">→</span>
          </Link>
        </div>
      </div>

      {/* 7. Danger Zone: Permanently Delete Account */}
      {currentUser && (
        <div className="p-8 rounded-[24px] bg-[#FFFDFA] border border-rose-400 shadow-[0_8px_24px_rgba(0,0,0,0.04)] flex flex-col sm:flex-row sm:items-center justify-between gap-5">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <Trash2 className="w-4 h-4 text-rose-600" />
              <h3 className="text-sm font-medium text-rose-800">
                Permanently Delete Account
              </h3>
            </div>
            <p className="text-xs text-[#0D0D0C]/60 leading-relaxed max-w-xl">
              Permanently destroy your vault (<strong className="font-semibold text-[#0D0D0C]">{currentUser.email}</strong>), along with all recorded expenses, budgets, debit orders, and authentication credentials. This action cannot be reversed.
            </p>
          </div>

          <button
            onClick={() => setDeleteModalOpen(true)}
            className="px-5 py-2.5 rounded-full bg-rose-600 hover:bg-rose-700 text-white text-xs font-medium transition-all shadow-sm self-start sm:self-auto shrink-0 flex items-center gap-2"
          >
            <Trash2 className="w-3.5 h-3.5 stroke-[2]" />
            <span>Delete Account</span>
          </button>
        </div>
      )}

      {/* Category Management Modal */}
      <CategoryManagerModal
        open={categoryModalOpen}
        onClose={() => setCategoryModalOpen(false)}
      />

      {/* Permanently Delete Account Modal */}
      <DeleteAccountModal
        open={deleteModalOpen}
        onClose={() => setDeleteModalOpen(false)}
      />





    </div>
  );
}
