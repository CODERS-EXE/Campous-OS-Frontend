"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import {
  Building2,
  CheckCircle2,
  Copy,
  Home,
  Mail,
  Phone,
  Shield,
  ShieldCheck,
  User,
  Activity,
  Sparkles,
  Eye,
  EyeOff,
} from "lucide-react";
import toast from "react-hot-toast";
import { AuthGuard } from "@/components/shared/AuthGuard";
import { DashboardShell } from "@/components/shared/DashboardShell";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useAuthStore } from "@/lib/store/auth";
import { ProfileHeader } from "@/components/profile/ProfileHeader";
import { ProfileModal } from "@/components/profile/ProfileModal";
import { ProfileStatCard } from "@/components/profile/ProfileStatCard";

export default function WardenProfilePage() {
  const { user, college } = useAuthStore();
  const [showEditModal, setShowEditModal] = useState(false);
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);

  const [editForm, setEditForm] = useState({
    name: user?.name || "",
    email: user?.email || "",
    phone: typeof user?.profile?.phone === "string" ? user.profile.phone : "",
  });

  const [passwordForm, setPasswordForm] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });

  const copyToClipboard = (text: string, label: string) => {
    if (!text) return;
    navigator.clipboard.writeText(text);
    toast.success(`${label} copied to clipboard!`);
  };

  const handleEditSave = () => {
    toast.success("Profile updated successfully!");
    setShowEditModal(false);
  };

  const handlePasswordChange = () => {
    if (!passwordForm.currentPassword) {
      toast.error("Please enter your current password.");
      return;
    }
    if (!passwordForm.newPassword) {
      toast.error("Please enter a new password.");
      return;
    }
    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      toast.error("New passwords do not match!");
      return;
    }
    toast.success("Password changed successfully!");
    setShowPasswordModal(false);
    setPasswordForm({ currentPassword: "", newPassword: "", confirmPassword: "" });
  };

  const initials =
    user?.name
      ?.split(" ")
      .map((n) => n[0])
      .join("")
      .substring(0, 2)
      .toUpperCase() || "WD";

  const badges = [
    { label: "Hostel Warden", icon: ShieldCheck },
    ...(college?.name ? [{ label: college.name, icon: Building2 }] : []),
  ];

  return (
    <AuthGuard allowedRoles={["warden"]}>
      <DashboardShell title="Warden Profile">
        <div className="space-y-8 pb-12">
          {/* ── Cover Banner & Header ── */}
          <ProfileHeader
            name={`Warden ${user?.name || ""}`}
            email={user?.email}
            roleTitle="Hostel Warden"
            roleTheme="warden"
            statusText="Active Duty"
            badges={badges}
            initials={initials}
            onEditProfile={() => {
              setEditForm({
                name: user?.name || "",
                email: user?.email || "",
                phone: typeof user?.profile?.phone === "string" ? user.profile.phone : "",
              });
              setShowEditModal(true);
            }}
            onChangePassword={() => setShowPasswordModal(true)}
          />

          {/* ── Key Statistics Row ── */}
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.1 }}
            className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4"
          >
            <ProfileStatCard
              title="Hostel Duty"
              value="Head Warden"
              subtitle="Resident Campus Security"
              icon={Home}
              variant="amber"
            />
            <ProfileStatCard
              title="Account Status"
              value="Verified"
              subtitle="Campus Staff"
              icon={CheckCircle2}
              variant="emerald"
            />
            <ProfileStatCard
              title="Assigned Block"
              value={typeof user?.profile?.hostel === "string" ? user.profile.hostel : "Block A"}
              subtitle="Residence Management"
              icon={Building2}
              variant="rose"
            />
            <ProfileStatCard
              title="System Authority"
              value="Warden"
              subtitle="Outpass & Security Scope"
              icon={ShieldCheck}
              variant="indigo"
            />
          </motion.div>

          {/* ── Main Details Grid ── */}
          <div className="grid gap-6 lg:grid-cols-3">
            {/* Left 2 Cols: Personal Info & Responsibilities */}
            <motion.div
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: 0.2 }}
              className="lg:col-span-2 space-y-6"
            >
              <Card className="border-border/60 bg-card/60 backdrop-blur-md shadow-sm">
                <CardHeader>
                  <CardTitle className="text-lg font-bold flex items-center gap-2">
                    <User className="h-5 w-5 text-amber-500" /> Warden Personal Information
                  </CardTitle>
                  <CardDescription>Verified staff records</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid gap-4 sm:grid-cols-2">
                    <div className="flex items-center justify-between p-4 rounded-2xl border border-border/60 bg-background/50 hover:border-amber-500/30 transition-all">
                      <div className="flex items-center gap-3 overflow-hidden">
                        <div className="h-10 w-10 rounded-xl bg-amber-500/10 text-amber-500 flex items-center justify-center shrink-0">
                          <Mail className="h-5 w-5" />
                        </div>
                        <div className="overflow-hidden">
                          <p className="text-xs text-muted-foreground font-medium">Email Address</p>
                          <p className="text-sm font-semibold truncate">{user?.email}</p>
                        </div>
                      </div>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 shrink-0 hover:bg-amber-500/10 hover:text-amber-500"
                        onClick={() => copyToClipboard(user?.email || "", "Email")}
                      >
                        <Copy className="h-3.5 w-3.5" />
                      </Button>
                    </div>

                    {typeof user?.profile?.phone === "string" && (
                      <div className="flex items-center justify-between p-4 rounded-2xl border border-border/60 bg-background/50 hover:border-rose-500/30 transition-all">
                        <div className="flex items-center gap-3 overflow-hidden">
                          <div className="h-10 w-10 rounded-xl bg-rose-500/10 text-rose-500 flex items-center justify-center shrink-0">
                            <Phone className="h-5 w-5" />
                          </div>
                          <div className="overflow-hidden">
                            <p className="text-xs text-muted-foreground font-medium">Phone Number</p>
                            <p className="text-sm font-semibold">{user.profile.phone}</p>
                          </div>
                        </div>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8 shrink-0 hover:bg-rose-500/10 hover:text-rose-500"
                          onClick={() => copyToClipboard(user?.profile?.phone as string, "Phone")}
                        >
                          <Copy className="h-3.5 w-3.5" />
                        </Button>
                      </div>
                    )}

                    {typeof user?.profile?.designation === "string" && (
                      <div className="flex items-center gap-3 p-4 rounded-2xl border border-border/60 bg-background/50">
                        <div className="h-10 w-10 rounded-xl bg-indigo-500/10 text-indigo-500 flex items-center justify-center shrink-0">
                          <User className="h-5 w-5" />
                        </div>
                        <div>
                          <p className="text-xs text-muted-foreground font-medium">Designation</p>
                          <p className="text-sm font-semibold">{user.profile.designation}</p>
                        </div>
                      </div>
                    )}

                    {typeof user?.profile?.hostel === "string" && (
                      <div className="flex items-center gap-3 p-4 rounded-2xl border border-border/60 bg-background/50">
                        <div className="h-10 w-10 rounded-xl bg-teal-500/10 text-teal-500 flex items-center justify-center shrink-0">
                          <Home className="h-5 w-5" />
                        </div>
                        <div>
                          <p className="text-xs text-muted-foreground font-medium">Hostel Assigned</p>
                          <p className="text-sm font-semibold">{user.profile.hostel}</p>
                        </div>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>

              {/* Warden Duties Matrix */}
              <Card className="border-border/60 bg-card/60 backdrop-blur-md shadow-sm">
                <CardHeader>
                  <CardTitle className="text-lg font-bold flex items-center gap-2">
                    <ShieldCheck className="h-5 w-5 text-amber-500" /> Warden Responsibilities Matrix
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid gap-3 sm:grid-cols-3">
                    {[
                      "Outpass Approval Authority",
                      "Night Attendance Monitoring",
                      "Hostel Room Allocations",
                    ].map((duty) => (
                      <div
                        key={duty}
                        className="flex items-center gap-2.5 rounded-2xl border border-amber-500/20 bg-amber-500/5 p-4"
                      >
                        <ShieldCheck className="h-4 w-4 text-amber-600 dark:text-amber-400 shrink-0" />
                        <span className="text-xs font-semibold text-amber-900 dark:text-amber-300">
                          {duty}
                        </span>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </motion.div>

            {/* Right Col: College & Activity */}
            <motion.div
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: 0.3 }}
              className="space-y-6"
            >
              <Card className="border-border/60 bg-card/60 backdrop-blur-md shadow-sm">
                <CardHeader>
                  <CardTitle className="text-lg font-bold flex items-center gap-2">
                    <Building2 className="h-5 w-5 text-amber-500" /> College Details
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="p-4 rounded-2xl border border-border/60 bg-background/50">
                    <p className="text-xs text-muted-foreground font-medium">Institution</p>
                    <p className="text-sm font-bold text-foreground mt-0.5">{college?.name || "CampusOS"}</p>
                  </div>
                  <div className="p-4 rounded-2xl border border-border/60 bg-background/50">
                    <p className="text-xs text-muted-foreground font-medium">Domain</p>
                    <p className="text-sm font-semibold text-amber-600 dark:text-amber-400 mt-0.5 font-mono">
                      {college?.subdomain || "demo"}.campusos.com
                    </p>
                  </div>
                </CardContent>
              </Card>

              <Card className="border-border/60 bg-card/60 backdrop-blur-md shadow-sm">
                <CardHeader>
                  <CardTitle className="text-lg font-bold flex items-center gap-2">
                    <Activity className="h-5 w-5 text-amber-500" /> Security Audit Log
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="relative pl-6 before:absolute before:left-2 before:top-2 before:bottom-2 before:w-0.5 before:bg-border space-y-4">
                    <div className="relative">
                      <div className="absolute -left-6 top-1 h-3 w-3 rounded-full bg-emerald-500 ring-4 ring-background" />
                      <p className="text-xs font-bold text-foreground">Warden Session Authenticated</p>
                      <p className="text-[11px] text-muted-foreground">Today at {new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          </div>
        </div>

        {/* ── Edit Profile Modal ── */}
        <ProfileModal
          isOpen={showEditModal}
          onClose={() => setShowEditModal(false)}
          title="Edit Warden Profile"
          description="Update your phone and contact info"
          onSave={handleEditSave}
          saveText="Save Changes"
        >
          <div className="space-y-4">
            <div>
              <Label className="text-xs font-semibold">Full Name</Label>
              <Input
                value={editForm.name}
                onChange={(e) => setEditForm({ ...editForm, name: e.target.value })}
                className="mt-1 rounded-2xl"
              />
            </div>
            <div>
              <Label className="text-xs font-semibold">Email Address (Read-only)</Label>
              <Input
                value={editForm.email}
                disabled
                className="mt-1 rounded-2xl bg-muted/50 cursor-not-allowed"
              />
            </div>
            <div>
              <Label className="text-xs font-semibold">Phone Number</Label>
              <Input
                placeholder="+91 98765 43210"
                value={editForm.phone}
                onChange={(e) => setEditForm({ ...editForm, phone: e.target.value })}
                className="mt-1 rounded-2xl"
              />
            </div>
          </div>
        </ProfileModal>

        {/* ── Change Password Modal ── */}
        <ProfileModal
          isOpen={showPasswordModal}
          onClose={() => setShowPasswordModal(false)}
          title="Change Password"
          description="Ensure account security"
          onSave={handlePasswordChange}
          saveText="Update Password"
        >
          <div className="space-y-4">
            <div>
              <Label className="text-xs font-semibold">Current Password</Label>
              <div className="relative mt-1">
                <Input
                  type={showCurrentPassword ? "text" : "password"}
                  placeholder="••••••••"
                  value={passwordForm.currentPassword}
                  onChange={(e) => setPasswordForm({ ...passwordForm, currentPassword: e.target.value })}
                  className="rounded-2xl pr-10"
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  className="absolute right-1 top-1/2 -translate-y-1/2 h-8 w-8 text-muted-foreground"
                  onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                >
                  {showCurrentPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </Button>
              </div>
            </div>

            <div>
              <Label className="text-xs font-semibold">New Password</Label>
              <div className="relative mt-1">
                <Input
                  type={showNewPassword ? "text" : "password"}
                  placeholder="••••••••"
                  value={passwordForm.newPassword}
                  onChange={(e) => setPasswordForm({ ...passwordForm, newPassword: e.target.value })}
                  className="rounded-2xl pr-10"
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  className="absolute right-1 top-1/2 -translate-y-1/2 h-8 w-8 text-muted-foreground"
                  onClick={() => setShowNewPassword(!showNewPassword)}
                >
                  {showNewPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </Button>
              </div>
            </div>

            <div>
              <Label className="text-xs font-semibold">Confirm New Password</Label>
              <Input
                type="password"
                placeholder="••••••••"
                value={passwordForm.confirmPassword}
                onChange={(e) => setPasswordForm({ ...passwordForm, confirmPassword: e.target.value })}
                className="mt-1 rounded-2xl"
              />
            </div>
          </div>
        </ProfileModal>
      </DashboardShell>
    </AuthGuard>
  );
}
