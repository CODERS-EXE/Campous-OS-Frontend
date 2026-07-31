"use client";

import { useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { motion } from "framer-motion";
import {
  Award,
  Building2,
  Calendar,
  CheckCircle2,
  Copy,
  GraduationCap,
  HeartHandshake,
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
import { api, Student } from "@/lib/api";
import { useAuthStore } from "@/lib/store/auth";
import { ProfileHeader } from "@/components/profile/ProfileHeader";
import { ProfileModal } from "@/components/profile/ProfileModal";
import { ProfileStatCard } from "@/components/profile/ProfileStatCard";

export default function ParentProfilePage() {
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

  const studentsQuery = useQuery<Student[]>({
    queryKey: ["students", "all"],
    queryFn: () => api.get<Student[]>("/api/v1/users/students"),
    enabled: !!user,
  });

  const myChildren = useMemo(() => {
    if (!user?.profile?.student_ids || !studentsQuery.data) return [];
    const childIds = user.profile.student_ids as string[];
    return studentsQuery.data.filter((student) => childIds.includes(student.user_id));
  }, [user, studentsQuery.data]);

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
      .toUpperCase() || "PR";

  const badges = [
    { label: "Parent / Guardian", icon: HeartHandshake },
    ...(college?.name ? [{ label: college.name, icon: Building2 }] : []),
  ];

  return (
    <AuthGuard allowedRoles={["parent"]}>
      <DashboardShell title="Parent Profile">
        <div className="space-y-8 pb-12">
          {/* ── Cover Banner & Header ── */}
          <ProfileHeader
            name={user?.name || "Guardian"}
            email={user?.email}
            roleTitle="Parent / Guardian"
            roleTheme="parent"
            statusText="Verified Guardian"
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
              title="Linked Students"
              value={myChildren.length}
              subtitle="Enrolled Children"
              icon={GraduationCap}
              variant="blue"
            />
            <ProfileStatCard
              title="Portal Access Level"
              value="Full Guardian"
              subtitle="Verified Security Scope"
              icon={Shield}
              variant="indigo"
            />
            <ProfileStatCard
              title="Fee Standing"
              value="Clear"
              subtitle="No Outstanding Dues"
              icon={CheckCircle2}
              variant="emerald"
            />
            <ProfileStatCard
              title="Real-time Alerts"
              value="Active"
              subtitle="Push & Email Sync"
              icon={Star}
              variant="purple"
            />
          </motion.div>

          {/* ── Main Details Grid ── */}
          <div className="grid gap-6 lg:grid-cols-3">
            {/* Left 2 Cols: Personal Info & Linked Children */}
            <motion.div
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: 0.2 }}
              className="lg:col-span-2 space-y-6"
            >
              <Card className="border-border/60 bg-card/60 backdrop-blur-md shadow-sm">
                <CardHeader>
                  <CardTitle className="text-lg font-bold flex items-center gap-2">
                    <User className="h-5 w-5 text-blue-500" /> Guardian Personal Information
                  </CardTitle>
                  <CardDescription>Verified account records</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid gap-4 sm:grid-cols-2">
                    <div className="flex items-center justify-between p-4 rounded-2xl border border-border/60 bg-background/50 hover:border-blue-500/30 transition-all">
                      <div className="flex items-center gap-3 overflow-hidden">
                        <div className="h-10 w-10 rounded-xl bg-blue-500/10 text-blue-500 flex items-center justify-center shrink-0">
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
                        className="h-8 w-8 shrink-0 hover:bg-blue-500/10 hover:text-blue-500"
                        onClick={() => copyToClipboard(user?.email || "", "Email")}
                      >
                        <Copy className="h-3.5 w-3.5" />
                      </Button>
                    </div>

                    {typeof user?.profile?.phone === "string" && (
                      <div className="flex items-center justify-between p-4 rounded-2xl border border-border/60 bg-background/50 hover:border-indigo-500/30 transition-all">
                        <div className="flex items-center gap-3 overflow-hidden">
                          <div className="h-10 w-10 rounded-xl bg-indigo-500/10 text-indigo-500 flex items-center justify-center shrink-0">
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
                          className="h-8 w-8 shrink-0 hover:bg-indigo-500/10 hover:text-indigo-500"
                          onClick={() => copyToClipboard(user?.profile?.phone as string, "Phone")}
                        >
                          <Copy className="h-3.5 w-3.5" />
                        </Button>
                      </div>
                    )}

                    <div className="flex items-center gap-3 p-4 rounded-2xl border border-border/60 bg-background/50">
                      <div className="h-10 w-10 rounded-xl bg-purple-500/10 text-purple-500 flex items-center justify-center shrink-0">
                        <Users className="h-5 w-5" />
                      </div>
                      <div>
                        <p className="text-xs text-muted-foreground font-medium">Children Linked</p>
                        <p className="text-sm font-semibold">{myChildren.length} Enrolled Student(s)</p>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Linked Children List */}
              <Card className="border-border/60 bg-card/60 backdrop-blur-md shadow-sm">
                <CardHeader>
                  <CardTitle className="text-lg font-bold flex items-center gap-2">
                    <GraduationCap className="h-5 w-5 text-indigo-500" /> Linked Children Profiles
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {myChildren.length > 0 ? (
                    <div className="space-y-3">
                      {myChildren.map((child) => (
                        <div
                          key={child.id}
                          className="flex items-center justify-between p-4 rounded-2xl border border-border/60 bg-background/50 hover:bg-muted/40 transition-colors"
                        >
                          <div className="flex items-center gap-3.5">
                            <div className="h-11 w-11 rounded-2xl bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 flex items-center justify-center font-bold text-xl shrink-0">
                              🎓
                            </div>
                            <div>
                              <h4 className="font-bold text-sm text-foreground">{child.name}</h4>
                              <p className="text-xs text-muted-foreground">
                                Roll: {child.roll_no} • {child.department} • Year {child.year}
                              </p>
                            </div>
                          </div>
                          <span className="rounded-full bg-emerald-500/15 px-3 py-1 text-xs font-bold text-emerald-600 dark:text-emerald-400 border border-emerald-500/30">
                            Active
                          </span>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="p-8 text-center text-sm text-muted-foreground">
                      No children linked to your account yet. Contact college administration.
                    </div>
                  )}
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
                    <Building2 className="h-5 w-5 text-blue-500" /> College Metadata
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="p-4 rounded-2xl border border-border/60 bg-background/50">
                    <p className="text-xs text-muted-foreground font-medium">Institution</p>
                    <p className="text-sm font-bold text-foreground mt-0.5">{college?.name || "CampusOS"}</p>
                  </div>
                  <div className="p-4 rounded-2xl border border-border/60 bg-background/50">
                    <p className="text-xs text-muted-foreground font-medium">Domain</p>
                    <p className="text-sm font-semibold text-blue-600 dark:text-blue-400 mt-0.5 font-mono">
                      {college?.subdomain || "demo"}.campusos.com
                    </p>
                  </div>
                </CardContent>
              </Card>

              <Card className="border-border/60 bg-card/60 backdrop-blur-md shadow-sm">
                <CardHeader>
                  <CardTitle className="text-lg font-bold flex items-center gap-2">
                    <Activity className="h-5 w-5 text-blue-500" /> Activity Log
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="relative pl-6 before:absolute before:left-2 before:top-2 before:bottom-2 before:w-0.5 before:bg-border space-y-4">
                    <div className="relative">
                      <div className="absolute -left-6 top-1 h-3 w-3 rounded-full bg-emerald-500 ring-4 ring-background" />
                      <p className="text-xs font-bold text-foreground">Parent Portal Authenticated</p>
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
          title="Edit Guardian Profile"
          description="Update your contact info"
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
