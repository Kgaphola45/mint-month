"use client";

import React, { useState } from "react";
import {
  X,
  Plus,
  Trash2,
  Edit2,
  Palette,
  Check,
  FolderPlus,
} from "lucide-react";
import { useExpenseStore } from "@/store/useExpenseStore";
import { AVAILABLE_ICONS, AVAILABLE_COLORS } from "@/lib/constants";
import { CategoryIcon } from "./category-icon";
import { Category } from "@/types";

interface CategoryManagerModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function CategoryManagerModal({
  isOpen,
  onClose,
}: CategoryManagerModalProps) {
  const { categories, addCategory, updateCategory, deleteCategory } =
    useExpenseStore();

  const [editingCatId, setEditingCatId] = useState<string | null>(null);
  const [name, setName] = useState("");
  const [icon, setIcon] = useState("ShoppingBag");
  const [color, setColor] = useState("#10b981");
  const [error, setError] = useState("");

  if (!isOpen) return null;

  const handleStartAdd = () => {
    setEditingCatId("new");
    setName("");
    setIcon("Tag");
    setColor("#10b981");
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
        className="fixed inset-0 bg-black/60 backdrop-blur-sm"
        onClick={onClose}
      />

      <div className="relative w-full max-w-lg bg-card border border-border/80 rounded-3xl shadow-2xl overflow-hidden z-10 flex flex-col max-h-[85vh]">
        {/* Header */}
        <div className="px-6 py-4 flex items-center justify-between border-b border-border/40 shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-mint-500/10 text-mint-500 flex items-center justify-center">
              <Palette className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-base font-bold text-foreground">
                Manage Categories
              </h2>
              <p className="text-xs text-muted-foreground">
                Customize category icons, colors & create new ones
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-full hover:bg-muted text-muted-foreground hover:text-foreground"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto space-y-4">
          {editingCatId ? (
            /* Category Editor Form */
            <form onSubmit={handleSubmit} className="p-4 rounded-2xl bg-muted/30 border border-border space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                  {editingCatId === "new" ? "Add Category" : "Edit Category"}
                </span>
                {/* Live Preview */}
                <div className="flex items-center gap-2">
                  <span className="text-[11px] text-muted-foreground">Preview:</span>
                  <div
                    className="w-7 h-7 rounded-xl flex items-center justify-center text-white shadow-sm"
                    style={{ backgroundColor: color }}
                  >
                    <CategoryIcon name={icon} className="w-3.5 h-3.5" />
                  </div>
                </div>
              </div>

              {error && (
                <div className="text-xs text-rose-500 font-medium">{error}</div>
              )}

              {/* Name Input */}
              <div>
                <label className="block text-[11px] font-semibold text-muted-foreground mb-1">
                  Category Name
                </label>
                <input
                  type="text"
                  placeholder="e.g. Pet Care, Subscriptions, Fitness"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-card border border-border text-xs text-foreground focus:outline-none focus:border-mint-500"
                  autoFocus
                />
              </div>

              {/* Icon Selector */}
              <div>
                <label className="block text-[11px] font-semibold text-muted-foreground mb-1.5">
                  Select Icon
                </label>
                <div className="grid grid-cols-7 sm:grid-cols-9 gap-1.5 max-h-28 overflow-y-auto p-1 bg-card rounded-xl border border-border">
                  {AVAILABLE_ICONS.map((ic) => (
                    <button
                      key={ic}
                      type="button"
                      onClick={() => setIcon(ic)}
                      className={`p-1.5 rounded-lg flex items-center justify-center transition-all ${
                        icon === ic
                          ? "bg-mint-500 text-white shadow-sm scale-105"
                          : "hover:bg-muted text-muted-foreground"
                      }`}
                    >
                      <CategoryIcon name={ic} className="w-4 h-4" />
                    </button>
                  ))}
                </div>
              </div>

              {/* Color Picker */}
              <div>
                <label className="block text-[11px] font-semibold text-muted-foreground mb-1.5">
                  Select Color
                </label>
                <div className="flex flex-wrap gap-2 p-1.5 bg-card rounded-xl border border-border">
                  {AVAILABLE_COLORS.map((c) => (
                    <button
                      key={c}
                      type="button"
                      onClick={() => setColor(c)}
                      className={`w-6 h-6 rounded-full transition-transform flex items-center justify-center ${
                        color === c ? "scale-110 ring-2 ring-foreground" : "hover:scale-105"
                      }`}
                      style={{ backgroundColor: c }}
                    >
                      {color === c && <Check className="w-3 h-3 text-white stroke-[3]" />}
                    </button>
                  ))}
                </div>
              </div>

              {/* Actions */}
              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={handleCancelForm}
                  className="px-3 py-1.5 text-xs text-muted-foreground hover:bg-muted rounded-xl"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 text-xs font-bold text-white bg-mint-500 hover:bg-mint-600 rounded-xl shadow-glow"
                >
                  Save Category
                </button>
              </div>
            </form>
          ) : (
            <button
              onClick={handleStartAdd}
              className="w-full py-2.5 rounded-2xl border-2 border-dashed border-border hover:border-mint-500/60 hover:bg-mint-500/5 text-xs font-semibold text-muted-foreground hover:text-mint-600 dark:hover:text-mint-400 flex items-center justify-center gap-2 transition-all"
            >
              <FolderPlus className="w-4 h-4" />
              <span>+ Create Custom Category</span>
            </button>
          )}

          {/* List of existing categories */}
          <div className="space-y-2">
            <span className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground block">
              Active Categories ({categories.length})
            </span>
            <div className="divide-y divide-border/40 bg-card rounded-2xl border border-border/60 overflow-hidden">
              {categories.map((cat) => (
                <div
                  key={cat.id}
                  className="p-3 flex items-center justify-between gap-3 hover:bg-muted/30 transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <div
                      className="w-8 h-8 rounded-xl flex items-center justify-center text-white shadow-sm"
                      style={{ backgroundColor: cat.color }}
                    >
                      <CategoryIcon name={cat.icon} className="w-4 h-4" />
                    </div>
                    <div>
                      <span className="text-xs font-bold text-foreground block">
                        {cat.name}
                      </span>
                      {cat.isCustom ? (
                        <span className="text-[10px] text-mint-600 dark:text-mint-400 font-medium">
                          Custom Category
                        </span>
                      ) : (
                        <span className="text-[10px] text-muted-foreground">
                          Default
                        </span>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => handleStartEdit(cat)}
                      className="p-1.5 rounded-xl hover:bg-muted text-muted-foreground hover:text-foreground transition-colors"
                      title="Edit Category"
                    >
                      <Edit2 className="w-3.5 h-3.5" />
                    </button>
                    {cat.isCustom && (
                      <button
                        onClick={() => deleteCategory(cat.id)}
                        className="p-1.5 rounded-xl hover:bg-rose-500/10 text-muted-foreground hover:text-rose-500 transition-colors"
                        title="Delete Category"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
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

