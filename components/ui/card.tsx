"use client";

import * as React from "react";
import { motion } from "framer-motion";
import { ArrowUpRight, ArrowDownRight, AlertCircle, Info, CheckCircle2, AlertTriangle } from "lucide-react";
import { cn } from "@/lib/utils";

export interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  hoverable?: boolean;
  gradientBorder?: boolean;
  glass?: boolean;
}

const Card = React.forwardRef<HTMLDivElement, CardProps>(
  ({ className, hoverable = true, gradientBorder = false, glass = true, children, ...props }, ref) => (
    <div
      ref={ref}
      className={cn(
        "relative overflow-hidden rounded-3xl border border-border/70 text-card-foreground transition-all duration-300 ease-out",
        glass ? "bg-card/85 backdrop-blur-xl" : "bg-card",
        hoverable && "hover:-translate-y-1 hover:shadow-2xl hover:border-primary/30 dark:hover:shadow-[0_20px_40px_rgba(0,0,0,0.4)] shadow-[0_8px_30px_rgb(0,0,0,0.04)] dark:shadow-[0_8px_30px_rgb(0,0,0,0.25)]",
        className
      )}
      {...props}
    >
      {/* Top subtle gradient highlight edge */}
      {gradientBorder && (
        <div className="pointer-events-none absolute inset-x-0 top-0 h-[2px] bg-gradient-to-r from-transparent via-primary/60 to-transparent" />
      )}
      {children}
    </div>
  )
);
Card.displayName = "Card";

const CardHeader = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
  ({ className, ...props }, ref) => (
    <div ref={ref} className={cn("flex flex-col space-y-1.5 p-6 sm:p-7 pb-3", className)} {...props} />
  )
);
CardHeader.displayName = "CardHeader";

const CardTitle = React.forwardRef<HTMLParagraphElement, React.HTMLAttributes<HTMLHeadingElement>>(
  ({ className, ...props }, ref) => (
    <h3
      ref={ref}
      className={cn("font-heading text-xl font-bold tracking-tight text-foreground", className)}
      {...props}
    />
  )
);
CardTitle.displayName = "CardTitle";

const CardDescription = React.forwardRef<HTMLParagraphElement, React.HTMLAttributes<HTMLParagraphElement>>(
  ({ className, ...props }, ref) => (
    <p ref={ref} className={cn("text-xs sm:text-sm text-muted-foreground leading-relaxed", className)} {...props} />
  )
);
CardDescription.displayName = "CardDescription";

const CardContent = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
  ({ className, ...props }, ref) => <div ref={ref} className={cn("p-6 sm:p-7 pt-2", className)} {...props} />
);
CardContent.displayName = "CardContent";

const CardFooter = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
  ({ className, ...props }, ref) => (
    <div ref={ref} className={cn("flex items-center p-6 sm:p-7 pt-0", className)} {...props} />
  )
);
CardFooter.displayName = "CardFooter";

// ─── 1. STATISTICS CARD ──────────────────────────────────────────────────────

export interface StatCardProps {
  title: string;
  value: string | number;
  icon?: React.ElementType;
  trend?: {
    value: string | number;
    isPositive?: boolean;
    label?: string;
  };
  subtitle?: string;
  badge?: string;
  variant?: "primary" | "emerald" | "amber" | "rose" | "indigo" | "violet" | "cyan";
  className?: string;
}

const variantStyles: Record<string, { iconBg: string; iconColor: string; borderGlow: string }> = {
  primary: { iconBg: "bg-primary/10", iconColor: "text-primary", borderGlow: "hover:border-primary/40" },
  indigo:  { iconBg: "bg-indigo-500/10 dark:bg-indigo-500/20", iconColor: "text-indigo-600 dark:text-indigo-400", borderGlow: "hover:border-indigo-500/40" },
  emerald: { iconBg: "bg-emerald-500/10 dark:bg-emerald-500/20", iconColor: "text-emerald-600 dark:text-emerald-400", borderGlow: "hover:border-emerald-500/40" },
  amber:   { iconBg: "bg-amber-500/10 dark:bg-amber-500/20", iconColor: "text-amber-600 dark:text-amber-400", borderGlow: "hover:border-amber-500/40" },
  rose:    { iconBg: "bg-rose-500/10 dark:bg-rose-500/20", iconColor: "text-rose-600 dark:text-rose-400", borderGlow: "hover:border-rose-500/40" },
  violet:  { iconBg: "bg-violet-500/10 dark:bg-violet-500/20", iconColor: "text-violet-600 dark:text-violet-400", borderGlow: "hover:border-violet-500/40" },
  cyan:    { iconBg: "bg-cyan-500/10 dark:bg-cyan-500/20", iconColor: "text-cyan-600 dark:text-cyan-400", borderGlow: "hover:border-cyan-500/40" },
};

export function StatCard({
  title,
  value,
  icon: Icon,
  trend,
  subtitle,
  badge,
  variant = "primary",
  className = "",
}: StatCardProps) {
  const styles = variantStyles[variant] || variantStyles.primary;

  return (
    <motion.div
      whileHover={{ y: -4, scale: 1.01 }}
      transition={{ duration: 0.22, ease: "easeOut" }}
      className={`group relative overflow-hidden rounded-3xl border border-border/70 bg-card/85 p-6 backdrop-blur-xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] dark:shadow-[0_8px_30px_rgb(0,0,0,0.25)] transition-all duration-300 ${styles.borderGlow} ${className}`}
    >
      {/* Top ambient glow line */}
      <div className="pointer-events-none absolute inset-x-0 top-0 h-[2px] bg-gradient-to-r from-transparent via-primary/30 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

      <div className="flex items-start justify-between gap-3">
        <div className="space-y-1">
          <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">{title}</p>
          <div className="flex items-baseline gap-2">
            <h3 className="font-heading text-3xl font-extrabold tracking-tight text-foreground">{value}</h3>
            {badge && (
              <span className="rounded-full bg-muted px-2.5 py-0.5 text-[10px] font-semibold text-muted-foreground">
                {badge}
              </span>
            )}
          </div>
        </div>

        {Icon && (
          <div className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl transition-transform duration-300 group-hover:scale-110 ${styles.iconBg} ${styles.iconColor}`}>
            <Icon className="h-6 w-6" />
          </div>
        )}
      </div>

      {/* Footer / Trend row */}
      {(trend || subtitle) && (
        <div className="mt-4 flex items-center gap-2 pt-3 border-t border-border/40 text-xs">
          {trend && (
            <span
              className={`inline-flex items-center gap-0.5 rounded-full px-2 py-0.5 font-bold ${
                trend.isPositive !== false
                  ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400"
                  : "bg-rose-500/10 text-rose-600 dark:text-rose-400"
              }`}
            >
              {trend.isPositive !== false ? (
                <ArrowUpRight className="h-3.5 w-3.5" />
              ) : (
                <ArrowDownRight className="h-3.5 w-3.5" />
              )}
              {trend.value}
            </span>
          )}
          <span className="text-muted-foreground font-medium">
            {trend?.label || subtitle}
          </span>
        </div>
      )}
    </motion.div>
  );
}

// ─── 2. INFO CARD ────────────────────────────────────────────────────────────

export interface InfoCardProps {
  title: string;
  description: string;
  icon?: React.ElementType;
  type?: "info" | "success" | "warning" | "danger" | "accent";
  action?: React.ReactNode;
  badge?: string;
  className?: string;
}

const infoTypeStyles = {
  info:    { border: "border-blue-500/30", bg: "bg-blue-500/5 dark:bg-blue-950/20", icon: Info, iconColor: "text-blue-500" },
  success: { border: "border-emerald-500/30", bg: "bg-emerald-500/5 dark:bg-emerald-950/20", icon: CheckCircle2, iconColor: "text-emerald-500" },
  warning: { border: "border-amber-500/30", bg: "bg-amber-500/5 dark:bg-amber-950/20", icon: AlertTriangle, iconColor: "text-amber-500" },
  danger:  { border: "border-rose-500/30", bg: "bg-rose-500/5 dark:bg-rose-950/20", icon: AlertCircle, iconColor: "text-rose-500" },
  accent:  { border: "border-primary/30", bg: "bg-primary/5 dark:bg-primary/10", icon: Info, iconColor: "text-primary" },
};

export function InfoCard({
  title,
  description,
  icon,
  type = "info",
  action,
  badge,
  className = "",
}: InfoCardProps) {
  const styles = infoTypeStyles[type];
  const IconComponent = icon || styles.icon;

  return (
    <motion.div
      whileHover={{ y: -2 }}
      className={`relative overflow-hidden rounded-3xl border p-6 backdrop-blur-xl shadow-sm transition-all duration-200 ${styles.border} ${styles.bg} ${className}`}
    >
      <div className="flex items-start gap-4">
        <div className={`mt-0.5 flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-background/80 shadow-sm ${styles.iconColor}`}>
          <IconComponent className="h-5 w-5" />
        </div>

        <div className="flex-1 space-y-1">
          <div className="flex items-center justify-between gap-2">
            <h4 className="font-heading text-base font-bold text-foreground">{title}</h4>
            {badge && (
              <span className="rounded-full bg-background px-2.5 py-0.5 text-xs font-medium text-muted-foreground border">
                {badge}
              </span>
            )}
          </div>
          <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed">{description}</p>
          {action && <div className="pt-2">{action}</div>}
        </div>
      </div>
    </motion.div>
  );
}

// ─── 3. DASHBOARD CARD ───────────────────────────────────────────────────────

export interface DashboardCardProps {
  title: string;
  description?: string;
  icon?: React.ElementType;
  action?: React.ReactNode;
  badge?: React.ReactNode;
  children: React.ReactNode;
  className?: string;
  headerClassName?: string;
  contentClassName?: string;
}

export function DashboardCard({
  title,
  description,
  icon: Icon,
  action,
  badge,
  children,
  className = "",
  headerClassName = "",
  contentClassName = "",
}: DashboardCardProps) {
  return (
    <div className={`relative overflow-hidden rounded-3xl border border-border/70 bg-card/85 backdrop-blur-xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] dark:shadow-[0_8px_30px_rgb(0,0,0,0.25)] hover:shadow-xl hover:border-border transition-all duration-300 ${className}`}>
      {/* Subtle top edge line */}
      <div className="pointer-events-none absolute inset-x-0 top-0 h-[2px] bg-gradient-to-r from-transparent via-primary/40 to-transparent" />

      <div className={`flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-6 sm:p-7 pb-4 border-b border-border/40 ${headerClassName}`}>
        <div className="space-y-1">
          <div className="flex items-center gap-2.5">
            {Icon && (
              <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-primary/10 text-primary">
                <Icon className="h-4 w-4" />
              </div>
            )}
            <h3 className="font-heading text-lg sm:text-xl font-bold tracking-tight text-foreground">{title}</h3>
            {badge}
          </div>
          {description && <p className="text-xs sm:text-sm text-muted-foreground">{description}</p>}
        </div>

        {action && <div className="flex items-center gap-2 shrink-0">{action}</div>}
      </div>

      <div className={`p-6 sm:p-7 ${contentClassName}`}>{children}</div>
    </div>
  );
}

export { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter };
