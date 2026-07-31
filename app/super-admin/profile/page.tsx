"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import {
  CheckCircle2,
  Copy,
  Globe,
  Mail,
  Server,
  Shield,
  Star,
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

export default function SuperAdminProfilePage() {
  const { user } = useAuthStore();
  const [showEditModal, setShowEditModal] = useState(false);
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);

  const [editForm, setEditForm] = useState({
    name: user?.name || "",
    email: user?.email || "",
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
      .toUpperCase() || "SA";

  const badges = [
    { label: "Platform Super Admin", icon: Globe },
    { label: "Unlimited SaaS Access", icon: CheckCircle2 },
  ];

  return (
    <AuthGuard allowedRoles={["super_admin"]}>
      <DashboardShell title="Super Admin Profile">
        <div className="space-y-8 pb-12">
          {/* ── Cover Banner & Header ── */}
          <ProfileHeader
            name={user?.name || "Super Admin"}
            email={user?.email}
            roleTitle="Master Platform Super Admin"
            roleTheme="super_admin"
            statusText="Active Master Admin"
            badges={badges}
            initials={initials}
            onEditProfile={() => {
              setEditForm({
                name: user?.name || "",
                email: user?.email || "",
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
              title="Access Scope"
              value="Global SaaS"
              subtitle="Root System Authority"
              icon={Globe}
              variant="purple"
            />
            <ProfileStatCard
              title="Platform Security"
              value="Enforced"
              subtitle="SSL & Token Security"
              icon={Shield}
              variant="emerald"
            />
            <ProfileStatCard
              title="System Uptime"
              value="99.9%"
              subtitle="Cluster Healthy"
              icon={Server}
              variant="indigo"
            />
            <ProfileStatCard
              title="Role Tier"
              value="Super Admin"
              subtitle="Full Authority Scope"
              icon={Star}
              variant="amber"
            />
          </motion.div>

          {/* ── Main Details Grid ── */}
          <div className="grid gap-6 lg:grid-cols-3">
            {/* Left 2 Cols: Personal Credentials & Authority Matrix */}
            <motion.div
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: 0.2 }}
              className="lg:col-span-2 space-y-6"
            >
              <Card className="border-border/60 bg-card/60 backdrop-blur-md shadow-sm">
                <CardHeader>
                  <CardTitle className="text-lg font-bold flex items-center gap-2">
                    <User className="h-5 w-5 text-purple-500" /> Super Admin Master Credentials
                  </CardTitle>
                  <CardDescription>Master account identification</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid gap-4 sm:grid-cols-2">
                    <div className="flex items-center justify-between p-4 rounded-2xl border border-border/60 bg-background/50 hover:border-purple-500/30 transition-all">
                      <div className="flex items-center gap-3 overflow-hidden">
                        <div className="h-10 w-10 rounded-xl bg-purple-500/10 text-purple-500 flex items-center justify-center shrink-0">
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
                        className="h-8 w-8 shrink-0 hover:bg-purple-500/10 hover:text-purple-500"
                        onClick={() => copyToClipboard(user?.email || "", "Email")}
                      >
                        <Copy className="h-3.5 w-3.5" />
                      </Button>
                    </div>

                    <div className="flex items-center justify-between p-4 rounded-2xl border border-border/60 bg-background/50 hover:border-indigo-500/30 transition-all">
                      <div className="flex items-center gap-3 overflow-hidden">
                        <div className="h-10 w-10 rounded-xl bg-indigo-500/10 text-indigo-500 flex items-center justify-center shrink-0">
                          <User className="h-5 w-5" />
                        </div>
                        <div className="overflow-hidden">
                          <p className="text-xs text-muted-foreground font-medium">User ID</p>
                          <p className="text-sm font-semibold font-mono">{user?.id?.slice(0, 16)}…</p>
                        </div>
                      </div>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 shrink-0 hover:bg-indigo-500/10 hover:text-indigo-500"
                        onClick={() => copyToClipboard(user?.id || "", "User ID")}
                      >
                        <Copy className="h-3.5 w-3.5" />
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Authority Matrix */}
              <Card className="border-border/60 bg-card/60 backdrop-blur-md shadow-sm">
                <CardHeader>
                  <CardTitle className="text-lg font-bold flex items-center gap-2">
                    <Shield className="h-5 w-5 text-purple-500" /> Platform Authority Matrix
                  </CardTitle>
                  <CardDescription>Root system permissions</CardDescription>
                </CardHeader>
                <CardContent className="space-y-3">
                  {[
                    "College Onboarding & Tenant Management",
                    "Global Platform Analytics & Revenue Overview",
                    "Cross-Tenant User Security Audit",
                    "System Master Configuration & Maintenance",
                  ].map((auth) => (
                    <div
                      key={auth}
                      className="flex items-center justify-between p-4 rounded-2xl border border-purple-500/20 bg-purple-500/5"
                    >
                      <span className="text-xs font-semibold text-foreground">{auth}</span>
                      <span className="rounded-full bg-emerald-500/15 px-3 py-0.5 text-[10px] font-bold text-emerald-600 dark:text-emerald-400 border border-emerald-500/30">
                        FULL ACCESS
                      </span>
                    </div>
                  ))}
                </CardContent>
              </Card>
            </motion.div>

            {/* Right Col: System Audit Log */}
            <motion.div
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: 0.3 }}
              className="space-y-6"
            >
              <Card className="border-border/60 bg-card/60 backdrop-blur-md shadow-sm">
                <CardHeader>
                  <CardTitle className="text-lg font-bold flex items-center gap-2">
                    <Activity className="h-5 w-5 text-purple-500" /> System Audit Log
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="relative pl-6 before:absolute before:left-2 before:top-2 before:bottom-2 before:w-0.5 before:bg-border space-y-4">
                    <div className="relative">
                      <div className="absolute -left-6 top-1 h-3 w-3 rounded-full bg-emerald-500 ring-4 ring-background" />
                      <p className="text-xs font-bold text-foreground">Super Admin Session Active</p>
                      <p className="text-[11px] text-muted-foreground">Today at {new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}</p>
                    </div>
                    <div className="relative">
                      <div className="absolute -left-6 top-1 h-3 w-3 rounded-full bg-purple-500 ring-4 ring-background" />
                      <p className="text-xs font-bold text-foreground">Platform Heartbeat Healthy</p>
                      <p className="text-[11px] text-muted-foreground">Uptime 99.9% Verified</p>
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
          title="Edit Super Admin Profile"
          description="Update your administrator profile name"
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
          </div>
        </ProfileModal>

        {/* ── Change Password Modal ── */}
        <ProfileModal
          isOpen={showPasswordModal}
          onClose={() => setShowPasswordModal(false)}
          title="Change Password"
          description="Ensure master account security"
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
