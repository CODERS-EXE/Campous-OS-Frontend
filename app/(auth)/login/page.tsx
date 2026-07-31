"use client";

import { Suspense, useEffect, useRef, useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import {
  AlertCircle, BookOpen, Brain, Building2, CheckCircle2,
  ChevronRight, Eye, EyeOff, GraduationCap, Loader2,
  Lock, Mail, Shield, Sparkles, Users, Wifi,
} from "lucide-react";
import { api, AuthResponse } from "@/lib/api";
import { useAuthStore } from "@/lib/store/auth";
import { getRoleDashboardPath } from "@/lib/utils";
import { CampusLogo } from "@/components/shared/CampusLogo";
import { FormField, PasswordField, SubmitButton } from "@/components/shared/forms";

// ─── Left panel illustration ──────────────────────────────────────────────────

const FEATURES = [
  { icon: GraduationCap, label: "Multi-tenant isolation per college" },
  { icon: Brain,         label: "AI assistant trained on your syllabus" },
  { icon: Shield,        label: "Enterprise RBAC & JWT security" },
  { icon: Wifi,          label: "Real-time WebSocket notifications" },
  { icon: BookOpen,      label: "Library, fees & exam management" },
  { icon: Users,         label: "Students, faculty, warden portals" },
];

const STATS = [
  { value: "50K+",  label: "Students"    },
  { value: "500+",  label: "Institutions" },
  { value: "99.9%", label: "Uptime"      },
];

// ─── Floating orb background (left panel only) ────────────────────────────────

function LeftBackground() {
  return (
    <>
      {/* Grid */}
      <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.04)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.04)_1px,transparent_1px)] bg-[size:48px_48px]" />
      {/* Orbs */}
      <motion.div
        className="absolute -top-24 -right-24 h-72 w-72 rounded-full bg-white/10"
        animate={{ scale: [1, 1.12, 1], rotate: [0, 15, 0] }}
        transition={{ duration: 14, repeat: Infinity, ease: "easeInOut" }}
      />
      <motion.div
        className="absolute bottom-12 -left-16 h-56 w-56 rounded-full bg-white/8"
        animate={{ scale: [1, 1.18, 1] }}
        transition={{ duration: 18, repeat: Infinity, ease: "easeInOut", delay: 3 }}
      />
      <motion.div
        className="absolute top-1/2 right-8 h-32 w-32 rounded-full bg-purple-300/15"
        animate={{ y: [-16, 16, -16] }}
        transition={{ duration: 8, repeat: Infinity, ease: "easeInOut", delay: 1 }}
      />
      {/* Floating shapes */}
      {[
        { size: 48, top: "18%", left: "8%",   delay: 0   },
        { size: 32, top: "60%", left: "70%",  delay: 2   },
        { size: 56, top: "78%", left: "12%",  delay: 1.5 },
      ].map((s, i) => (
        <motion.div
          key={i}
          className="absolute rounded-xl border-2 border-white/15 rotate-45"
          style={{ width: s.size, height: s.size, top: s.top, left: s.left }}
          animate={{ y: [-10, 10, -10], rotate: [45, 60, 45] }}
          transition={{ duration: 9 + i * 2, repeat: Infinity, ease: "easeInOut", delay: s.delay }}
        />
      ))}
    </>
  );
}


// ─── Left panel ───────────────────────────────────────────────────────────────

function LeftPanel() {
  return (
    <div className="relative hidden lg:flex lg:w-[52%] xl:w-1/2 flex-col justify-between overflow-hidden bg-gradient-primary p-12 xl:p-16">
      <LeftBackground />

      {/* Top — Logo */}
      <div className="relative z-10">
        <div className="flex items-center gap-3">
          <CampusLogo variant="icon" className="h-10 w-10 brightness-0 invert" />
          <span className="font-heading text-2xl font-bold text-white">CampusOS</span>
        </div>
      </div>

      {/* Middle — Headline + feature list */}
      <div className="relative z-10 space-y-10">
        <div className="space-y-4">
          <motion.h1
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.3, duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
            className="font-heading text-5xl xl:text-6xl font-bold text-white leading-[1.1]"
          >
            Your Campus,<br />One Platform.
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.45, duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
            className="text-white/80 text-lg max-w-sm leading-relaxed"
          >
            Streamline operations, empower students, and drive institutional excellence with AI.
          </motion.p>
        </div>

        {/* Feature list */}
        <motion.ul
          initial="hidden"
          animate="show"
          variants={{ hidden: {}, show: { transition: { staggerChildren: 0.08, delayChildren: 0.6 } } }}
          className="space-y-3"
        >
          {FEATURES.map(({ icon: Icon, label }) => (
            <motion.li
              key={label}
              variants={{ hidden: { opacity: 0, x: -16 }, show: { opacity: 1, x: 0, transition: { duration: 0.5 } } }}
              className="flex items-center gap-3"
            >
              <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-white/15 backdrop-blur-sm">
                <Icon className="h-4 w-4 text-white" />
              </span>
              <span className="text-sm text-white/90 font-medium">{label}</span>
            </motion.li>
          ))}
        </motion.ul>
      </div>

      {/* Bottom — Stats */}
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 1.1, duration: 0.6 }}
        className="relative z-10 flex gap-8 border-t border-white/20 pt-8"
      >
        {STATS.map(({ value, label }) => (
          <div key={label}>
            <div className="font-heading text-2xl font-bold text-white">{value}</div>
            <div className="text-xs text-white/70 mt-0.5">{label}</div>
          </div>
        ))}
      </motion.div>
    </div>
  );
}


// ─── Reusable premium input field ────────────────────────────────────────────

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
  rightSlot?: React.ReactNode;
  disabled?: boolean;
}

function Field({
  id, label, type = "text", value, onChange, placeholder,
  required, autoComplete, icon: Icon, rightSlot, disabled,
}: FieldProps) {
  const [focused, setFocused] = useState(false);
  const hasValue = value.length > 0;

  return (
    <div className="space-y-1.5">
      <label htmlFor={id} className="text-sm font-medium text-foreground">
        {label}
      </label>
      <div className={`relative flex items-center rounded-xl border-2 bg-background transition-all duration-200 ${
        focused
          ? "border-primary shadow-[0_0_0_3px_rgba(124,58,237,0.12)]"
          : hasValue
          ? "border-border hover:border-muted-foreground/40"
          : "border-input hover:border-muted-foreground/40"
      } ${disabled ? "opacity-60 cursor-not-allowed" : ""}`}>
        {/* Left icon */}
        <span className={`absolute left-3.5 transition-colors duration-200 ${
          focused ? "text-primary" : "text-muted-foreground"
        }`}>
          <Icon className="h-4 w-4" />
        </span>
        <input
          id={id}
          type={type}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          onFocus={() => setFocused(true)}
          onBlur={() => setFocused(false)}
          placeholder={placeholder}
          required={required}
          autoComplete={autoComplete}
          disabled={disabled}
          className="h-12 w-full bg-transparent pl-10 pr-10 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none disabled:cursor-not-allowed"
        />
        {/* Right slot */}
        {rightSlot && (
          <span className="absolute right-3.5">{rightSlot}</span>
        )}
      </div>
    </div>
  );
}


// ─── Demo credentials quick-fill ─────────────────────────────────────────────

const DEMO_ACCOUNTS = [
  { label: "Super Admin",  email: "admin@campusos.com", password: "Admin@123",  subdomain: ""     },
  { label: "Student",      email: "alice@demo.edu",     password: "Demo@123",   subdomain: "demo" },
  { label: "Faculty",      email: "bob@demo.edu",       password: "Demo@123",   subdomain: "demo" },
];

interface DemoFillProps {
  onFill: (email: string, password: string, subdomain: string) => void;
  disabled: boolean;
}

function DemoFill({ onFill, disabled }: DemoFillProps) {
  const [open, setOpen] = useState(false);

  return (
    <div className="relative">
      <button
        type="button"
        disabled={disabled}
        onClick={() => setOpen((o) => !o)}
        className="w-full flex items-center justify-between rounded-xl border border-dashed border-border bg-muted/40 px-4 py-3 text-sm text-muted-foreground hover:bg-muted/70 hover:text-foreground transition-all duration-200 disabled:opacity-50"
      >
        <span className="flex items-center gap-2">
          <Sparkles className="h-3.5 w-3.5 text-primary" />
          Demo credentials — quick fill
        </span>
        <motion.span animate={{ rotate: open ? 180 : 0 }} transition={{ duration: 0.2 }}>
          <ChevronRight className="h-3.5 w-3.5 rotate-90" />
        </motion.span>
      </button>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: -8, scaleY: 0.95 }}
            animate={{ opacity: 1, y: 0, scaleY: 1 }}
            exit={{ opacity: 0, y: -4, scaleY: 0.97 }}
            transition={{ duration: 0.18 }}
            style={{ transformOrigin: "top" }}
            className="absolute top-full left-0 right-0 z-20 mt-2 overflow-hidden rounded-xl border bg-card shadow-xl"
          >
            {DEMO_ACCOUNTS.map((acc) => (
              <button
                key={acc.label}
                type="button"
                onClick={() => { onFill(acc.email, acc.password, acc.subdomain); setOpen(false); }}
                className="group w-full flex items-center justify-between px-4 py-3 text-left text-sm hover:bg-muted/60 transition-colors border-b last:border-b-0 border-border/50"
              >
                <div>
                  <span className="font-medium text-foreground">{acc.label}</span>
                  <span className="ml-2 text-xs text-muted-foreground">{acc.email}</span>
                </div>
                <ChevronRight className="h-3.5 w-3.5 text-muted-foreground group-hover:text-primary group-hover:translate-x-0.5 transition-all" />
              </button>
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}


// ─── Main form ────────────────────────────────────────────────────────────────

function LoginForm() {
  const router       = useRouter();
  const searchParams = useSearchParams();
  const { login, isAuthenticated, user } = useAuthStore();

  // ── Form state ──
  const [email,     setEmail]     = useState("");
  const [password,  setPassword]  = useState("");
  const [subdomain, setSubdomain] = useState("demo");
  const [rememberMe, setRememberMe] = useState(false);
  const [showPwd,   setShowPwd]   = useState(false);
  const [error,     setError]     = useState("");
  const [success,   setSuccess]   = useState(false);
  const [loading,   setLoading]   = useState(false);

  // ── Track how many times the user has shaken the form (wrong password) ──
  const [shake, setShake] = useState(0);

  // ── Pre-fill from ?demo=true ──
  useEffect(() => {
    if (searchParams.get("demo") === "true") {
      setEmail("alice@demo.edu");
      setPassword("Demo@123");
      setSubdomain("demo");
    }
  }, [searchParams]);

  // ── Redirect if already authenticated ──
  useEffect(() => {
    if (isAuthenticated && user) {
      router.replace(getRoleDashboardPath(user.role));
    }
  }, [isAuthenticated, user, router]);

  // ── Authentication — unchanged logic ──
  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const data = await api.post<AuthResponse>("/api/v1/auth/login", {
        email,
        password,
        college_subdomain: subdomain || undefined,
      });
      setSuccess(true);
      login(data);
      router.push(getRoleDashboardPath(data.user.role));
    } catch (err) {
      setError(err instanceof Error ? err.message : "Login failed");
      setShake((n) => n + 1);
    } finally {
      setLoading(false);
    }
  };

  const fillDemo = (e: string, p: string, s: string) => {
    setEmail(e); setPassword(p); setSubdomain(s); setError("");
  };

  return (
    <div className="flex min-h-screen">
      <LeftPanel />

      {/* ── Right: form panel ───────────────────────────────────────────── */}
      <div className="flex flex-1 flex-col items-center justify-center overflow-y-auto bg-background px-5 py-12 sm:px-8">
        {/* Mobile logo */}
        <div className="mb-8 lg:hidden">
          <CampusLogo />
        </div>

        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.55, ease: [0.22, 1, 0.36, 1] }}
          className="w-full max-w-md"
        >
          {/* Heading */}
          <div className="mb-8">
            <h2 className="font-heading text-3xl font-bold tracking-tight">Welcome back</h2>
            <p className="mt-1.5 text-muted-foreground text-sm">
              Sign in to your campus workspace
            </p>
          </div>

          {/* Glassmorphism card */}
          <motion.div
            key={shake}
            animate={shake > 0 ? { x: [-6, 6, -4, 4, -2, 2, 0] } : {}}
            transition={{ duration: 0.45 }}
            className="relative rounded-2xl border-2 bg-card/80 p-7 shadow-brand backdrop-blur-sm"
          >
            {/* Subtle gradient top edge */}
            <div className="pointer-events-none absolute inset-x-0 top-0 h-px rounded-t-2xl bg-gradient-accent opacity-60" />

            <form onSubmit={handleLogin} className="space-y-5">
              {/* College Subdomain */}
              <FormField
                id="subdomain"
                label="College Subdomain"
                value={subdomain}
                onChange={setSubdomain}
                placeholder="e.g. demo"
                autoComplete="organization"
                icon={Building2}
                disabled={loading}
              />

              {/* Email */}
              <FormField
                id="email"
                label="Email Address"
                type="email"
                value={email}
                onChange={setEmail}
                placeholder="you@college.edu"
                required
                autoComplete="email"
                icon={Mail}
                disabled={loading}
              />

              {/* Password */}
              <PasswordField
                id="password"
                label="Password"
                value={password}
                onChange={setPassword}
                placeholder="••••••••"
                required
                autoComplete="current-password"
                disabled={loading}
              />

              {/* Remember me + Forgot password row */}
              <div className="flex items-center justify-between">
                <label className="flex cursor-pointer items-center gap-2.5 select-none">
                  <div
                    onClick={() => !loading && setRememberMe((v) => !v)}
                    className={`relative flex h-5 w-5 shrink-0 items-center justify-center rounded-md border-2 transition-all duration-200 cursor-pointer ${
                      rememberMe
                        ? "border-primary bg-gradient-primary"
                        : "border-input bg-background hover:border-muted-foreground/50"
                    }`}
                  >
                    <AnimatePresence>
                      {rememberMe && (
                        <motion.svg
                          initial={{ scale: 0, opacity: 0 }}
                          animate={{ scale: 1, opacity: 1 }}
                          exit={{ scale: 0, opacity: 0 }}
                          transition={{ duration: 0.15 }}
                          viewBox="0 0 10 8"
                          fill="none"
                          className="h-3 w-3"
                        >
                          <path d="M1 4L3.5 6.5L9 1" stroke="white" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
                        </motion.svg>
                      )}
                    </AnimatePresence>
                  </div>
                  <span className="text-sm text-muted-foreground">Remember me</span>
                </label>
                <Link
                  href="#"
                  className="text-sm font-medium text-primary hover:underline underline-offset-4 transition-colors"
                >
                  Forgot password?
                </Link>
              </div>

              {/* Error banner */}
              <AnimatePresence mode="wait">
                {error && (
                  <motion.div
                    key="error"
                    initial={{ opacity: 0, height: 0, y: -4 }}
                    animate={{ opacity: 1, height: "auto", y: 0 }}
                    exit={{ opacity: 0, height: 0 }}
                    transition={{ duration: 0.22 }}
                    className="overflow-hidden"
                  >
                    <div className="flex items-start gap-3 rounded-xl border border-destructive/30 bg-destructive/8 px-4 py-3">
                      <AlertCircle className="mt-0.5 h-4 w-4 shrink-0 text-destructive" />
                      <p className="text-sm text-destructive leading-relaxed">{error}</p>
                    </div>
                  </motion.div>
                )}
                {success && (
                  <motion.div
                    key="success"
                    initial={{ opacity: 0, height: 0, y: -4 }}
                    animate={{ opacity: 1, height: "auto", y: 0 }}
                    exit={{ opacity: 0, height: 0 }}
                    transition={{ duration: 0.22 }}
                    className="overflow-hidden"
                  >
                    <div className="flex items-center gap-3 rounded-xl border border-emerald-500/30 bg-emerald-500/8 px-4 py-3">
                      <CheckCircle2 className="h-4 w-4 shrink-0 text-emerald-500" />
                      <p className="text-sm text-emerald-600 dark:text-emerald-400">Signed in! Redirecting…</p>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Submit button */}
              <SubmitButton
                type="submit"
                isLoading={loading}
                isSuccess={success}
                loadingText="Signing in…"
                successText="Redirecting…"
                fullWidth
                size="lg"
              >
                Sign In to CampusOS
              </SubmitButton>
            </form>

            {/* Divider */}
            <div className="my-5 flex items-center gap-3">
              <div className="flex-1 border-t border-border/60" />
              <span className="text-xs text-muted-foreground">or try a demo account</span>
              <div className="flex-1 border-t border-border/60" />
            </div>

            {/* Demo quick-fill */}
            <DemoFill onFill={fillDemo} disabled={loading} />
          </motion.div>

          {/* Terms */}
          <p className="mt-7 text-center text-xs text-muted-foreground">
            By signing in, you agree to our{" "}
            <Link href="#" className="font-medium text-primary hover:underline underline-offset-4">Terms of Service</Link>
            {" "}and{" "}
            <Link href="#" className="font-medium text-primary hover:underline underline-offset-4">Privacy Policy</Link>
          </p>
        </motion.div>
      </div>
    </div>
  );
}


// ─── Page export ─────────────────────────────────────────────────────────────

export default function LoginPage() {
  return (
    <Suspense fallback={
      <div className="flex min-h-screen items-center justify-center bg-background">
        <motion.div
          animate={{ opacity: [0.4, 1, 0.4] }}
          transition={{ duration: 1.8, repeat: Infinity, ease: "easeInOut" }}
        >
          <CampusLogo />
        </motion.div>
      </div>
    }>
      <LoginForm />
    </Suspense>
  );
}
