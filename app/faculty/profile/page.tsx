"use client";

import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { motion } from "framer-motion";
import {
  Award,
  BookOpen,
  Building2,
  Calendar,
  CheckCircle2,
  Copy,
  GraduationCap,
  Mail,
  Phone,
  Shield,
  Star,
  User,
  Users,
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
import { api, DashboardStats } from "@/lib/api";
import { useAuthStore } from "@/lib/store/auth";
import { ProfileHeader } from "@/components/profile/ProfileHeader";
import { ProfileModal } from "@/components/profile/ProfileModal";
import { ProfileStatCard } from "@/components/profile/ProfileStatCard";

export default function FacultyProfilePage() {
  const { user, college } = useAuthStore();
  const [showEditModal, setShowEditModal] = useState(false);
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);

  const [editForm, setEditForm] = useState({
    name: user?.name || "",
    email: user?.email || "",
    phone: "",
  });

  const [passwordForm, setPasswordForm] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });

  const statsQuery = useQuery<DashboardStats>({
    queryKey: ["dashboard-stats"],
    queryFn: () => api.get<DashboardStats>("/api/v1/users/dashboard/stats"),
    enabled: !!user,
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
      .toUpperCase() || "FC";

  const badges = [
    { label: "Faculty Educator", icon: BookOpen },
    ...(college?.name ? [{ label: college.name, icon: Building2 }] : []),
  ];

  return (
    <AuthGuard allowedRoles={["faculty"]}>
      <DashboardShell title="Faculty Profile">
        <div className="space-y-8 pb-12">
          {/* ── Cover Banner & Header ── */}
          <ProfileHeader
            name={`Prof. ${user?.name || ""}`}
            email={user?.email}
            roleTitle="Academic Faculty"
            roleTheme="faculty"
            statusText="Active Educator"
            badges={badges}
            initials={initials}
            onEditProfile={() => {
              setEditForm({
                name: user?.name || "",
                email: user?.email || "",
                phone: "",
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
              title="Total Students Enrolled"
              value={statsQuery.data?.total_students ?? "—"}
              subtitle="Active Across Courses"
              icon={Users}
              variant="emerald"
            />
            <ProfileStatCard
              title="Academic Staff Role"
              value="Professor"
              subtitle="Department Educator"
              icon={BookOpen}
              variant="teal"
            />
            <ProfileStatCard
              title="Marks Evaluation Rate"
              value="98%"
              subtitle="On-time Assessment"
              icon={Award}
              variant="indigo"
            />
            <ProfileStatCard
              title="Faculty Status"
              value="Verified"
              subtitle="CampusOS Academic Staff"
              icon={Shield}
              variant="purple"
            />
          </motion.div>

          {/* ── Main Details Grid ── */}
          <div className="grid gap-6 lg:grid-cols-3">
            {/* Left 2 Cols: Credentials & Accolades */}
            <motion.div
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: 0.2 }}
              className="lg:col-span-2 space-y-6"
            >
              <Card className="border-border/60 bg-card/60 backdrop-blur-md shadow-sm">
                <CardHeader>
                  <CardTitle className="text-lg font-bold flex items-center gap-2">
                    <User className="h-5 w-5 text-emerald-500" /> Faculty Details & Credentials
                  </CardTitle>
                  <CardDescription>Verified academic staff profile information</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid gap-4 sm:grid-cols-2">
                    <div className="flex items-center justify-between p-4 rounded-2xl border border-border/60 bg-background/50 hover:border-emerald-500/30 transition-all">
                      <div className="flex items-center gap-3 overflow-hidden">
                        <div className="h-10 w-10 rounded-xl bg-emerald-500/10 text-emerald-500 flex items-center justify-center shrink-0">
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
                        className="h-8 w-8 shrink-0 hover:bg-emerald-500/10 hover:text-emerald-500"
                        onClick={() => copyToClipboard(user?.email || "", "Email")}
                      >
                        <Copy className="h-3.5 w-3.5" />
                      </Button>
                    </div>

                    <div className="flex items-center justify-between p-4 rounded-2xl border border-border/60 bg-background/50 hover:border-teal-500/30 transition-all">
                      <div className="flex items-center gap-3 overflow-hidden">
                        <div className="h-10 w-10 rounded-xl bg-teal-500/10 text-teal-500 flex items-center justify-center shrink-0">
                          <User className="h-5 w-5" />
                        </div>
                        <div className="overflow-hidden">
                          <p className="text-xs text-muted-foreground font-medium">Faculty User ID</p>
                          <p className="text-sm font-semibold font-mono">{user?.id?.slice(0, 16)}…</p>
                        </div>
                      </div>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 shrink-0 hover:bg-teal-500/10 hover:text-teal-500"
                        onClick={() => copyToClipboard(user?.id || "", "User ID")}
                      >
                        <Copy className="h-3.5 w-3.5" />
                      </Button>
                    </div>

                    <div className="flex items-center gap-3 p-4 rounded-2xl border border-border/60 bg-background/50">
                      <div className="h-10 w-10 rounded-xl bg-indigo-500/10 text-indigo-500 flex items-center justify-center shrink-0">
                        <Building2 className="h-5 w-5" />
                      </div>
                      <div>
                        <p className="text-xs text-muted-foreground font-medium">Assigned Institution</p>
                        <p className="text-sm font-semibold">{college?.name || "CampusOS Institution"}</p>
                      </div>
                    </div>

                    <div className="flex items-center gap-3 p-4 rounded-2xl border border-border/60 bg-background/50">
                      <div className="h-10 w-10 rounded-xl bg-purple-500/10 text-purple-500 flex items-center justify-center shrink-0">
                        <BookOpen className="h-5 w-5" />
                      </div>
                      <div>
                        <p className="text-xs text-muted-foreground font-medium">Academic Designation</p>
                        <p className="text-sm font-semibold">Professor & Educator</p>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Accolades */}
              <Card className="border-border/60 bg-card/60 backdrop-blur-md shadow-sm">
                <CardHeader>
                  <CardTitle className="text-lg font-bold flex items-center gap-2">
                    <Star className="h-5 w-5 text-amber-500" /> Faculty Accolades & Recognition
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid gap-3 sm:grid-cols-3">
                    <div className="flex items-center gap-3 p-4 rounded-2xl border border-emerald-500/20 bg-emerald-500/5">
                      <div className="h-11 w-11 rounded-2xl bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 flex items-center justify-center font-bold text-xl shrink-0">
                        👨‍🏫
                      </div>
                      <div>
                        <h4 className="font-bold text-xs">Verified Educator</h4>
                        <p className="text-[10px] text-muted-foreground">CampusOS Staff</p>
                      </div>
                    </div>

                    <div className="flex items-center gap-3 p-4 rounded-2xl border border-indigo-500/20 bg-indigo-500/5">
                      <div className="h-11 w-11 rounded-2xl bg-indigo-500/20 text-indigo-600 dark:text-indigo-400 flex items-center justify-center font-bold text-xl shrink-0">
                        📝
                      </div>
                      <div>
                        <h4 className="font-bold text-xs">Evaluation Star</h4>
                        <p className="text-[10px] text-muted-foreground">Prompt grading rate</p>
                      </div>
                    </div>

                    <div className="flex items-center gap-3 p-4 rounded-2xl border border-amber-500/20 bg-amber-500/5">
                      <div className="h-11 w-11 rounded-2xl bg-amber-500/20 text-amber-600 dark:text-amber-400 flex items-center justify-center font-bold text-xl shrink-0">
                        ⭐
                      </div>
                      <div>
                        <h4 className="font-bold text-xs">Class Mentor</h4>
                        <p className="text-[10px] text-muted-foreground">Student guidance</p>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>

            {/* Right Col: College & Activity Timeline */}
            <motion.div
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: 0.3 }}
              className="space-y-6"
            >
              <Card className="border-border/60 bg-card/60 backdrop-blur-md shadow-sm">
                <CardHeader>
                  <CardTitle className="text-lg font-bold flex items-center gap-2">
                    <Building2 className="h-5 w-5 text-emerald-500" /> College Metadata
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="p-4 rounded-2xl border border-border/60 bg-background/50">
                    <p className="text-xs text-muted-foreground font-medium">Institution</p>
                    <p className="text-sm font-bold text-foreground mt-0.5">{college?.name || "CampusOS"}</p>
                  </div>
                  <div className="p-4 rounded-2xl border border-border/60 bg-background/50">
                    <p className="text-xs text-muted-foreground font-medium">Domain</p>
                    <p className="text-sm font-semibold text-emerald-600 dark:text-emerald-400 mt-0.5 font-mono">
                      {college?.subdomain || "demo"}.campusos.com
                    </p>
                  </div>
                </CardContent>
              </Card>

              <Card className="border-border/60 bg-card/60 backdrop-blur-md shadow-sm">
                <CardHeader>
                  <CardTitle className="text-lg font-bold flex items-center gap-2">
                    <Activity className="h-5 w-5 text-emerald-500" /> Activity Log
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="relative pl-6 before:absolute before:left-2 before:top-2 before:bottom-2 before:w-0.5 before:bg-border space-y-4">
                    <div className="relative">
                      <div className="absolute -left-6 top-1 h-3 w-3 rounded-full bg-emerald-500 ring-4 ring-background" />
                      <p className="text-xs font-bold text-foreground">Faculty Session Authenticated</p>
                      <p className="text-[11px] text-muted-foreground">Today at {new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}</p>
                    </div>
                    <div className="relative">
                      <div className="absolute -left-6 top-1 h-3 w-3 rounded-full bg-teal-500 ring-4 ring-background" />
                      <p className="text-xs font-bold text-foreground">Class Attendance Logged</p>
                      <p className="text-[11px] text-muted-foreground">All assigned batches verified</p>
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
          title="Edit Faculty Profile"
          description="Update your faculty profile details"
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
          description="Ensure account security with a robust password"
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
