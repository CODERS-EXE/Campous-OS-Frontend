"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { AlertCircle, Building2, CheckCircle2, GraduationCap, Loader2, Lock, Mail, User } from "lucide-react";
import { api, AuthResponse } from "@/lib/api";
import { useAuthStore } from "@/lib/store/auth";
import { getRoleDashboardPath } from "@/lib/utils";
import { CampusLogo } from "@/components/shared/CampusLogo";

// ─── Field component (same as login page) ─────────────────────────────────

interface FieldProps {
  id: string;
  label: string;
  type?: string;
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
  required?: boolean;
  autoComplete?: string;
  icon: React.ElementType;
  disabled?: boolean;
}

function Field({ id, label, type = "text", value, onChange, placeholder, required, autoComplete, icon: Icon, disabled }: FieldProps) {
  const [focused, setFocused] = useState(false);
  const hasValue = value.length > 0;
  return (
    <div className="space-y-1.5">
      <label htmlFor={id} className="text-sm font-medium text-foreground">{label}</label>
      <div className={`relative flex items-center rounded-xl border-2 bg-background transition-all duration-200
        ${focused ? "border-primary shadow-[0_0_0_3px_rgba(124,58,237,0.12)]"
          : hasValue ? "border-border hover:border-muted-foreground/40"
          : "border-input hover:border-muted-foreground/40"}
        ${disabled ? "opacity-60 cursor-not-allowed" : ""}`}>
        <span className={`absolute left-3.5 transition-colors duration-200 ${focused ? "text-primary" : "text-muted-foreground"}`}>
          <Icon className="h-4 w-4" />
        </span>
        <input
          id={id} type={type} value={value}
          onChange={(e) => onChange(e.target.value)}
          onFocus={() => setFocused(true)}
          onBlur={() => setFocused(false)}
          placeholder={placeholder} required={required}
          autoComplete={autoComplete} disabled={disabled}
          className="h-12 w-full bg-transparent pl-10 pr-4 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none disabled:cursor-not-allowed"
        />
      </div>
    </div>
  );
}

// ─── Register page ────────────────────────────────────────────────────────────

export default function RegisterPage() {
  const router = useRouter();
  const { login } = useAuthStore();

  const [name,       setName]       = useState("");
  const [email,      setEmail]      = useState("");
  const [password,   setPassword]   = useState("");
  const [subdomain,  setSubdomain]  = useState("");
  const [role,       setRole]       = useState("student");
  const [department, setDepartment] = useState("");
  const [rollNo,     setRollNo]     = useState("");
  const [year,       setYear]       = useState("");
  const [error,      setError]      = useState("");
  const [success,    setSuccess]    = useState(false);
  const [loading,    setLoading]    = useState(false);
  const [shake,      setShake]      = useState(0);

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const data = await api.post<AuthResponse>("/api/v1/auth/register", {
        name,
        email,
        password,
        college_subdomain: subdomain,
        role,
        department: department || undefined,
        roll_no: rollNo || undefined,
        year: year ? Number(year) : undefined,
      });
      setSuccess(true);
      login(data);
      router.push(getRoleDashboardPath(data.user.role));
    } catch (err) {
      setError(err instanceof Error ? err.message : "Registration failed");
      setShake((n) => n + 1);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-5 py-12 sm:px-8">
      <motion.div
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.55, ease: [0.22, 1, 0.36, 1] }}
        className="w-full max-w-md"
      >
        {/* Logo */}
        <div className="mb-8 flex justify-center">
          <CampusLogo />
        </div>

        {/* Heading */}
        <div className="mb-8 text-center">
          <h2 className="font-heading text-3xl font-bold tracking-tight">Create Account</h2>
          <p className="mt-1.5 text-muted-foreground text-sm">
            Register with your college
          </p>
        </div>

        {/* Card */}
        <motion.div
          key={shake}
          animate={shake > 0 ? { x: [-6, 6, -4, 4, -2, 2, 0] } : {}}
          transition={{ duration: 0.45 }}
          className="relative rounded-2xl border-2 bg-card/80 p-7 shadow-brand backdrop-blur-sm"
        >
          <div className="pointer-events-none absolute inset-x-0 top-0 h-px rounded-t-2xl bg-gradient-accent opacity-60" />

          <form onSubmit={handleRegister} className="space-y-4">
            <Field id="name"      label="Full Name"           value={name}      onChange={setName}      placeholder="Rahul Patil"          icon={User}       required autoComplete="name"         disabled={loading} />
            <Field id="subdomain" label="College Subdomain"    value={subdomain} onChange={setSubdomain} placeholder="gph, gtmc, gpn..."     icon={Building2}  required autoComplete="organization" disabled={loading} />
            <Field id="email"     label="Email Address"        value={email}     onChange={setEmail}     placeholder="you@college.edu"       icon={Mail}       required type="email" autoComplete="email" disabled={loading} />
            <Field id="password"  label="Password"             value={password}  onChange={setPassword}  placeholder="Min. 8 characters"    icon={Lock}       required type="password" autoComplete="new-password" disabled={loading} />

            {/* Role select */}
            <div className="space-y-1.5">
              <label htmlFor="role" className="text-sm font-medium text-foreground">Role</label>
              <select
                id="role"
                value={role}
                onChange={(e) => setRole(e.target.value)}
                disabled={loading}
                className="h-12 w-full rounded-xl border-2 border-input bg-background px-3 text-sm text-foreground focus:outline-none focus:border-primary transition-all duration-200 disabled:opacity-60"
              >
                <option value="student">Student</option>
                <option value="faculty">Faculty</option>
                <option value="parent">Parent</option>
              </select>
            </div>

            {/* Student-specific fields */}
            {role === "student" && (
              <>
                <Field id="department" label="Department" value={department} onChange={setDepartment} placeholder="Computer Engineering" icon={GraduationCap} autoComplete="off" disabled={loading} />
                <div className="grid grid-cols-2 gap-3">
                  <Field id="rollNo" label="Roll No" value={rollNo} onChange={setRollNo} placeholder="2353" icon={GraduationCap} autoComplete="off" disabled={loading} />
                  <Field id="year"   label="Year"    value={year}   onChange={setYear}   placeholder="1, 2, 3..."  icon={GraduationCap} type="number" autoComplete="off" disabled={loading} />
                </div>
              </>
            )}

            {/* Error / Success */}
            <AnimatePresence mode="wait">
              {error && (
                <motion.div key="err" initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} exit={{ opacity: 0, height: 0 }} transition={{ duration: 0.22 }} className="overflow-hidden">
                  <div className="flex items-start gap-3 rounded-xl border border-destructive/30 bg-destructive/8 px-4 py-3">
                    <AlertCircle className="mt-0.5 h-4 w-4 shrink-0 text-destructive" />
                    <p className="text-sm text-destructive">{error}</p>
                  </div>
                </motion.div>
              )}
              {success && (
                <motion.div key="ok" initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} exit={{ opacity: 0, height: 0 }} transition={{ duration: 0.22 }} className="overflow-hidden">
                  <div className="flex items-center gap-3 rounded-xl border border-emerald-500/30 bg-emerald-500/8 px-4 py-3">
                    <CheckCircle2 className="h-4 w-4 shrink-0 text-emerald-500" />
                    <p className="text-sm text-emerald-600 dark:text-emerald-400">Registration successful! Redirecting…</p>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Submit */}
            <button
              type="submit"
              disabled={loading || success}
              className="relative w-full overflow-hidden rounded-xl bg-gradient-primary py-3.5 text-sm font-semibold text-white shadow-brand transition-all duration-200 hover:shadow-lg hover:scale-[1.01] focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 disabled:opacity-70 disabled:cursor-not-allowed disabled:scale-100"
            >
              <span className="flex items-center justify-center gap-2">
                {loading ? <><Loader2 className="h-4 w-4 animate-spin" /> Registering…</> :
                 success  ? <><CheckCircle2 className="h-4 w-4" /> Redirecting…</> :
                 "Create Account"}
              </span>
            </button>
          </form>
        </motion.div>

        {/* Back to login */}
        <p className="mt-6 text-center text-sm text-muted-foreground">
          Already have an account?{" "}
          <Link href="/login" className="font-semibold text-primary hover:underline underline-offset-4">
            Sign In
          </Link>
        </p>
      </motion.div>
    </div>
  );
}
