"use client";

import { useEffect } from "react";
import Link from "next/link";
import { AlertTriangle, Home, RefreshCw, ShieldAlert } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function GlobalErrorPage({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // Log error to monitoring
    console.error("CampusOS Application Error:", error);
  }, [error]);

  return (
    <div className="min-h-screen w-full flex flex-col items-center justify-center bg-background text-foreground relative overflow-hidden p-6">
      {/* Ambient Red Glow */}
      <div className="absolute top-1/3 left-1/2 -translate-x-1/2 h-96 w-96 rounded-full bg-rose-500/10 blur-[140px] pointer-events-none" />

      <div className="relative z-10 flex flex-col items-center text-center max-w-lg space-y-6">
        {/* Error Badge Icon */}
        <div className="relative flex h-20 w-20 items-center justify-center rounded-3xl bg-rose-500/10 text-rose-500 border border-rose-500/20 shadow-xl">
          <AlertTriangle className="h-10 w-10 animate-bounce" />
        </div>

        {/* Heading */}
        <div className="space-y-2">
          <div className="inline-flex items-center gap-1.5 rounded-full bg-rose-500/10 px-3 py-1 text-xs font-bold text-rose-600 dark:text-rose-400">
            <ShieldAlert className="h-3.5 w-3.5" /> System Exception Captured
          </div>
          <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
            Something Went Unexpectedly Wrong
          </h2>
          <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed max-w-md mx-auto">
            An unforeseen application state occurred. We have isolated the issue to protect your session safety.
          </p>
        </div>

        {/* Error Digest Info */}
        {error?.message && (
          <div className="w-full rounded-2xl border border-border/60 bg-card/60 p-4 text-left font-mono text-xs text-muted-foreground overflow-x-auto max-h-32">
            <p className="font-bold text-destructive mb-1">Trace Error Message:</p>
            <code>{error.message}</code>
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
          <Button
            onClick={() => reset()}
            className="rounded-2xl bg-primary text-primary-foreground font-bold shadow-lg hover:scale-105 active:scale-95 transition-all h-11 px-6"
          >
            <RefreshCw className="mr-2 h-4 w-4" /> Try Again
          </Button>
          <Link href="/login">
            <Button
              variant="outline"
              className="rounded-2xl border-border/80 font-bold hover:bg-muted/80 h-11 px-5"
            >
              <Home className="mr-2 h-4 w-4" /> Return to Dashboard
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
}
