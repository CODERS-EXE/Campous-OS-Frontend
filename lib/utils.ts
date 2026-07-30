import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function hexToRgb(hex: string): string {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  if (!result) return "37 99 235";
  return `${parseInt(result[1], 16)} ${parseInt(result[2], 16)} ${parseInt(result[3], 16)}`;
}

export function getRoleDashboardPath(role: string): string {
  const map: Record<string, string> = {
    super_admin: "/super-admin/dashboard",
    college_admin: "/college-admin/dashboard",
    faculty: "/faculty/dashboard",
    student: "/student/dashboard",
    parent: "/parent/dashboard",
    warden: "/warden/dashboard",
  };
  return map[role] || "/login";
}

export function formatDate(date: string | Date): string {
  return new Intl.DateTimeFormat("en-IN", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(new Date(date));
}
