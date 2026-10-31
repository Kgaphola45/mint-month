"use client";

import React, { useState } from "react";
import {
  X,
  Trash2,
  Edit2,
  Palette,
  FolderPlus,
} from "lucide-react";
import { useExpenseStore } from "@/store/useExpenseStore";
import { AVAILABLE_ICONS, AVAILABLE_COLORS } from "@/lib/constants";
import { CategoryIcon } from "./category-icon";
import { Category } from "@/types";

interface CategoryManagerModalProps {
  isOpen?: boolean;
  open?: boolean;
  onClose: () => void;
}

export function CategoryManagerModal({
  isOpen,
  open,
  onClose,
}: CategoryManagerModalProps) {
  const visible = isOpen ?? open ?? false;
  const { categories, addCategory, updateCategory, deleteCategory } =
    useExpenseStore();

  const [editingCatId, setEditingCatId] = useState<string | null>(null);
  const [name, setName] = useState("");
  const [icon, setIcon] = useState("ShoppingBag");
  const [color, setColor] = useState("#96CE96");
  const [error, setError] = useState("");

  if (!visible) return null;

  const handleStartAdd = () => {
    setEditingCatId("new");
    setName("");
    setIcon("Tag");
    setColor("#96CE96");
    setError("");
  };

  const handleStartEdit = (cat: Category) => {
    setEditingCatId(cat.id);
    setName(cat.name);
    setIcon(cat.icon);
    setColor(cat.color);
    setError("");
  };

  const handleCancelForm = () => {
    setEditingCatId(null);
    setName("");
    setError("");
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      setError("Please enter a category name");
      return;
    }

    if (editingCatId === "new") {
      addCategory({
        name: name.trim(),
        icon,
        color,
      });
    } else if (editingCatId) {
      updateCategory(editingCatId, {
        name: name.trim(),
        icon,
        color,
      });
    }

    handleCancelForm();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div
        className="fixed inset-0 bg-[#0D0D0C]/40 backdrop-blur-sm"
        onClick={onClose}
      />

      <div className="relative w-full max-w-lg bg-[#FFFDFA] border border-[#0D0D0C]/[0.1] rounded-[28px] shadow-2xl overflow-hidden z-10 flex flex-col max-h-[85vh]">
        {/* Header */}
        <div className="px-7 py-5 flex items-center justify-between border-b border-[#0D0D0C]/[0.06] shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-full border border-[#0D0D0C]/[0.1] bg-[#FBF6EF] text-[#0D0D0C] flex items-center justify-center">
              <Palette className="w-4 h-4 stroke-[1.5]" />
            </div>
            <div>
              <h2 className="text-base font-medium text-[#0D0D0C]">
                Manage Categories
              </h2>
              <p className="text-xs text-[#0D0D0C]/56">
                Customize, create, or re-icon your spending buckets
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-full hover:bg-[#FBF6EF] text-[#0D0D0C]/60 hover:text-[#0D0D0C] transition-colors"
          >
            <X className="w-4 h-4 stroke-[1.5]" />
          </button>
        </div>

        {/* Content Area */}
        <div className="p-7 overflow-y-auto space-y-6">
          {/* Add / Edit Form */}
          {editingCatId ? (
            <form
              onSubmit={handleSubmit}
              className="p-5 rounded-[20px] bg-[#FBF6EF] border border-[#0D0D0C]/[0.08] space-y-4"
            >
              <h3 className="text-xs font-medium text-[#0D0D0C]">
                {editingCatId === "new" ? "Add Custom Category" : "Edit Category"}
              </h3>

              {error && (
                <div className="p-2.5 rounded-[12px] bg-rose-50 border border-rose-200 text-rose-700 text-xs font-medium">
                  {error}
                </div>
              )}

              <div>
                <label className="block text-xs font-normal text-[#0D0D0C]/56 mb-1">
                  Name
                </label>
                <input
                  type="text"
                  placeholder="e.g., Gym, Pets, Donations..."
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full px-3.5 py-2 rounded-full bg-[#FFFDFA] border border-[#0D0D0C]/[0.1] text-xs text-[#0D0D0C] focus:outline-none focus:border-[#0D0D0C]"
                  autoFocus
                />
              </div>

              {/* Icon selection */}
              <div>
                <label className="block text-xs font-normal text-[#0D0D0C]/56 mb-1.5">
                  Select Icon
                </label>
                <div className="grid grid-cols-6 sm:grid-cols-8 gap-1.5 max-h-32 overflow-y-auto p-1 bg-[#FFFDFA] rounded-[16px] border border-[#0D0D0C]/[0.06]">
                  {AVAILABLE_ICONS.map((ic) => (
                    <button
                      key={ic}
                      type="button"
                      onClick={() => setIcon(ic)}
                      className={`p-2 rounded-[12px] flex items-center justify-center transition-all ${
                        icon === ic
                          ? "bg-[#0D0D0C] text-[#FFFDFA]"
                          : "text-[#0D0D0C]/60 hover:bg-[#FBF6EF] hover:text-[#0D0D0C]"
                      }`}
                    >
                      <CategoryIcon iconName={ic} className="w-4 h-4 stroke-[1.5]" />
                    </button>
                  ))}
                </div>
              </div>

              {/* Color selection */}
              <div>
                <label className="block text-xs font-normal text-[#0D0D0C]/56 mb-1.5">
                  Accent Color
                </label>
                <div className="flex items-center gap-2 flex-wrap">
                  {AVAILABLE_COLORS.map((c) => (
                    <button
                      key={c}
                      type="button"
                      onClick={() => setColor(c)}
                      className={`w-6 h-6 rounded-full transition-transform ${
                        color === c ? "scale-125 ring-2 ring-[#0D0D0C]" : "hover:scale-110"
                      }`}
                      style={{ backgroundColor: c }}
                    />
                  ))}
                </div>
              </div>

              {/* Actions */}
              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={handleCancelForm}
                  className="px-4 py-1.5 text-xs text-[#0D0D0C]/60 hover:text-[#0D0D0C] rounded-full"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 text-xs font-medium text-[#FFFDFA] bg-[#0D0D0C] hover:bg-[#0D0D0C]/90 rounded-full shadow-sm"
                >
                  Save Category
                </button>
              </div>
            </form>
          ) : (
            <button
              onClick={handleStartAdd}
              className="w-full py-3 rounded-[20px] border border-dashed border-[#0D0D0C]/[0.15] hover:border-[#0D0D0C] hover:bg-[#FBF6EF]/50 text-xs font-medium text-[#0D0D0C]/70 hover:text-[#0D0D0C] flex items-center justify-center gap-2 transition-all"
            >
              <FolderPlus className="w-4 h-4 stroke-[1.5]" />
              <span>+ Create Custom Category</span>
            </button>
          )}

          {/* List of existing categories */}
          <div className="space-y-3">
            <span className="text-xs text-[#0D0D0C]/56 block">
              Active Categories ({categories.length})
            </span>
            <div className="divide-y divide-[#0D0D0C]/[0.05] bg-[#FBF6EF] rounded-[20px] border border-[#0D0D0C]/[0.06] overflow-hidden">
              {categories.map((cat) => (
                <div
                  key={cat.id}
                  className="p-3.5 flex items-center justify-between gap-3 hover:bg-[#FFFDFA]/70 transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <div
                      className="w-8 h-8 rounded-full flex items-center justify-center shrink-0 border border-[#0D0D0C]/[0.08] bg-[#FFFDFA]"
                      style={{ color: cat.color || "#0D0D0C" }}
                    >
                      <CategoryIcon iconName={cat.icon} className="w-4 h-4 stroke-[1.5]" />
                    </div>
                    <div>
                      <span className="text-xs font-medium text-[#0D0D0C] block">
                        {cat.name}
                      </span>
                      {cat.isCustom ? (
                        <span className="text-[10px] text-[#0D0D0C]/56">
                          Custom Category
                        </span>
                      ) : (
                        <span className="text-[10px] text-[#0D0D0C]/42">
                          Standard
                        </span>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => handleStartEdit(cat)}
                      className="p-2 rounded-full hover:bg-[#FBF6EF] text-[#0D0D0C]/60 hover:text-[#0D0D0C] transition-colors"
                      title="Edit Category"
                    >
                      <Edit2 className="w-3.5 h-3.5 stroke-[1.5]" />
                    </button>
                    {cat.isCustom && (
                      <button
                        onClick={() => deleteCategory(cat.id)}
                        className="p-2 rounded-full hover:bg-rose-50 text-[#0D0D0C]/60 hover:text-rose-600 transition-colors"
                        title="Delete Category"
                      >
                        <Trash2 className="w-3.5 h-3.5 stroke-[1.5]" />
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
