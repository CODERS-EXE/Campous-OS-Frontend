"use client";

import { CheckCircle2, Clock, XCircle, AlertCircle, AlertTriangle, ShieldCheck, HelpCircle } from "lucide-react";

export type StatusType =
  | "active"
  | "approved"
  | "pending"
  | "rejected"
  | "paid"
  | "unpaid"
  | "overdue"
  | "verified"
  | "under_maintenance"
  | "inactive"
  | "completed"
  | "cancelled"
  | string;

interface StatusBadgeProps {
  status: StatusType;
  label?: string;
  showIcon?: boolean;
}

const statusConfig: Record<
  string,
  { bg: string; text: string; border: string; icon: any; defaultLabel: string }
> = {
  active: {
    bg: "bg-emerald-500/15 dark:bg-emerald-500/20",
    text: "text-emerald-700 dark:text-emerald-300",
    border: "border-emerald-500/30",
    icon: CheckCircle2,
    defaultLabel: "Active",
  },
  approved: {
    bg: "bg-emerald-500/15 dark:bg-emerald-500/20",
    text: "text-emerald-700 dark:text-emerald-300",
    border: "border-emerald-500/30",
    icon: CheckCircle2,
    defaultLabel: "Approved",
  },
  verified: {
    bg: "bg-emerald-500/15 dark:bg-emerald-500/20",
    text: "text-emerald-700 dark:text-emerald-300",
    border: "border-emerald-500/30",
    icon: ShieldCheck,
    defaultLabel: "Verified",
  },
  paid: {
    bg: "bg-emerald-500/15 dark:bg-emerald-500/20",
    text: "text-emerald-700 dark:text-emerald-300",
    border: "border-emerald-500/30",
    icon: CheckCircle2,
    defaultLabel: "Paid",
  },
  completed: {
    bg: "bg-emerald-500/15 dark:bg-emerald-500/20",
    text: "text-emerald-700 dark:text-emerald-300",
    border: "border-emerald-500/30",
    icon: CheckCircle2,
    defaultLabel: "Completed",
  },
  pending: {
    bg: "bg-amber-500/15 dark:bg-amber-500/20",
    text: "text-amber-700 dark:text-amber-300",
    border: "border-amber-500/30",
    icon: Clock,
    defaultLabel: "Pending",
  },
  under_maintenance: {
    bg: "bg-amber-500/15 dark:bg-amber-500/20",
    text: "text-amber-700 dark:text-amber-300",
    border: "border-amber-500/30",
    icon: AlertTriangle,
    defaultLabel: "Maintenance",
  },
  unpaid: {
    bg: "bg-amber-500/15 dark:bg-amber-500/20",
    text: "text-amber-700 dark:text-amber-300",
    border: "border-amber-500/30",
    icon: AlertCircle,
    defaultLabel: "Unpaid",
  },
  rejected: {
    bg: "bg-rose-500/15 dark:bg-rose-500/20",
    text: "text-rose-700 dark:text-rose-300",
    border: "border-rose-500/30",
    icon: XCircle,
    defaultLabel: "Rejected",
  },
  overdue: {
    bg: "bg-rose-500/15 dark:bg-rose-500/20",
    text: "text-rose-700 dark:text-rose-300",
    border: "border-rose-500/30",
    icon: AlertCircle,
    defaultLabel: "Overdue",
  },
  cancelled: {
    bg: "bg-rose-500/15 dark:bg-rose-500/20",
    text: "text-rose-700 dark:text-rose-300",
    border: "border-rose-500/30",
    icon: XCircle,
    defaultLabel: "Cancelled",
  },
  inactive: {
    bg: "bg-muted dark:bg-muted/80",
    text: "text-muted-foreground",
    border: "border-border/80",
    icon: Clock,
    defaultLabel: "Inactive",
  },
};

export function StatusBadge({ status, label, showIcon = true }: StatusBadgeProps) {
  const normalizedKey = String(status || "").toLowerCase().replace(/[\s-]/g, "_");
  const config = statusConfig[normalizedKey] || {
    bg: "bg-indigo-500/15 dark:bg-indigo-500/20",
    text: "text-indigo-700 dark:text-indigo-300",
    border: "border-indigo-500/30",
    icon: HelpCircle,
    defaultLabel: status || "Unknown",
  };

  const IconComponent = config.icon;
  const displayLabel = label || config.defaultLabel;

  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-xs font-bold border backdrop-blur-sm shadow-xs ${config.bg} ${config.text} ${config.border}`}
    >
      {showIcon && <IconComponent className="h-3.5 w-3.5 shrink-0" />}
      {displayLabel}
    </span>
  );
}
