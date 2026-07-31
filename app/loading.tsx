"use client";

import { GraduationCap, Loader2, Sparkles } from "lucide-react";

export default function GlobalLoading() {
  return (
    <div className="min-h-screen w-full flex flex-col items-center justify-center bg-background text-foreground relative overflow-hidden">
      {/* Background Ambient Glows */}
      <div className="absolute -top-40 -left-40 h-96 w-96 rounded-full bg-primary/20 blur-[120px] pointer-events-none" />
      <div className="absolute -bottom-40 -right-40 h-96 w-96 rounded-full bg-purple-500/20 blur-[120px] pointer-events-none" />

      <div className="relative z-10 flex flex-col items-center text-center p-6 space-y-6 max-w-sm">
        {/* Animated CampusOS Logo Container */}
        <div className="relative flex h-24 w-24 items-center justify-center">
          {/* Pulsing Outer Rings */}
          <span className="absolute inline-flex h-full w-full animate-ping rounded-3xl bg-primary/20 opacity-75" />
          <span className="absolute inline-flex h-20 w-20 animate-pulse rounded-3xl bg-purple-500/30 blur-md" />

          {/* Logo Badge */}
          <div className="relative flex h-20 w-20 items-center justify-center rounded-3xl bg-gradient-to-br from-indigo-600 via-purple-600 to-violet-600 text-white shadow-2xl ring-4 ring-background">
            <GraduationCap className="h-10 w-10 animate-bounce" />
          </div>
        </div>

        {/* Brand Text */}
        <div className="space-y-2">
          <h2 className="text-2xl font-extrabold tracking-tight flex items-center justify-center gap-2">
            CampusOS
            <Sparkles className="h-4 w-4 text-amber-400 animate-spin" />
          </h2>
          <div className="flex items-center justify-center gap-2 text-xs font-semibold text-muted-foreground">
            <Loader2 className="h-3.5 w-3.5 animate-spin text-primary" />
            <span>Loading workspace context...</span>
          </div>
        </div>

        {/* Shimmer Bar */}
        <div className="w-48 h-1.5 rounded-full bg-muted/60 overflow-hidden relative shadow-inner">
          <div className="h-full bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 rounded-full animate-pulse w-full" />
        </div>
      </div>
    </div>
  );
}
