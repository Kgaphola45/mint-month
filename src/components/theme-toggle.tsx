"use client";

import * as React from "react";
import { Sun } from "lucide-react";

export function ThemeToggle() {
  return (
    <div
      className="p-2 rounded-full text-[#0D0D0C]/40 border border-[#0D0D0C]/[0.08] bg-[#FFFDF8]"
      title="Editorial Theme Active"
    >
      <Sun className="w-3.5 h-3.5 stroke-[1.5]" />
    </div>
  );
}
