"use client";

import { useState, useMemo, ReactNode } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Search,
  X,
  ChevronUp,
  ChevronDown,
  ChevronsUpDown,
  Download,
  Filter,
  ChevronLeft,
  ChevronRight,
  Database,
  FileSpreadsheet,
  RefreshCw,
  Sparkles,
} from "lucide-react";
import toast from "react-hot-toast";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export interface ColumnDef<T> {
  id?: string;
  header: string | ReactNode;
  accessorKey?: keyof T | string;
  cell?: (row: T, index: number) => ReactNode;
  sortable?: boolean;
  className?: string;
}

export interface FilterOption<T> {
  id: string;
  label: string;
  options: { label: string; value: string }[];
  filterFn?: (row: T, value: string) => boolean;
}

interface DataTableProps<T> {
  data: T[];
  columns: ColumnDef<T>[];
  title?: string;
  description?: string;
  searchable?: boolean;
  searchPlaceholder?: string;
  searchFields?: (keyof T | string)[];
  filters?: FilterOption<T>[];
  actions?: ReactNode;
  exportFileName?: string;
  isLoading?: boolean;
  initialPageSize?: number;
  emptyMessage?: string;
  onRowClick?: (row: T) => void;
}

export function DataTable<T extends Record<string, any>>({
  data = [],
  columns = [],
  title,
  description,
  searchable = true,
  searchPlaceholder = "Search records...",
  searchFields,
  filters = [],
  actions,
  exportFileName = "export_data",
  isLoading = false,
  initialPageSize = 10,
  emptyMessage = "No records found matching your criteria.",
  onRowClick,
}: DataTableProps<T>) {
  // State
  const [searchTerm, setSearchTerm] = useState("");
  const [sortColumn, setSortColumn] = useState<string | null>(null);
  const [sortDirection, setSortDirection] = useState<"asc" | "desc">("asc");
  const [activeFilters, setActiveFilters] = useState<Record<string, string>>({});
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(initialPageSize);

  // Helper to extract nested key value
  const getNestedValue = (obj: any, path: string) => {
    if (!path) return undefined;
    return path.split(".").reduce((acc, part) => acc && acc[part], obj);
  };

  // 1. Filtered Data
  const filteredData = useMemo(() => {
    let result = [...data];

    // Global Search Filter
    if (searchTerm.trim()) {
      const query = searchTerm.toLowerCase();
      result = result.filter((row) => {
        if (searchFields && searchFields.length > 0) {
          return searchFields.some((field) => {
            const val = getNestedValue(row, field as string);
            return val !== undefined && val !== null && String(val).toLowerCase().includes(query);
          });
        }
        // Fallback: search across all string/number properties of row
        return Object.values(row).some((val) => {
          if (val === null || val === undefined) return false;
          if (typeof val === "object") {
            return JSON.stringify(val).toLowerCase().includes(query);
          }
          return String(val).toLowerCase().includes(query);
        });
      });
    }

    // Active Dropdown Filters
    Object.entries(activeFilters).forEach(([filterId, filterValue]) => {
      if (!filterValue || filterValue === "ALL") return;
      const filterDef = filters.find((f) => f.id === filterId);
      if (filterDef?.filterFn) {
        result = result.filter((row) => filterDef.filterFn!(row, filterValue));
      } else {
        // Fallback: match row[filterId]
        result = result.filter((row) => {
          const val = getNestedValue(row, filterId);
          return String(val) === filterValue;
        });
      }
    });

    // Sorting
    if (sortColumn) {
      result.sort((a, b) => {
        const valA = getNestedValue(a, sortColumn) ?? "";
        const valB = getNestedValue(b, sortColumn) ?? "";

        if (typeof valA === "number" && typeof valB === "number") {
          return sortDirection === "asc" ? valA - valB : valB - valA;
        }

        const strA = String(valA).toLowerCase();
        const strB = String(valB).toLowerCase();

        if (strA < strB) return sortDirection === "asc" ? -1 : 1;
        if (strA > strB) return sortDirection === "asc" ? 1 : -1;
        return 0;
      });
    }

    return result;
  }, [data, searchTerm, searchFields, activeFilters, filters, sortColumn, sortDirection]);

  // 2. Pagination Calculation
  const totalPages = Math.ceil(filteredData.length / pageSize) || 1;
  const safePage = Math.min(currentPage, totalPages);
  const startIndex = (safePage - 1) * pageSize;
  const paginatedData = useMemo(() => {
    return filteredData.slice(startIndex, startIndex + pageSize);
  }, [filteredData, startIndex, pageSize]);

  // Handle Sort Toggle
  const handleSort = (colKey: string) => {
    if (sortColumn === colKey) {
      if (sortDirection === "asc") {
        setSortDirection("desc");
      } else {
        setSortColumn(null);
        setSortDirection("asc");
      }
    } else {
      setSortColumn(colKey);
      setSortDirection("asc");
    }
  };

  // CSV Export Handler
  const exportToCSV = () => {
    if (filteredData.length === 0) {
      toast.error("No data available to export.");
      return;
    }

    const exportCols = columns.filter((c) => c.accessorKey || c.id);
    const headers = exportCols.map((c) => (typeof c.header === "string" ? c.header : c.id || "Field"));

    const rows = filteredData.map((row) =>
      exportCols.map((c) => {
        const key = (c.accessorKey || c.id) as string;
        const val = getNestedValue(row, key);
        if (val === null || val === undefined) return '""';
        return `"${String(val).replace(/"/g, '""')}"`;
      }).join(",")
    );

    const csvContent = [headers.join(","), ...rows].join("\n");
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.setAttribute("download", `${exportFileName}_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    toast.success(`Exported ${filteredData.length} records to CSV!`);
  };

  const hasActiveFilters = searchTerm.length > 0 || Object.values(activeFilters).some((v) => v && v !== "ALL");

  const clearAllFilters = () => {
    setSearchTerm("");
    setActiveFilters({});
    setSortColumn(null);
    setCurrentPage(1);
  };

  return (
    <div className="space-y-4">
      {/* ── Table Top Toolbar ── */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        {/* Header Titles */}
        {(title || description) && (
          <div className="space-y-0.5">
            {title && (
              <h2 className="text-xl font-bold tracking-tight text-foreground flex items-center gap-2">
                <Database className="h-5 w-5 text-indigo-500" />
                {title}
              </h2>
            )}
            {description && <p className="text-xs text-muted-foreground">{description}</p>}
          </div>
        )}

        {/* Search, Filters, Export & Custom Actions */}
        <div className="flex items-center gap-3 flex-wrap ml-auto w-full md:w-auto">
          {/* Global Search Bar */}
          {searchable && (
            <div className="relative flex-1 md:w-64">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                value={searchTerm}
                onChange={(e) => {
                  setSearchTerm(e.target.value);
                  setCurrentPage(1);
                }}
                placeholder={searchPlaceholder}
                className="pl-9 pr-8 rounded-2xl border-border/80 bg-background/80 focus:bg-background transition-all text-xs"
              />
              {searchTerm && (
                <button
                  onClick={() => setSearchTerm("")}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                >
                  <X className="h-3.5 w-3.5" />
                </button>
              )}
            </div>
          )}

          {/* Filter Dropdowns */}
          {filters.map((f) => (
            <div key={f.id} className="relative">
              <select
                value={activeFilters[f.id] || "ALL"}
                onChange={(e) => {
                  setActiveFilters({ ...activeFilters, [f.id]: e.target.value });
                  setCurrentPage(1);
                }}
                className="rounded-2xl border border-border/80 bg-background/80 text-foreground px-3 py-2 text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-primary shadow-xs cursor-pointer"
              >
                <option value="ALL">All {f.label}</option>
                {f.options.map((opt) => (
                  <option key={opt.value} value={opt.value}>
                    {opt.label}
                  </option>
                ))}
              </select>
            </div>
          ))}

          {/* Clear Filters Button */}
          {hasActiveFilters && (
            <Button
              variant="ghost"
              size="sm"
              onClick={clearAllFilters}
              className="rounded-2xl text-xs text-rose-600 dark:text-rose-400 hover:bg-rose-500/10"
            >
              <X className="mr-1.5 h-3.5 w-3.5" /> Clear Filters
            </Button>
          )}

          {/* Export CSV Button */}
          <Button
            variant="outline"
            size="sm"
            onClick={exportToCSV}
            className="rounded-2xl font-semibold border-border/80 bg-background/80 hover:bg-muted/80 backdrop-blur-sm shadow-xs transition-all text-xs"
          >
            <Download className="mr-1.5 h-3.5 w-3.5 text-indigo-500" /> Export CSV
          </Button>

          {/* Extra Actions */}
          {actions}
        </div>
      </div>

      {/* ── Table Main Container with Glassmorphism ── */}
      <div className="relative overflow-hidden rounded-3xl border border-border/60 bg-card/70 backdrop-blur-xl shadow-xl transition-all">
        <div className="overflow-x-auto max-h-[600px]">
          <table className="w-full text-left text-xs">
            {/* Sticky Table Header */}
            <thead className="sticky top-0 z-10 bg-card/95 backdrop-blur-md border-b border-border/60 text-muted-foreground font-bold uppercase tracking-wider select-none shadow-xs">
              <tr>
                {columns.map((col, idx) => {
                  const colKey = (col.accessorKey || col.id) as string;
                  const isSortable = col.sortable && colKey;
                  const isSorted = sortColumn === colKey;

                  return (
                    <th
                      key={idx}
                      className={`px-5 py-4 ${col.className || ""} ${
                        isSortable ? "cursor-pointer hover:text-foreground transition-colors" : ""
                      }`}
                      onClick={() => isSortable && handleSort(colKey)}
                    >
                      <div className="flex items-center gap-1.5">
                        <span>{col.header}</span>
                        {isSortable && (
                          <span className="shrink-0 text-muted-foreground">
                            {isSorted ? (
                              sortDirection === "asc" ? (
                                <ChevronUp className="h-4 w-4 text-primary" />
                              ) : (
                                <ChevronDown className="h-4 w-4 text-primary" />
                              )
                            ) : (
                              <ChevronsUpDown className="h-3.5 w-3.5 opacity-40 hover:opacity-100" />
                            )}
                          </span>
                        )}
                      </div>
                    </th>
                  );
                })}
              </tr>
            </thead>

            {/* Table Body */}
            <tbody className="divide-y divide-border/40 font-medium">
              {isLoading ? (
                // Skeleton Rows
                Array.from({ length: pageSize > 5 ? 5 : pageSize }).map((_, rIdx) => (
                  <tr key={rIdx} className="animate-pulse">
                    {columns.map((_, cIdx) => (
                      <td key={cIdx} className="px-5 py-4">
                        <div className="h-4 w-24 bg-muted/60 rounded-lg" />
                      </td>
                    ))}
                  </tr>
                ))
              ) : paginatedData.length > 0 ? (
                paginatedData.map((row, rIdx) => (
                  <tr
                    key={rIdx}
                    onClick={() => onRowClick && onRowClick(row)}
                    className={`group transition-colors hover:bg-muted/50 ${
                      onRowClick ? "cursor-pointer" : ""
                    }`}
                  >
                    {columns.map((col, cIdx) => {
                      const colKey = (col.accessorKey || col.id) as string;
                      const cellVal = colKey ? getNestedValue(row, colKey) : undefined;

                      return (
                        <td key={cIdx} className={`px-5 py-4 text-foreground ${col.className || ""}`}>
                          {col.cell ? col.cell(row, startIndex + rIdx) : cellVal !== undefined ? String(cellVal) : "—"}
                        </td>
                      );
                    })}
                  </tr>
                ))
              ) : (
                // Empty State
                <tr>
                  <td colSpan={columns.length} className="px-5 py-12 text-center text-muted-foreground">
                    <div className="flex flex-col items-center justify-center space-y-3">
                      <div className="h-12 w-12 rounded-2xl bg-muted/50 flex items-center justify-center text-muted-foreground">
                        <Database className="h-6 w-6" />
                      </div>
                      <p className="font-semibold text-sm">{emptyMessage}</p>
                      {hasActiveFilters && (
                        <Button variant="outline" size="sm" onClick={clearAllFilters} className="rounded-2xl text-xs">
                          Reset Search & Filters
                        </Button>
                      )}
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* ── Table Footer Pagination ── */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 border-t border-border/60 bg-card/40 backdrop-blur-md text-xs text-muted-foreground">
          {/* Record Count Info */}
          <div>
            Showing{" "}
            <span className="font-bold text-foreground">
              {filteredData.length > 0 ? startIndex + 1 : 0}
            </span>{" "}
            to{" "}
            <span className="font-bold text-foreground">
              {Math.min(startIndex + pageSize, filteredData.length)}
            </span>{" "}
            of <span className="font-bold text-foreground">{filteredData.length}</span> entries
          </div>

          {/* Rows Per Page + Page Controls */}
          <div className="flex items-center gap-4 flex-wrap ml-auto">
            {/* Rows Per Page Dropdown */}
            <div className="flex items-center gap-2">
              <span>Rows per page:</span>
              <select
                value={pageSize}
                onChange={(e) => {
                  setPageSize(Number(e.target.value));
                  setCurrentPage(1);
                }}
                className="rounded-xl border border-border/80 bg-background text-foreground px-2 py-1 text-xs font-semibold focus:outline-none"
              >
                {[5, 10, 25, 50, 100].map((size) => (
                  <option key={size} value={size}>
                    {size}
                  </option>
                ))}
              </select>
            </div>

            {/* Page Buttons */}
            <div className="flex items-center gap-1">
              <Button
                variant="ghost"
                size="icon"
                disabled={safePage <= 1}
                onClick={() => setCurrentPage((p) => Math.max(p - 1, 1))}
                className="h-8 w-8 rounded-xl"
              >
                <ChevronLeft className="h-4 w-4" />
              </Button>

              <span className="px-2 font-bold text-foreground">
                Page {safePage} of {totalPages}
              </span>

              <Button
                variant="ghost"
                size="icon"
                disabled={safePage >= totalPages}
                onClick={() => setCurrentPage((p) => Math.min(p + 1, totalPages))}
                className="h-8 w-8 rounded-xl"
              >
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
