"use client";

import { ReactNode } from "react";
import { motion } from "framer-motion";
import {
  Building2,
  CheckCircle2,
  Edit3,
  Key,
  Camera,
  LucideIcon,
} from "lucide-react";
import { Button } from "@/components/ui/button";

export interface ProfileBadge {
  label: string;
  icon?: LucideIcon;
  variant?: "indigo" | "emerald" | "amber" | "blue" | "purple" | "teal" | "rose" | "slate";
}

export type ProfileRoleTheme =
  | "student"
  | "faculty"
  | "parent"
  | "warden"
  | "college_admin"
  | "super_admin";

interface ProfileHeaderProps {
  name?: string;
  email?: string;
  roleTitle?: string;
  roleTheme?: ProfileRoleTheme;
  statusText?: string;
  badges?: ProfileBadge[];
  initials?: string;
  avatarUrl?: string;
  onEditProfile?: () => void;
  onChangePassword?: () => void;
  onAvatarClick?: () => void;
  extraActions?: ReactNode;
}

const themeStyles: Record<
  ProfileRoleTheme,
  {
    coverGradient: string;
    avatarBg: string;
    badgeBg: string;
    badgeText: string;
    badgeBorder: string;
    accentBtn: string;
    orb1: string;
    orb2: string;
  }
> = {
  student: {
    coverGradient: "from-indigo-600 via-purple-600 to-pink-600",
    avatarBg: "from-indigo-500 to-purple-700",
    badgeBg: "bg-indigo-500/10 dark:bg-indigo-500/20",
    badgeText: "text-indigo-600 dark:text-indigo-400",
    badgeBorder: "border-indigo-500/20 dark:border-indigo-500/30",
    accentBtn: "bg-indigo-600 hover:bg-indigo-500 text-white shadow-indigo-500/25",
    orb1: "bg-indigo-400/20",
    orb2: "bg-pink-400/20",
  },
  faculty: {
    coverGradient: "from-emerald-600 via-teal-600 to-cyan-600",
    avatarBg: "from-emerald-500 to-teal-700",
    badgeBg: "bg-emerald-500/10 dark:bg-emerald-500/20",
    badgeText: "text-emerald-600 dark:text-emerald-400",
    badgeBorder: "border-emerald-500/20 dark:border-emerald-500/30",
    accentBtn: "bg-emerald-600 hover:bg-emerald-500 text-white shadow-emerald-500/25",
    orb1: "bg-emerald-400/20",
    orb2: "bg-teal-400/20",
  },
  parent: {
    coverGradient: "from-blue-600 via-indigo-600 to-violet-600",
    avatarBg: "from-blue-500 to-indigo-700",
    badgeBg: "bg-blue-500/10 dark:bg-blue-500/20",
    badgeText: "text-blue-600 dark:text-blue-400",
    badgeBorder: "border-blue-500/20 dark:border-blue-500/30",
    accentBtn: "bg-blue-600 hover:bg-blue-500 text-white shadow-blue-500/25",
    orb1: "bg-blue-400/20",
    orb2: "bg-violet-400/20",
  },
  warden: {
    coverGradient: "from-amber-600 via-orange-600 to-rose-600",
    avatarBg: "from-amber-500 to-rose-700",
    badgeBg: "bg-amber-500/10 dark:bg-amber-500/20",
    badgeText: "text-amber-600 dark:text-amber-400",
    badgeBorder: "border-amber-500/20 dark:border-amber-500/30",
    accentBtn: "bg-amber-600 hover:bg-amber-500 text-white shadow-amber-500/25",
    orb1: "bg-amber-400/20",
    orb2: "bg-rose-400/20",
  },
  college_admin: {
    coverGradient: "from-indigo-800 via-purple-800 to-slate-900",
    avatarBg: "from-indigo-600 to-slate-800",
    badgeBg: "bg-indigo-500/10 dark:bg-indigo-500/20",
    badgeText: "text-indigo-600 dark:text-indigo-300",
    badgeBorder: "border-indigo-500/20 dark:border-indigo-500/30",
    accentBtn: "bg-indigo-600 hover:bg-indigo-500 text-white shadow-indigo-500/25",
    orb1: "bg-indigo-500/20",
    orb2: "bg-purple-500/20",
  },
  super_admin: {
    coverGradient: "from-slate-950 via-purple-950 to-indigo-950",
    avatarBg: "from-purple-700 to-indigo-900",
    badgeBg: "bg-purple-500/10 dark:bg-purple-500/20",
    badgeText: "text-purple-600 dark:text-purple-300",
    badgeBorder: "border-purple-500/20 dark:border-purple-500/30",
    accentBtn: "bg-purple-600 hover:bg-purple-500 text-white shadow-purple-500/25",
    orb1: "bg-purple-500/20",
    orb2: "bg-indigo-500/20",
  },
};

export function ProfileHeader({
  name = "User Name",
  email = "user@campusos.com",
  roleTitle = "Member",
  roleTheme = "student",
  statusText = "Online",
  badges = [],
  initials = "US",
  avatarUrl,
  onEditProfile,
  onChangePassword,
  onAvatarClick,
  extraActions,
}: ProfileHeaderProps) {
  const theme = themeStyles[roleTheme] || themeStyles.student;

  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, ease: "easeOut" }}
      className="relative overflow-hidden rounded-3xl border border-border/60 bg-card/70 backdrop-blur-xl shadow-xl transition-all"
    >
      {/* ── Cover Banner ── */}
      <div className={`h-48 sm:h-56 md:h-64 w-full bg-gradient-to-r ${theme.coverGradient} relative overflow-hidden`}>
        {/* Animated Light Orbs & Mesh */}
        <div className={`absolute -right-12 -top-12 h-72 w-72 rounded-full ${theme.orb1} blur-3xl pointer-events-none animate-pulse`} />
        <div className={`absolute left-1/4 -bottom-12 h-56 w-56 rounded-full ${theme.orb2} blur-2xl pointer-events-none`} />
        <div className="absolute inset-0 bg-[radial-gradient(#rgba(255,255,255,0.1)_1px,transparent_1px)] [background-size:16px_16px] opacity-25 pointer-events-none" />

        {/* Subtle Decorative Badge Overlay */}
        <div className="absolute top-4 right-4 sm:top-6 sm:right-6 flex items-center gap-2">
          <span className="inline-flex items-center gap-1.5 rounded-full bg-black/30 backdrop-blur-md px-3.5 py-1 text-xs font-semibold text-white/90 border border-white/10 shadow-sm">
            <span className="h-2 w-2 rounded-full bg-emerald-400 animate-ping" />
            CampusOS Verified Profile
          </span>
        </div>
      </div>

      {/* ── Header Main Content ── */}
      <div className="px-6 sm:px-8 pb-6 pt-0 relative flex flex-col md:flex-row md:items-end justify-between gap-6 -mt-20 sm:-mt-24">
        {/* Avatar + Basic Details */}
        <div className="flex flex-col sm:flex-row sm:items-end gap-5">
          {/* Large Avatar Container */}
          <div className="relative group shrink-0">
            <div
              onClick={onAvatarClick}
              className={`h-32 w-32 sm:h-36 sm:w-36 rounded-3xl bg-gradient-to-br ${theme.avatarBg} text-white flex items-center justify-center font-extrabold text-4xl sm:text-5xl shadow-2xl ring-4 ring-background border-2 border-white/20 transition-transform duration-300 group-hover:scale-105 cursor-pointer relative overflow-hidden`}
            >
              {avatarUrl ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={avatarUrl} alt={name} className="h-full w-full object-cover" />
              ) : (
                <span>{initials}</span>
              )}

              {/* Hover overlay hint */}
              <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center text-white text-xs font-semibold gap-1 backdrop-blur-xs">
                <Camera className="h-5 w-5" />
              </div>
            </div>

            {/* Live Online Status Pill Dot */}
            <span className="absolute bottom-2 right-2 flex h-6 w-6">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
              <span className="relative inline-flex rounded-full h-6 w-6 bg-emerald-500 ring-4 ring-background border border-white/30" />
            </span>
          </div>

          {/* User Information & Badges */}
          <div className="space-y-1.5 sm:pb-1">
            <div className="flex items-center gap-3 flex-wrap">
              <h1 className="text-2xl sm:text-3xl md:text-4xl font-extrabold tracking-tight text-foreground">
                {name}
              </h1>
              <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-500/15 px-3 py-0.5 text-xs font-bold text-emerald-600 dark:text-emerald-400 border border-emerald-500/30 backdrop-blur-sm">
                <CheckCircle2 className="h-3.5 w-3.5" /> {statusText}
              </span>
            </div>
            <p className="text-sm sm:text-base font-medium text-muted-foreground">{email}</p>

            {/* Badges Bar */}
            <div className="flex items-center gap-2 pt-2.5 flex-wrap">
              {/* Primary Role Badge */}
              <span className={`inline-flex items-center gap-1.5 rounded-xl ${theme.badgeBg} ${theme.badgeText} ${theme.badgeBorder} px-3 py-1 text-xs font-bold border backdrop-blur-sm shadow-xs`}>
                <Building2 className="h-3.5 w-3.5" /> {roleTitle}
              </span>

              {/* Dynamic Additional Badges */}
              {badges.map((badge, idx) => {
                const IconComponent = badge.icon || Building2;
                return (
                  <span
                    key={idx}
                    className="inline-flex items-center gap-1.5 rounded-xl bg-muted/60 text-foreground border border-border/80 px-3 py-1 text-xs font-semibold backdrop-blur-sm shadow-xs"
                  >
                    <IconComponent className="h-3.5 w-3.5 text-muted-foreground" />
                    {badge.label}
                  </span>
                );
              })}
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-3 shrink-0 sm:self-end flex-wrap sm:flex-nowrap">
          {onEditProfile && (
            <Button
              variant="outline"
              className="rounded-2xl font-semibold border-border/80 bg-background/80 hover:bg-muted/80 backdrop-blur-sm shadow-sm transition-all hover:scale-105 active:scale-95"
              onClick={onEditProfile}
            >
              <Edit3 className="mr-2 h-4 w-4 text-primary" /> Edit Profile
            </Button>
          )}

          {onChangePassword && (
            <Button
              className={`rounded-2xl font-semibold shadow-md transition-all hover:scale-105 active:scale-95 ${theme.accentBtn}`}
              onClick={onChangePassword}
            >
              <Key className="mr-2 h-4 w-4" /> Password
            </Button>
          )}

          {extraActions}
        </div>
      </div>
    </motion.div>
  );
}
