"use client";

import Link from "next/link";
import { ArrowLeft, Compass, GraduationCap, Home, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function NotFoundPage() {
  return (
    <div className="min-h-screen w-full flex flex-col items-center justify-center bg-background text-foreground relative overflow-hidden p-6">
      {/* Background Ambient Blur Orbs */}
      <div className="absolute top-1/4 -left-32 h-96 w-96 rounded-full bg-indigo-500/15 blur-[120px] pointer-events-none" />
      <div className="absolute bottom-1/4 -right-32 h-96 w-96 rounded-full bg-purple-500/15 blur-[120px] pointer-events-none" />

      <div className="relative z-10 flex flex-col items-center text-center max-w-lg space-y-6">
        {/* Brand Header Badge */}
        <div className="inline-flex items-center gap-2 rounded-full border border-primary/30 bg-primary/10 px-4 py-1.5 text-xs font-bold text-primary backdrop-blur-md">
          <GraduationCap className="h-4 w-4" /> CampusOS Navigation System
        </div>

        {/* 404 Visual Heading */}
        <div className="relative select-none">
          <h1 className="text-8xl sm:text-9xl font-black tracking-widest bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 bg-clip-text text-transparent opacity-90 drop-shadow-2xl">
            404
          </h1>
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 flex h-20 w-20 items-center justify-center rounded-3xl bg-card/80 border border-border/80 shadow-2xl backdrop-blur-xl">
            <Compass className="h-10 w-10 text-primary animate-pulse" />
          </div>
        </div>

        {/* Descriptive Copy */}
        <div className="space-y-2">
          <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
            Page Lost in Campus Space
          </h2>
          <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed max-w-md mx-auto">
            The page or resource you are searching for might have been moved, renamed, or is temporarily unavailable. Let&apos;s get you back on track!
          </p>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
          <Link href="/login">
            <Button className="rounded-2xl bg-primary text-primary-foreground font-bold shadow-lg hover:scale-105 active:scale-95 transition-all h-11 px-6">
              <Home className="mr-2 h-4 w-4" /> Return to Campus Dashboard
            </Button>
          </Link>
          <Button
            variant="outline"
            onClick={() => window.history.back()}
            className="rounded-2xl border-border/80 font-bold hover:bg-muted/80 h-11 px-5"
          >
            <ArrowLeft className="mr-2 h-4 w-4" /> Go Back
          </Button>
        </div>
      </div>
    </div>
  );
}
