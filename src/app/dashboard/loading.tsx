import React from "react";

export default function DashboardLoading() {
  return (
    <div className="min-h-[80vh] w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8 animate-pulse bg-[#FBF6EF]">
      {/* Editorial Hero Skeleton */}
      <div className="h-44 w-full bg-[#FFFDFA] border border-[#0D0D0C]/[0.06] rounded-[32px] p-8 space-y-4">
        <div className="w-32 h-5 bg-[#0D0D0C]/10 rounded-full" />
        <div className="w-72 h-10 bg-[#0D0D0C]/10 rounded-full" />
      </div>

      {/* 4 Cards Skeleton */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[1, 2, 3, 4].map((i) => (
          <div
            key={i}
            className="h-32 bg-[#FFFDFA] border border-[#0D0D0C]/[0.06] rounded-[24px] p-5 space-y-3"
          >
            <div className="w-20 h-4 bg-[#0D0D0C]/10 rounded-full" />
            <div className="w-28 h-7 bg-[#0D0D0C]/10 rounded-full" />
          </div>
        ))}
      </div>

      {/* Chart Grid Skeleton */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="h-80 bg-[#FFFDFA] border border-[#0D0D0C]/[0.06] rounded-[28px]" />
        <div className="h-80 bg-[#FFFDFA] border border-[#0D0D0C]/[0.06] rounded-[28px]" />
      </div>
    </div>
  );
}

