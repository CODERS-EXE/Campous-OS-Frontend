"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { Search, X, Building2, User, Bell, File, Loader2 } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { motion, AnimatePresence } from "framer-motion";
import { api } from "@/lib/api";
import { cn } from "@/lib/utils";

interface SearchResult {
  id: string;
  type: "college" | "user" | "notification" | "page";
  title: string;
  subtitle?: string;
  url: string;
  icon?: React.ReactNode;
}

export function GlobalSearch() {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  // Keyboard shortcut: Cmd+K / Ctrl+K
  useEffect(() => {
    const down = (e: KeyboardEvent) => {
      if (e.key === "k" && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        setOpen((prev) => !prev);
      }
      if (e.key === "Escape") {
        setOpen(false);
      }
    };
    document.addEventListener("keydown", down);
    return () => document.removeEventListener("keydown", down);
  }, []);

  // Focus input when opened
  useEffect(() => {
    if (open && inputRef.current) {
      inputRef.current.focus();
    }
  }, [open]);

  // Close on click outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    if (open) {
      document.addEventListener("mousedown", handleClickOutside);
    }
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [open]);

  // Search query
  const { data: results, isLoading } = useQuery<SearchResult[]>({
    queryKey: ["global-search", query],
    queryFn: async () => {
      if (!query || query.length < 2) return [];
      const data = await api.get<SearchResult[]>(`/api/v1/search?q=${encodeURIComponent(query)}`);
      return data;
    },
    enabled: query.length >= 2,
  });

  const handleSelect = (result: SearchResult) => {
    setOpen(false);
    setQuery("");
    router.push(result.url);
  };

  const getIcon = (type: string) => {
    switch (type) {
      case "college":
        return <Building2 className="h-4 w-4 text-blue-500" />;
      case "user":
        return <User className="h-4 w-4 text-green-500" />;
      case "notification":
        return <Bell className="h-4 w-4 text-orange-500" />;
      default:
        return <File className="h-4 w-4 text-gray-500" />;
    }
  };

  return (
    <div className="relative w-full max-w-md" ref={containerRef}>
      {/* Search Input */}
      <div className="relative group">
        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
          <Search className={cn(
            "h-4 w-4 transition-colors",
            open ? "text-primary" : "text-muted-foreground group-focus-within:text-primary"
          )} />
        </div>
        <input
          ref={inputRef}
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onFocus={() => setOpen(true)}
          placeholder="Search anything..."
          className={cn(
            "w-full pl-10 pr-20 py-2 rounded-full transition-all",
            "bg-muted/50 border border-transparent",
            "focus:outline-none focus:bg-background focus:ring-2 focus:ring-primary/50",
            open && "bg-background ring-2 ring-primary/50"
          )}
        />
        <div className="absolute inset-y-0 right-0 pr-3 flex items-center gap-2">
          {query && (
            <button
              onClick={() => setQuery("")}
              className="text-muted-foreground hover:text-foreground transition-colors"
            >
              <X className="h-4 w-4" />
            </button>
          )}
          <kbd className="hidden sm:inline-flex h-5 items-center gap-1 rounded border bg-muted px-1.5 font-mono text-[10px] font-medium text-muted-foreground">
            <span className="text-xs">⌘</span>K
          </kbd>
        </div>
      </div>

      {/* Results Dropdown */}
      <AnimatePresence>
        {open && query.length >= 2 && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.15 }}
            className="absolute top-full mt-2 w-full rounded-xl border bg-card shadow-2xl z-50 overflow-hidden max-h-96"
          >
            {isLoading ? (
              <div className="flex items-center justify-center py-8 text-muted-foreground">
                <Loader2 className="h-5 w-5 animate-spin mr-2" />
                Searching...
              </div>
            ) : results && results.length > 0 ? (
              <div className="py-2 max-h-96 overflow-y-auto custom-scrollbar">
                {results.map((result) => (
                  <button
                    key={result.id}
                    onClick={() => handleSelect(result)}
                    className="w-full flex items-center gap-3 px-4 py-3 hover:bg-muted/50 transition-colors text-left"
                  >
                    <div className="shrink-0">{result.icon || getIcon(result.type)}</div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-foreground truncate">{result.title}</p>
                      {result.subtitle && (
                        <p className="text-xs text-muted-foreground truncate">{result.subtitle}</p>
                      )}
                    </div>
                    <span className="text-xs text-muted-foreground capitalize shrink-0">
                      {result.type}
                    </span>
                  </button>
                ))}
              </div>
            ) : (
              <div className="py-8 text-center text-sm text-muted-foreground">
                No results found for &quot;{query}&quot;
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
