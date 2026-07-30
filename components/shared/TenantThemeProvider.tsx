"use client";

import { useEffect } from "react";
import { useAuthStore } from "@/lib/store/auth";
import { hexToRgb } from "@/lib/utils";

export function TenantThemeProvider({ children }: { children: React.ReactNode }) {
  const college = useAuthStore((s) => s.college);
  const hydrateApi = useAuthStore((s) => s.hydrateApi);

  useEffect(() => {
    hydrateApi();
  }, [hydrateApi]);

  useEffect(() => {
    if (college?.theme_color) {
      document.documentElement.style.setProperty("--tenant-primary", hexToRgb(college.theme_color));
    }
  }, [college?.theme_color]);

  return <>{children}</>;
}
