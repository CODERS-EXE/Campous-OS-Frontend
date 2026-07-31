"use client";

import { motion } from "framer-motion";
import { LucideIcon } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";

interface ProfileStatCardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  icon: LucideIcon;
  variant?: "indigo" | "emerald" | "amber" | "purple" | "rose" | "blue" | "teal";
}

const variantStyles: Record<
  string,
  { iconBg: string; iconText: string; valueText?: string }
> = {
  indigo: {
    iconBg: "bg-indigo-500/10 dark:bg-indigo-500/20",
    iconText: "text-indigo-600 dark:text-indigo-400",
  },
  emerald: {
    iconBg: "bg-emerald-500/10 dark:bg-emerald-500/20",
    iconText: "text-emerald-600 dark:text-emerald-400",
    valueText: "text-emerald-600 dark:text-emerald-400",
  },
  amber: {
    iconBg: "bg-amber-500/10 dark:bg-amber-500/20",
    iconText: "text-amber-600 dark:text-amber-400",
  },
  purple: {
    iconBg: "bg-purple-500/10 dark:bg-purple-500/20",
    iconText: "text-purple-600 dark:text-purple-400",
  },
  rose: {
    iconBg: "bg-rose-500/10 dark:bg-rose-500/20",
    iconText: "text-rose-600 dark:text-rose-400",
  },
  blue: {
    iconBg: "bg-blue-500/10 dark:bg-blue-500/20",
    iconText: "text-blue-600 dark:text-blue-400",
  },
  teal: {
    iconBg: "bg-teal-500/10 dark:bg-teal-500/20",
    iconText: "text-teal-600 dark:text-teal-400",
  },
};

export function ProfileStatCard({
  title,
  value,
  subtitle,
  icon: Icon,
  variant = "indigo",
}: ProfileStatCardProps) {
  const style = variantStyles[variant] || variantStyles.indigo;

  return (
    <motion.div
      whileHover={{ y: -4, scale: 1.01 }}
      transition={{ duration: 0.2 }}
    >
      <Card className="border-border/60 bg-card/60 backdrop-blur-md shadow-sm hover:shadow-md transition-all">
        <CardContent className="p-5">
          <div className="flex items-center justify-between">
            <div className="space-y-1">
              <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                {title}
              </p>
              <h3 className={`text-2xl font-extrabold tracking-tight ${style.valueText || "text-foreground"}`}>
                {value}
              </h3>
              {subtitle && (
                <p className="text-xs text-muted-foreground font-medium">
                  {subtitle}
                </p>
              )}
            </div>
            <div className={`h-12 w-12 rounded-2xl ${style.iconBg} ${style.iconText} flex items-center justify-center shrink-0 shadow-xs`}>
              <Icon className="h-6 w-6" />
            </div>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}
