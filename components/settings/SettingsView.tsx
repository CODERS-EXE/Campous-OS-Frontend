"use client";

import { useState, useEffect } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { motion, AnimatePresence } from "framer-motion";
import {
  User,
  Lock,
  Bell,
  Paintbrush,
  Globe,
  Eye,
  Smartphone,
  Sparkles,
  Accessibility,
  Save,
  Shield,
  Check,
  Laptop,
  Key,
  RefreshCw,
  Moon,
  Sun,
  Sliders,
  CheckCircle2,
  AlertCircle,
  LogOut,
  SmartphoneNfc,
  Languages,
  EyeOff,
  Mail,
  FileText,
} from "lucide-react";
import { FormField, PasswordField, FormTextarea, SubmitButton } from "@/components/shared/forms";
import toast from "react-hot-toast";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { api } from "@/lib/api";
import { useAuthStore } from "@/lib/store/auth";

export type SettingsTab =
  | "profile"
  | "security"
  | "notifications"
  | "appearance"
  | "language"
  | "privacy"
  | "sessions"
  | "theme"
  | "accessibility";

interface SettingsViewProps {
  allowedRoles: string[];
  roleTitle?: string;
}

const tabItems: { id: SettingsTab; label: string; icon: any; description: string }[] = [
  { id: "profile", label: "Profile", icon: User, description: "Personal details & info" },
  { id: "security", label: "Security", icon: Lock, description: "Passwords & 2FA" },
  { id: "notifications", label: "Notifications", icon: Bell, description: "Alerts & preferences" },
  { id: "appearance", label: "Appearance", icon: Paintbrush, description: "Theme & layout style" },
  { id: "language", label: "Language", icon: Globe, description: "Locales & regional" },
  { id: "privacy", label: "Privacy", icon: Eye, description: "Visibility & data rules" },
  { id: "sessions", label: "Sessions", icon: Smartphone, description: "Active logged-in devices" },
  { id: "theme", label: "Theme", icon: Sparkles, description: "Accents & UI mode" },
  { id: "accessibility", label: "Accessibility", icon: Accessibility, description: "High contrast & font scaling" },
];

export function SettingsView({ allowedRoles, roleTitle = "User Settings" }: SettingsViewProps) {
  const { user } = useAuthStore();
  const queryClient = useQueryClient();
  const [activeTab, setActiveTab] = useState<SettingsTab>("profile");

  // Profile Form State
  const [profileForm, setProfileForm] = useState({
    name: user?.name || "",
    email: user?.email || "",
    phone: "",
    bio: "CampusOS Active Member",
  });

  // Password State
  const [passwordForm, setPasswordForm] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);

  // Local Settings Preferences
  const [notifications, setNotifications] = useState({
    emailAlerts: true,
    pushAlerts: true,
    smsAlerts: false,
    academicAlerts: true,
    financialAlerts: true,
    securityAlerts: true,
  });

  const [appearance, setAppearance] = useState({
    themeMode: "system", // 'light' | 'dark' | 'system'
    accentColor: "indigo", // 'indigo' | 'emerald' | 'amber' | 'rose' | 'purple'
    density: "comfortable", // 'comfortable' | 'compact'
    glassmorphism: true,
  });

  const [language, setLanguage] = useState({
    lang: "en-US",
    dateFormat: "DD/MM/YYYY",
    timezone: "UTC+05:30 (India Standard Time)",
  });

  const [privacy, setPrivacy] = useState({
    profileVisibility: "campus", // 'public' | 'campus' | 'private'
    showOnlineStatus: true,
    dataSharing: false,
  });

  const [accessibility, setAccessibility] = useState({
    highContrast: false,
    fontScale: "normal", // 'normal' | 'large' | 'xl'
    dyslexiaFont: false,
    reducedMotion: false,
  });

  // Active Sessions Mock Data
  const [sessions, setSessions] = useState([
    {
      id: "sess-1",
      device: "Windows PC - Chrome Browser",
      location: "India • Active Now",
      ip: "192.168.1.42",
      current: true,
      icon: Laptop,
    },
    {
      id: "sess-2",
      device: "CampusOS Mobile App - Android",
      location: "India • 2 hours ago",
      ip: "10.0.0.18",
      current: false,
      icon: SmartphoneNfc,
    },
  ]);

  // Keep profileForm in sync with loaded user state
  useEffect(() => {
    if (user) {
      setProfileForm((prev) => ({
        ...prev,
        name: user.name || prev.name,
        email: user.email || prev.email,
      }));
    }
  }, [user]);

  // Mutations
  const updateProfileMutation = useMutation({
    mutationFn: (data: { name?: string; email?: string }) =>
      api.patch("/api/v1/users/me", data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["user"] });
      toast.success("Profile updated successfully!");
    },
    onError: (error) => {
      toast.error(error instanceof Error ? error.message : "Failed to update profile");
    },
  });

  const changePasswordMutation = useMutation({
    mutationFn: (data: { password: string }) => api.patch("/api/v1/users/me", data),
    onSuccess: () => {
      setPasswordForm({ currentPassword: "", newPassword: "", confirmPassword: "" });
      toast.success("Password changed successfully!");
    },
    onError: (error) => {
      toast.error(error instanceof Error ? error.message : "Failed to change password");
    },
  });

  const handleUpdateProfile = (e: React.FormEvent) => {
    e.preventDefault();
    const updates: { name?: string; email?: string } = {};
    if (profileForm.name !== user?.name) updates.name = profileForm.name;
    if (profileForm.email !== user?.email) updates.email = profileForm.email;

    if (Object.keys(updates).length === 0) {
      toast.error("No profile changes to save.");
      return;
    }

    updateProfileMutation.mutate(updates);
  };

  const handleChangePassword = (e: React.FormEvent) => {
    e.preventDefault();
    if (!passwordForm.newPassword || passwordForm.newPassword.length < 8) {
      toast.error("Password must be at least 8 characters long.");
      return;
    }
    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      toast.error("Passwords do not match.");
      return;
    }

    changePasswordMutation.mutate({ password: passwordForm.newPassword });
  };

  const revokeSession = (id: string) => {
    setSessions(sessions.filter((s) => s.id !== id));
    toast.success("Session revoked successfully.");
  };

  return (
    <div className="space-y-8 pb-12">
      {/* ── Settings Header Banner ── */}
      <div className="relative overflow-hidden rounded-3xl border border-border/60 bg-gradient-to-r from-indigo-900/40 via-purple-900/30 to-background p-6 sm:p-8 backdrop-blur-xl shadow-xl">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="space-y-1">
            <span className="inline-flex items-center gap-1.5 rounded-full bg-primary/10 px-3 py-1 text-xs font-bold text-primary border border-primary/20">
              <Sliders className="h-3.5 w-3.5" /> CampusOS Control Center
            </span>
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-foreground">
              Account & Application Settings
            </h1>
            <p className="text-sm text-muted-foreground">
              Manage your profile preferences, security, appearance, and accessibility options
            </p>
          </div>
        </div>
      </div>

      {/* ── Main Settings Grid with Tabs ── */}
      <div className="grid gap-8 lg:grid-cols-12">
        {/* Left Col: Navigation Tabs Sidebar */}
        <div className="lg:col-span-4 xl:col-span-3 space-y-2">
          <div className="sticky top-6 rounded-3xl border border-border/60 bg-card/70 p-3 backdrop-blur-xl shadow-lg space-y-1 overflow-x-auto lg:overflow-x-visible flex lg:flex-col gap-1">
            {tabItems.map((tab) => {
              const Icon = tab.icon;
              const isActive = activeTab === tab.id;

              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`relative flex items-center gap-3 w-full rounded-2xl px-4 py-3 text-left transition-all shrink-0 lg:shrink ${
                    isActive
                      ? "bg-primary text-primary-foreground font-bold shadow-md"
                      : "text-muted-foreground hover:bg-muted/60 hover:text-foreground font-medium"
                  }`}
                >
                  <Icon className={`h-5 w-5 shrink-0 ${isActive ? "text-primary-foreground" : "text-primary"}`} />
                  <div className="hidden lg:block overflow-hidden">
                    <p className="text-sm leading-none">{tab.label}</p>
                    <p className={`text-[11px] mt-1 truncate ${isActive ? "text-primary-foreground/80" : "text-muted-foreground"}`}>
                      {tab.description}
                    </p>
                  </div>
                  <span className="lg:hidden text-xs font-semibold">{tab.label}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Right Col: Active Section Content */}
        <div className="lg:col-span-8 xl:col-span-9">
          <AnimatePresence mode="wait">
            <motion.div
              key={activeTab}
              initial={{ opacity: 0, x: 15 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -15 }}
              transition={{ duration: 0.25 }}
              className="space-y-6"
            >
              {/* ── 1. PROFILE SECTION ── */}
              {activeTab === "profile" && (
                <Card className="border-border/60 bg-card/70 backdrop-blur-xl shadow-lg rounded-3xl">
                  <CardHeader>
                    <CardTitle className="text-xl font-bold flex items-center gap-2">
                      <User className="h-5 w-5 text-indigo-500" /> Personal Profile Settings
                    </CardTitle>
                    <CardDescription>Update your personal information & account identity</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    <form onSubmit={handleUpdateProfile} className="space-y-5">
                      <div className="grid gap-4 sm:grid-cols-2">
                        <FormField
                          id="name"
                          label="Full Display Name"
                          value={profileForm.name}
                          onChange={(val) => setProfileForm({ ...profileForm, name: val })}
                          placeholder="Enter your full name"
                          icon={User}
                        />

                        <FormField
                          id="email"
                          label="Email Address"
                          type="email"
                          value={profileForm.email}
                          onChange={(val) => setProfileForm({ ...profileForm, email: val })}
                          placeholder="Enter your email"
                          icon={Mail}
                        />
                      </div>

                      <FormTextarea
                        id="bio"
                        label="Profile Bio"
                        value={profileForm.bio}
                        onChange={(val) => setProfileForm({ ...profileForm, bio: val })}
                        placeholder="Short bio or motto"
                        icon={FileText}
                        rows={3}
                      />

                      <div className="flex justify-end pt-2">
                        <SubmitButton
                          type="submit"
                          isLoading={updateProfileMutation.status === "pending"}
                          loadingText="Saving..."
                          successText="Profile Saved!"
                        >
                          <Save className="mr-2 h-4 w-4" /> Save Profile Changes
                        </SubmitButton>
                      </div>
                    </form>
                  </CardContent>
                </Card>
              )}

              {/* ── 2. SECURITY SECTION ── */}
              {activeTab === "security" && (
                <div className="space-y-6">
                  <Card className="border-border/60 bg-card/70 backdrop-blur-xl shadow-lg rounded-3xl">
                    <CardHeader>
                      <CardTitle className="text-xl font-bold flex items-center gap-2">
                        <Lock className="h-5 w-5 text-indigo-500" /> Password & Authentication
                      </CardTitle>
                      <CardDescription>Update your password to keep your account protected</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <form onSubmit={handleChangePassword} className="space-y-5">
                        <div className="space-y-4 max-w-md">
                          <PasswordField
                            id="newPassword"
                            label="New Password"
                            value={passwordForm.newPassword}
                            onChange={(val) => setPasswordForm({ ...passwordForm, newPassword: val })}
                            placeholder="Enter new password (min. 8 chars)"
                            showStrength={true}
                          />

                          <PasswordField
                            id="confirmPassword"
                            label="Confirm New Password"
                            value={passwordForm.confirmPassword}
                            onChange={(val) => setPasswordForm({ ...passwordForm, confirmPassword: val })}
                            placeholder="Confirm new password"
                            error={
                              passwordForm.confirmPassword && passwordForm.newPassword !== passwordForm.confirmPassword
                                ? "Passwords do not match"
                                : undefined
                            }
                          />
                        </div>

                        <div className="pt-2">
                          <SubmitButton
                            type="submit"
                            isLoading={changePasswordMutation.status === "pending"}
                            loadingText="Updating..."
                            successText="Password Updated!"
                          >
                            <Key className="mr-2 h-4 w-4" /> Update Password
                          </SubmitButton>
                        </div>
                      </form>
                    </CardContent>
                  </Card>

                  <Card className="border-border/60 bg-card/70 backdrop-blur-xl shadow-lg rounded-3xl">
                    <CardHeader>
                      <CardTitle className="text-lg font-bold flex items-center gap-2">
                        <Shield className="h-5 w-5 text-emerald-500" /> Two-Factor Authentication (2FA)
                      </CardTitle>
                      <CardDescription>Add an extra layer of security to your CampusOS account</CardDescription>
                    </CardHeader>
                    <CardContent className="flex items-center justify-between p-6 rounded-2xl border border-border/60 bg-background/50">
                      <div className="space-y-1">
                        <p className="text-sm font-bold text-foreground">Authenticator App 2FA</p>
                        <p className="text-xs text-muted-foreground">Use TOTP apps like Google Authenticator or Authy</p>
                      </div>
                      <Button
                        variant="outline"
                        className="rounded-2xl font-semibold border-emerald-500/30 text-emerald-600 dark:text-emerald-400 hover:bg-emerald-500/10"
                        onClick={() => toast.success("2FA configuration initiated.")}
                      >
                        Enable 2FA
                      </Button>
                    </CardContent>
                  </Card>
                </div>
              )}

              {/* ── 3. NOTIFICATIONS SECTION ── */}
              {activeTab === "notifications" && (
                <Card className="border-border/60 bg-card/70 backdrop-blur-xl shadow-lg rounded-3xl">
                  <CardHeader>
                    <CardTitle className="text-xl font-bold flex items-center gap-2">
                      <Bell className="h-5 w-5 text-indigo-500" /> Notification Preferences
                    </CardTitle>
                    <CardDescription>Configure how and when CampusOS alerts you</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    <div className="space-y-4">
                      {[
                        { key: "emailAlerts", label: "Email Notifications", desc: "Receive summary digests & critical updates via email" },
                        { key: "pushAlerts", label: "Push Notifications", desc: "Receive real-time desktop & mobile browser alerts" },
                        { key: "smsAlerts", label: "SMS Emergency Alerts", desc: "Receive high-priority campus safety SMS messages" },
                        { key: "academicAlerts", label: "Academic & Exam Notifications", desc: "Class schedules, marks releases, and assignments" },
                        { key: "financialAlerts", label: "Fee & Payment Reminders", desc: "Invoice generation and receipt confirmations" },
                      ].map((item) => (
                        <div
                          key={item.key}
                          className="flex items-center justify-between p-4 rounded-2xl border border-border/60 bg-background/50 hover:bg-muted/40 transition-colors"
                        >
                          <div className="space-y-0.5">
                            <p className="text-sm font-bold text-foreground">{item.label}</p>
                            <p className="text-xs text-muted-foreground">{item.desc}</p>
                          </div>
                          <button
                            type="button"
                            onClick={() => {
                              setNotifications((prev) => {
                                const updated = { ...prev, [item.key]: !prev[item.key as keyof typeof prev] };
                                toast.success("Notification preferences updated.");
                                return updated;
                              });
                            }}
                            className={`h-6 w-11 rounded-full p-0.5 transition-colors ${
                              notifications[item.key as keyof typeof notifications] ? "bg-primary" : "bg-muted-foreground/30"
                            }`}
                          >
                            <div
                              className={`h-5 w-5 rounded-full bg-white transition-transform ${
                                notifications[item.key as keyof typeof notifications] ? "translate-x-5" : "translate-x-0"
                              }`}
                            />
                          </button>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* ── 4. APPEARANCE SECTION ── */}
              {activeTab === "appearance" && (
                <Card className="border-border/60 bg-card/70 backdrop-blur-xl shadow-lg rounded-3xl">
                  <CardHeader>
                    <CardTitle className="text-xl font-bold flex items-center gap-2">
                      <Paintbrush className="h-5 w-5 text-indigo-500" /> Interface Appearance
                    </CardTitle>
                    <CardDescription>Customize visual styles, theme color modes & UI density</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    {/* Theme Mode Selection */}
                    <div>
                      <Label className="text-xs font-semibold mb-3 block">Color Mode</Label>
                      <div className="grid grid-cols-3 gap-3">
                        {[
                          { id: "light", label: "Light Mode", icon: Sun },
                          { id: "dark", label: "Dark Mode", icon: Moon },
                          { id: "system", label: "System Default", icon: Sliders },
                        ].map((mode) => {
                          const ModeIcon = mode.icon;
                          const selected = appearance.themeMode === mode.id;
                          return (
                            <button
                              key={mode.id}
                              type="button"
                              onClick={() => {
                                setAppearance({ ...appearance, themeMode: mode.id });
                                toast.success(`Theme mode set to ${mode.label}`);
                              }}
                              className={`flex flex-col items-center gap-2 p-4 rounded-2xl border text-center transition-all ${
                                selected
                                  ? "border-primary bg-primary/10 text-primary font-bold shadow-sm"
                                  : "border-border/60 bg-background/50 hover:bg-muted/40 text-muted-foreground"
                              }`}
                            >
                              <ModeIcon className="h-6 w-6" />
                              <span className="text-xs">{mode.label}</span>
                            </button>
                          );
                        })}
                      </div>
                    </div>

                    {/* UI Density */}
                    <div>
                      <Label className="text-xs font-semibold mb-3 block">UI Density</Label>
                      <div className="grid grid-cols-2 gap-3 max-w-md">
                        {[
                          { id: "comfortable", label: "Comfortable", desc: "Spacious padding & room" },
                          { id: "compact", label: "Compact", desc: "Higher data density" },
                        ].map((d) => {
                          const selected = appearance.density === d.id;
                          return (
                            <button
                              key={d.id}
                              type="button"
                              onClick={() => {
                                setAppearance({ ...appearance, density: d.id });
                                toast.success(`Density set to ${d.label}`);
                              }}
                              className={`p-4 rounded-2xl border text-left transition-all ${
                                selected
                                  ? "border-primary bg-primary/10 text-primary font-bold shadow-sm"
                                  : "border-border/60 bg-background/50 hover:bg-muted/40 text-muted-foreground"
                              }`}
                            >
                              <p className="text-xs font-bold">{d.label}</p>
                              <p className="text-[10px] text-muted-foreground mt-1">{d.desc}</p>
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* ── 5. LANGUAGE SECTION ── */}
              {activeTab === "language" && (
                <Card className="border-border/60 bg-card/70 backdrop-blur-xl shadow-lg rounded-3xl">
                  <CardHeader>
                    <CardTitle className="text-xl font-bold flex items-center gap-2">
                      <Globe className="h-5 w-5 text-indigo-500" /> Language & Regional Settings
                    </CardTitle>
                    <CardDescription>Select language, date formats, and regional timezones</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    <div className="space-y-4 max-w-md">
                      <div>
                        <Label className="text-xs font-semibold">Primary Language</Label>
                        <select
                          value={language.lang}
                          onChange={(e) => {
                            setLanguage({ ...language, lang: e.target.value });
                            toast.success("Language preference updated!");
                          }}
                          className="mt-1.5 w-full rounded-2xl border border-border/80 bg-background px-4 py-2.5 text-sm font-semibold text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                        >
                          <option value="en-US">English (United States)</option>
                          <option value="en-IN">English (India)</option>
                          <option value="hi-IN">Hindi (हिन्दी)</option>
                          <option value="es-ES">Spanish (Español)</option>
                          <option value="fr-FR">French (Français)</option>
                          <option value="de-DE">German (Deutsch)</option>
                        </select>
                      </div>

                      <div>
                        <Label className="text-xs font-semibold">Date Format</Label>
                        <select
                          value={language.dateFormat}
                          onChange={(e) => {
                            setLanguage({ ...language, dateFormat: e.target.value });
                            toast.success("Date format updated!");
                          }}
                          className="mt-1.5 w-full rounded-2xl border border-border/80 bg-background px-4 py-2.5 text-sm font-semibold text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                        >
                          <option value="DD/MM/YYYY">DD/MM/YYYY (31/07/2026)</option>
                          <option value="MM/DD/YYYY">MM/DD/YYYY (07/31/2026)</option>
                          <option value="YYYY-MM-DD">YYYY-MM-DD (2026-07-31)</option>
                        </select>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* ── 6. PRIVACY SECTION ── */}
              {activeTab === "privacy" && (
                <Card className="border-border/60 bg-card/70 backdrop-blur-xl shadow-lg rounded-3xl">
                  <CardHeader>
                    <CardTitle className="text-xl font-bold flex items-center gap-2">
                      <Eye className="h-5 w-5 text-indigo-500" /> Privacy & Data Visibility
                    </CardTitle>
                    <CardDescription>Control who can view your profile and data activity</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    <div className="space-y-4">
                      <div>
                        <Label className="text-xs font-semibold mb-3 block">Profile Visibility</Label>
                        <div className="grid sm:grid-cols-3 gap-3">
                          {[
                            { id: "public", label: "Public", desc: "Visible to all registered users" },
                            { id: "campus", label: "Campus Only", desc: "Visible within your institution" },
                            { id: "private", label: "Private", desc: "Visible to administrators only" },
                          ].map((v) => {
                            const selected = privacy.profileVisibility === v.id;
                            return (
                              <button
                                key={v.id}
                                type="button"
                                onClick={() => {
                                  setPrivacy({ ...privacy, profileVisibility: v.id });
                                  toast.success(`Profile visibility set to ${v.label}`);
                                }}
                                className={`p-4 rounded-2xl border text-left transition-all ${
                                  selected
                                    ? "border-primary bg-primary/10 text-primary font-bold shadow-sm"
                                    : "border-border/60 bg-background/50 hover:bg-muted/40 text-muted-foreground"
                                }`}
                              >
                                <p className="text-xs font-bold">{v.label}</p>
                                <p className="text-[10px] text-muted-foreground mt-1">{v.desc}</p>
                              </button>
                            );
                          })}
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* ── 7. SESSIONS SECTION ── */}
              {activeTab === "sessions" && (
                <Card className="border-border/60 bg-card/70 backdrop-blur-xl shadow-lg rounded-3xl">
                  <CardHeader>
                    <CardTitle className="text-xl font-bold flex items-center gap-2">
                      <Smartphone className="h-5 w-5 text-indigo-500" /> Active Logged-in Sessions
                    </CardTitle>
                    <CardDescription>Review and manage active devices authenticated with your account</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {sessions.map((session) => {
                      const SessionIcon = session.icon;
                      return (
                        <div
                          key={session.id}
                          className="flex items-center justify-between p-4 rounded-2xl border border-border/60 bg-background/50"
                        >
                          <div className="flex items-center gap-3.5">
                            <div className="h-11 w-11 rounded-2xl bg-indigo-500/10 text-indigo-500 flex items-center justify-center shrink-0">
                              <SessionIcon className="h-5 w-5" />
                            </div>
                            <div>
                              <div className="flex items-center gap-2">
                                <h4 className="font-bold text-sm text-foreground">{session.device}</h4>
                                {session.current && (
                                  <span className="rounded-full bg-emerald-500/15 px-2.5 py-0.5 text-[10px] font-bold text-emerald-600 dark:text-emerald-400">
                                    Current Session
                                  </span>
                                )}
                              </div>
                              <p className="text-xs text-muted-foreground mt-0.5">
                                {session.location} • IP: {session.ip}
                              </p>
                            </div>
                          </div>
                          {!session.current && (
                            <Button
                              variant="outline"
                              size="sm"
                              className="rounded-xl border-rose-500/30 text-rose-600 dark:text-rose-400 hover:bg-rose-500/10"
                              onClick={() => revokeSession(session.id)}
                            >
                              <LogOut className="mr-1.5 h-3.5 w-3.5" /> Revoke
                            </Button>
                          )}
                        </div>
                      );
                    })}
                  </CardContent>
                </Card>
              )}

              {/* ── 8. THEME SECTION ── */}
              {activeTab === "theme" && (
                <Card className="border-border/60 bg-card/70 backdrop-blur-xl shadow-lg rounded-3xl">
                  <CardHeader>
                    <CardTitle className="text-xl font-bold flex items-center gap-2">
                      <Sparkles className="h-5 w-5 text-indigo-500" /> Color Accent & Branding Theme
                    </CardTitle>
                    <CardDescription>Customize secondary highlights & accent themes</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    <div>
                      <Label className="text-xs font-semibold mb-3 block">Accent Color Palette</Label>
                      <div className="flex items-center gap-3 flex-wrap">
                        {[
                          { id: "indigo", bg: "bg-indigo-600", label: "Indigo" },
                          { id: "emerald", bg: "bg-emerald-600", label: "Emerald" },
                          { id: "amber", bg: "bg-amber-500", label: "Amber" },
                          { id: "rose", bg: "bg-rose-600", label: "Rose" },
                          { id: "purple", bg: "bg-purple-600", label: "Purple" },
                        ].map((c) => {
                          const selected = appearance.accentColor === c.id;
                          return (
                            <button
                              key={c.id}
                              type="button"
                              onClick={() => {
                                setAppearance({ ...appearance, accentColor: c.id });
                                toast.success(`Accent color changed to ${c.label}`);
                              }}
                              className={`flex items-center gap-2 px-4 py-2.5 rounded-2xl border text-xs font-semibold transition-all ${
                                selected
                                  ? "border-primary bg-primary/10 text-foreground ring-2 ring-primary"
                                  : "border-border/60 bg-background/50 hover:bg-muted/40"
                              }`}
                            >
                              <span className={`h-4 w-4 rounded-full ${c.bg}`} />
                              {c.label}
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* ── 9. ACCESSIBILITY SECTION ── */}
              {activeTab === "accessibility" && (
                <Card className="border-border/60 bg-card/70 backdrop-blur-xl shadow-lg rounded-3xl">
                  <CardHeader>
                    <CardTitle className="text-xl font-bold flex items-center gap-2">
                      <Accessibility className="h-5 w-5 text-indigo-500" /> Accessibility & Assistive Features
                    </CardTitle>
                    <CardDescription>Tailor readability, contrast, and font scaling to your preference</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    <div className="space-y-4">
                      <div className="flex items-center justify-between p-4 rounded-2xl border border-border/60 bg-background/50">
                        <div className="space-y-0.5">
                          <p className="text-sm font-bold text-foreground">High Contrast Mode</p>
                          <p className="text-xs text-muted-foreground">Increases contrast borders & text readability</p>
                        </div>
                        <button
                          type="button"
                          onClick={() => {
                            setAccessibility((prev) => {
                              const updated = { ...prev, highContrast: !prev.highContrast };
                              toast.success(`High Contrast ${updated.highContrast ? "Enabled" : "Disabled"}`);
                              return updated;
                            });
                          }}
                          className={`h-6 w-11 rounded-full p-0.5 transition-colors ${
                            accessibility.highContrast ? "bg-primary" : "bg-muted-foreground/30"
                          }`}
                        >
                          <div
                            className={`h-5 w-5 rounded-full bg-white transition-transform ${
                              accessibility.highContrast ? "translate-x-5" : "translate-x-0"
                            }`}
                          />
                        </button>
                      </div>

                      <div className="flex items-center justify-between p-4 rounded-2xl border border-border/60 bg-background/50">
                        <div className="space-y-0.5">
                          <p className="text-sm font-bold text-foreground">Dyslexia Friendly Font</p>
                          <p className="text-xs text-muted-foreground">Uses specialized high-readability letter spacing</p>
                        </div>
                        <button
                          type="button"
                          onClick={() => {
                            setAccessibility((prev) => {
                              const updated = { ...prev, dyslexiaFont: !prev.dyslexiaFont };
                              toast.success(`Dyslexia Font ${updated.dyslexiaFont ? "Enabled" : "Disabled"}`);
                              return updated;
                            });
                          }}
                          className={`h-6 w-11 rounded-full p-0.5 transition-colors ${
                            accessibility.dyslexiaFont ? "bg-primary" : "bg-muted-foreground/30"
                          }`}
                        >
                          <div
                            className={`h-5 w-5 rounded-full bg-white transition-transform ${
                              accessibility.dyslexiaFont ? "translate-x-5" : "translate-x-0"
                            }`}
                          />
                        </button>
                      </div>

                      <div className="flex items-center justify-between p-4 rounded-2xl border border-border/60 bg-background/50">
                        <div className="space-y-0.5">
                          <p className="text-sm font-bold text-foreground">Reduced Motion</p>
                          <p className="text-xs text-muted-foreground">Minimizes UI animations and transition effects</p>
                        </div>
                        <button
                          type="button"
                          onClick={() => {
                            setAccessibility((prev) => {
                              const updated = { ...prev, reducedMotion: !prev.reducedMotion };
                              toast.success(`Reduced Motion ${updated.reducedMotion ? "Enabled" : "Disabled"}`);
                              return updated;
                            });
                          }}
                          className={`h-6 w-11 rounded-full p-0.5 transition-colors ${
                            accessibility.reducedMotion ? "bg-primary" : "bg-muted-foreground/30"
                          }`}
                        >
                          <div
                            className={`h-5 w-5 rounded-full bg-white transition-transform ${
                              accessibility.reducedMotion ? "translate-x-5" : "translate-x-0"
                            }`}
                          />
                        </button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )}
            </motion.div>
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}
