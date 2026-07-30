"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { motion, useInView, useScroll, useTransform, AnimatePresence } from "framer-motion";
import {
  ArrowRight, BookOpen, Brain, Bus, ChevronDown, GraduationCap, Menu,
  Moon, Shield, Sparkles, Star, Sun, Users, X, Zap,
  BarChart3, Bell, Clock, Globe, Lock, Wifi,
} from "lucide-react";
import { useTheme } from "next-themes";
import { Button } from "@/components/ui/button";
import { CampusLogo } from "@/components/shared/CampusLogo";


// ─── Data ────────────────────────────────────────────────────────────────────

const NAV_LINKS = [
  { href: "#features", label: "Features" },
  { href: "#stats",    label: "Why CampusOS" },
  { href: "#testimonials", label: "Testimonials" },
  { href: "#pricing",  label: "Pricing" },
];

const STATS = [
  { value: "50K+",  label: "Active Students",    icon: Users },
  { value: "500+",  label: "Institutions",        icon: GraduationCap },
  { value: "99.9%", label: "Uptime SLA",          icon: Wifi },
  { value: "4.9★",  label: "Average Rating",      icon: Star },
];

const FEATURES = [
  {
    icon: GraduationCap,
    color: "from-violet-500 to-purple-600",
    title: "Multi-College Platform",
    description:
      "Each college gets an isolated workspace with custom branding, on one shared SaaS infrastructure with zero cross-tenant data leakage.",
  },
  {
    icon: Brain,
    color: "from-blue-500 to-indigo-600",
    title: "AI Campus Assistant",
    description:
      "RAG-powered chatbot trained on your college's syllabus, circulars, timetables, and announcements — available 24/7.",
  },
  {
    icon: Bus,
    color: "from-emerald-500 to-teal-600",
    title: "Smart Campus",
    description:
      "Live GPS bus tracking, QR-code attendance, hostel outpass workflows, and real-time WebSocket notifications.",
  },
  {
    icon: Shield,
    color: "from-orange-500 to-red-500",
    title: "Enterprise Security",
    description:
      "Tenant-scoped data isolation, RBAC with six roles, JWT auth with refresh tokens enforced at every API layer.",
  },
  {
    icon: BarChart3,
    color: "from-pink-500 to-rose-600",
    title: "Advanced Analytics",
    description:
      "Real-time dashboards for fees collection, exam performance, placement drives, and library usage.",
  },
  {
    icon: Bell,
    color: "from-amber-500 to-yellow-500",
    title: "Real-Time Notifications",
    description:
      "WebSocket-powered push alerts for assignments, fees, results, attendance, and emergency broadcasts.",
  },
  {
    icon: BookOpen,
    color: "from-cyan-500 to-blue-500",
    title: "Library Management",
    description:
      "Digital catalogue, issue/return workflows, overdue fine automation, and analytics on reading trends.",
  },
  {
    icon: Globe,
    color: "from-lime-500 to-green-600",
    title: "Placement Portal",
    description:
      "Company drives, student applications, interview scheduling, offer letters, and placement analytics — end to end.",
  },
];

const TESTIMONIALS = [
  {
    name: "Dr. Priya Sharma",
    role: "Principal, MIT College of Engineering",
    avatar: "PS",
    rating: 5,
    text: "CampusOS transformed how we manage 8,000 students. The AI assistant alone saved our admin staff 40 hours a week. Remarkable platform.",
  },
  {
    name: "Prof. Rajan Mehta",
    role: "Dean of Academics, VJTI Mumbai",
    avatar: "RM",
    rating: 5,
    text: "Attendance tracking, exam results, and fee management — all in one place. Our faculty productivity went up by 60% in the first semester.",
  },
  {
    name: "Ms. Ananya Patel",
    role: "IT Head, Nirma University",
    avatar: "AP",
    rating: 5,
    text: "The tenant isolation architecture is rock-solid. Security audits passed on the first attempt. The team's support is also exceptional.",
  },
];

const PARTNERS = [
  "IIT Bombay", "NIT Nagpur", "VIT Vellore",
  "Manipal University", "BITS Pilani", "Anna University",
];


// ─── Animation variants ───────────────────────────────────────────────────────

const fadeUp = {
  hidden: { opacity: 0, y: 28 },
  show:   { opacity: 1, y: 0,  transition: { duration: 0.6, ease: [0.22, 1, 0.36, 1] } },
};

const stagger = (delayChildren = 0.1) => ({
  hidden: {},
  show:   { transition: { staggerChildren: delayChildren } },
});

// ─── Helpers ──────────────────────────────────────────────────────────────────

function useScrolled(threshold = 20) {
  const [scrolled, setScrolled] = useState(false);
  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > threshold);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, [threshold]);
  return scrolled;
}

function AnimatedCounter({ to, suffix = "" }: { to: number; suffix?: string }) {
  const ref = useRef<HTMLSpanElement>(null);
  const inView = useInView(ref, { once: true, margin: "-80px" });
  const [count, setCount] = useState(0);

  useEffect(() => {
    if (!inView) return;
    let start = 0;
    const duration = 1600;
    const step = Math.ceil(to / (duration / 16));
    const timer = setInterval(() => {
      start += step;
      if (start >= to) { setCount(to); clearInterval(timer); }
      else setCount(start);
    }, 16);
    return () => clearInterval(timer);
  }, [inView, to]);

  return <span ref={ref}>{count}{suffix}</span>;
}


// ─── Navbar ───────────────────────────────────────────────────────────────────

function Navbar() {
  const scrolled = useScrolled();
  const [mobileOpen, setMobileOpen] = useState(false);
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  return (
    <header className={`fixed inset-x-0 top-0 z-50 transition-all duration-300 ${
      scrolled
        ? "bg-background/90 backdrop-blur-xl border-b border-border/60 shadow-sm"
        : "bg-transparent"
    }`}>
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 md:px-6">
        {/* Logo */}
        <Link href="/" className="transition-opacity hover:opacity-80">
          <CampusLogo />
        </Link>

        {/* Desktop nav */}
        <nav className="hidden items-center gap-1 md:flex">
          {NAV_LINKS.map((l) => (
            <Link
              key={l.href}
              href={l.href}
              className="rounded-lg px-3 py-2 text-sm font-medium text-muted-foreground hover:text-foreground hover:bg-accent/40 transition-all duration-200"
            >
              {l.label}
            </Link>
          ))}
        </nav>

        {/* Desktop right */}
        <div className="hidden items-center gap-3 md:flex">
          {mounted && (
            <button
              onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
              className="rounded-lg p-2 text-muted-foreground hover:text-foreground hover:bg-accent/40 transition-all"
              aria-label="Toggle theme"
            >
              {theme === "dark" ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
            </button>
          )}
          <Link href="/login">
            <Button variant="ghost" size="sm" className="font-medium">Sign In</Button>
          </Link>
          <Link href="/login?demo=true">
            <Button size="sm" className="shadow-brand font-medium gap-1.5">
              Get Demo <ArrowRight className="h-3.5 w-3.5" />
            </Button>
          </Link>
        </div>

        {/* Mobile burger */}
        <button
          className="rounded-lg p-2 md:hidden text-muted-foreground hover:text-foreground"
          onClick={() => setMobileOpen(true)}
          aria-label="Open menu"
        >
          <Menu className="h-5 w-5" />
        </button>
      </div>

      {/* Mobile menu */}
      <AnimatePresence>
        {mobileOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm md:hidden"
              onClick={() => setMobileOpen(false)}
            />
            <motion.div
              initial={{ x: "100%" }} animate={{ x: 0 }} exit={{ x: "100%" }}
              transition={{ type: "spring", damping: 30, stiffness: 300 }}
              className="fixed inset-y-0 right-0 z-50 w-72 bg-card border-l shadow-2xl flex flex-col md:hidden"
            >
              <div className="flex items-center justify-between p-4 border-b">
                <CampusLogo />
                <button onClick={() => setMobileOpen(false)} aria-label="Close menu">
                  <X className="h-5 w-5 text-muted-foreground" />
                </button>
              </div>
              <nav className="flex-1 p-4 space-y-1">
                {NAV_LINKS.map((l) => (
                  <Link
                    key={l.href}
                    href={l.href}
                    onClick={() => setMobileOpen(false)}
                    className="flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium text-muted-foreground hover:text-foreground hover:bg-muted transition-all"
                  >
                    {l.label}
                  </Link>
                ))}
              </nav>
              <div className="p-4 border-t space-y-2">
                <Link href="/login" onClick={() => setMobileOpen(false)}>
                  <Button variant="outline" className="w-full">Sign In</Button>
                </Link>
                <Link href="/login?demo=true" onClick={() => setMobileOpen(false)}>
                  <Button className="w-full shadow-brand gap-2">Get Demo <ArrowRight className="h-4 w-4" /></Button>
                </Link>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </header>
  );
}


// ─── Animated background ─────────────────────────────────────────────────────

function Background() {
  return (
    <div className="pointer-events-none absolute inset-0 -z-10 overflow-hidden">
      {/* Grid pattern */}
      <div className="absolute inset-0 bg-[linear-gradient(rgba(124,58,237,0.04)_1px,transparent_1px),linear-gradient(90deg,rgba(124,58,237,0.04)_1px,transparent_1px)] bg-[size:72px_72px] dark:bg-[linear-gradient(rgba(124,58,237,0.07)_1px,transparent_1px),linear-gradient(90deg,rgba(124,58,237,0.07)_1px,transparent_1px)]" />

      {/* Gradient orbs */}
      <motion.div
        className="absolute -top-40 -right-40 h-[600px] w-[600px] rounded-full opacity-30 dark:opacity-20"
        style={{ background: "radial-gradient(circle, hsl(250 84% 54%), transparent 70%)" }}
        animate={{ scale: [1, 1.08, 1], rotate: [0, 10, 0] }}
        transition={{ duration: 14, repeat: Infinity, ease: "easeInOut" }}
      />
      <motion.div
        className="absolute top-1/3 -left-40 h-[500px] w-[500px] rounded-full opacity-20 dark:opacity-15"
        style={{ background: "radial-gradient(circle, hsl(270 70% 65%), transparent 70%)" }}
        animate={{ scale: [1, 1.12, 1], rotate: [0, -8, 0] }}
        transition={{ duration: 18, repeat: Infinity, ease: "easeInOut", delay: 2 }}
      />
      <motion.div
        className="absolute bottom-0 right-1/4 h-[400px] w-[400px] rounded-full opacity-15 dark:opacity-10"
        style={{ background: "radial-gradient(circle, hsl(220 90% 60%), transparent 70%)" }}
        animate={{ scale: [1, 1.15, 1] }}
        transition={{ duration: 12, repeat: Infinity, ease: "easeInOut", delay: 4 }}
      />

      {/* Floating geometric shapes */}
      {[
        { size: 64,  top: "12%",  left: "8%",   delay: 0,   color: "border-violet-400/30 dark:border-violet-500/20" },
        { size: 40,  top: "25%",  right: "12%",  delay: 1.5, color: "border-purple-400/30 dark:border-purple-500/20" },
        { size: 56,  top: "60%",  left: "5%",   delay: 3,   color: "border-indigo-400/30 dark:border-indigo-500/20" },
        { size: 32,  bottom: "20%", right: "8%", delay: 2,   color: "border-violet-400/20 dark:border-violet-500/15" },
        { size: 48,  top: "75%",  left: "30%",  delay: 0.5, color: "border-purple-400/25 dark:border-purple-500/15" },
      ].map((s, i) => (
        <motion.div
          key={i}
          className={`absolute rounded-xl border-2 rotate-45 ${s.color}`}
          style={{ width: s.size, height: s.size, top: s.top, left: s.left, right: (s as { right?: string }).right, bottom: (s as { bottom?: string }).bottom }}
          animate={{ y: [-12, 12, -12], rotate: [45, 60, 45] }}
          transition={{ duration: 8 + i * 1.5, repeat: Infinity, ease: "easeInOut", delay: s.delay }}
        />
      ))}

      {/* Noise overlay for texture */}
      <div className="absolute inset-0 bg-background/40" />
    </div>
  );
}


// ─── AI Education Banner ─────────────────────────────────────────────────────

function AiBanner() {
  return (
    <motion.div
      initial={{ opacity: 0, y: -8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.2, duration: 0.5 }}
      className="flex justify-center pt-28 pb-4 px-4"
    >
      <Link href="/login?demo=true" className="group">
        <div className="inline-flex items-center gap-2.5 rounded-full border border-primary/25 bg-gradient-to-r from-primary/10 via-accent/10 to-primary/10 px-4 py-2 text-sm backdrop-blur-sm hover:border-primary/50 hover:from-primary/15 hover:to-accent/15 transition-all duration-300">
          <span className="flex h-5 w-5 items-center justify-center rounded-full bg-gradient-primary">
            <Sparkles className="h-3 w-3 text-white" />
          </span>
          <span className="font-medium gradient-text">Introducing AI-Powered Campus Intelligence</span>
          <span className="hidden sm:inline text-muted-foreground">—</span>
          <span className="hidden sm:inline text-sm text-muted-foreground group-hover:text-foreground transition-colors">
            See it in action
          </span>
          <ArrowRight className="h-3.5 w-3.5 text-primary group-hover:translate-x-0.5 transition-transform" />
        </div>
      </Link>
    </motion.div>
  );
}

// ─── Hero ─────────────────────────────────────────────────────────────────────

function Hero() {
  const { scrollY } = useScroll();
  const y       = useTransform(scrollY, [0, 400], [0, 80]);
  const opacity = useTransform(scrollY, [0, 300], [1, 0]);

  return (
    <section className="relative min-h-[90vh] flex items-center justify-center px-4 pb-16">
      <Background />
      <motion.div style={{ y, opacity }} className="mx-auto max-w-5xl text-center">
        <motion.h1
          variants={fadeUp}
          initial="hidden"
          animate="show"
          className="font-heading text-5xl sm:text-6xl md:text-7xl lg:text-8xl font-bold tracking-tight leading-[1.08] mb-6"
        >
          Your Campus,
          <br />
          <span className="gradient-text">One Platform.</span>
        </motion.h1>

        <motion.p
          variants={fadeUp}
          initial="hidden"
          animate="show"
          transition={{ delay: 0.15 }}
          className="mx-auto max-w-2xl text-lg sm:text-xl text-muted-foreground leading-relaxed mb-10"
        >
          Premium multi-tenant campus operating system. Attendance, academics, bus tracking,
          hostel, library, placements, and AI assistants — unified under one roof.
        </motion.p>

        <motion.div
          variants={fadeUp}
          initial="hidden"
          animate="show"
          transition={{ delay: 0.25 }}
          className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-8"
        >
          <Link href="/login?demo=true">
            <Button size="lg" className="h-13 px-8 text-base font-semibold shadow-brand gap-2 group">
              Start for Free
              <ArrowRight className="h-4 w-4 group-hover:translate-x-0.5 transition-transform" />
            </Button>
          </Link>
          <Link href="/login">
            <Button size="lg" variant="outline" className="h-13 px-8 text-base font-medium border-2">
              Sign In to Campus
            </Button>
          </Link>
        </motion.div>

        <motion.p
          variants={fadeUp}
          initial="hidden"
          animate="show"
          transition={{ delay: 0.35 }}
          className="text-sm text-muted-foreground flex items-center justify-center gap-2"
        >
          <Lock className="h-3.5 w-3.5" /> No credit card required &nbsp;·&nbsp;
          <Clock className="h-3.5 w-3.5" /> Setup in 5 minutes &nbsp;·&nbsp;
          <Zap className="h-3.5 w-3.5 text-primary" /> Free tier forever
        </motion.p>

        {/* Scroll hint */}
        <motion.div
          className="mt-16 flex justify-center"
          animate={{ y: [0, 8, 0] }}
          transition={{ duration: 2, repeat: Infinity }}
        >
          <ChevronDown className="h-6 w-6 text-muted-foreground/50" />
        </motion.div>
      </motion.div>
    </section>
  );
}


// ─── Stats ────────────────────────────────────────────────────────────────────

function Stats() {
  const ref  = useRef(null);
  const inView = useInView(ref, { once: true, margin: "-60px" });

  const statValues: Record<string, { to: number; suffix: string }> = {
    "50K+":  { to: 50,  suffix: "K+" },
    "500+":  { to: 500, suffix: "+" },
    "99.9%": { to: 99,  suffix: ".9%" },
    "4.9★":  { to: 49,  suffix: "" },
  };

  return (
    <section id="stats" className="py-20 px-4">
      <div className="mx-auto max-w-6xl">
        <motion.div
          ref={ref}
          variants={stagger(0.12)}
          initial="hidden"
          animate={inView ? "show" : "hidden"}
          className="grid grid-cols-2 lg:grid-cols-4 gap-6"
        >
          {STATS.map(({ value, label, icon: Icon }) => {
            const sv = statValues[value];
            return (
              <motion.div
                key={label}
                variants={fadeUp}
                className="relative group"
              >
                <div className="rounded-2xl border-2 bg-card p-6 text-center hover:border-primary/40 hover:shadow-brand transition-all duration-300">
                  <div className="mx-auto mb-3 flex h-11 w-11 items-center justify-center rounded-xl bg-gradient-primary shadow-brand">
                    <Icon className="h-5 w-5 text-white" />
                  </div>
                  <div className="font-heading text-3xl font-bold gradient-text mb-1">
                    {sv ? (
                      inView ? (
                        value.startsWith("4.9") ? "4.9★" : <AnimatedCounter to={sv.to} suffix={sv.suffix} />
                      ) : "0"
                    ) : value}
                  </div>
                  <div className="text-sm text-muted-foreground font-medium">{label}</div>
                </div>
              </motion.div>
            );
          })}
        </motion.div>
      </div>
    </section>
  );
}


// ─── Features ────────────────────────────────────────────────────────────────

function Features() {
  const ref    = useRef(null);
  const inView = useInView(ref, { once: true, margin: "-60px" });

  return (
    <section id="features" className="py-24 px-4 bg-muted/30 dark:bg-muted/10 relative overflow-hidden">
      {/* subtle radial glow */}
      <div className="pointer-events-none absolute inset-0 flex items-center justify-center">
        <div className="h-[600px] w-[600px] rounded-full opacity-[0.04] dark:opacity-[0.08]"
          style={{ background: "radial-gradient(circle, hsl(250 84% 54%), transparent 70%)" }} />
      </div>

      <div className="mx-auto max-w-6xl relative">
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <span className="inline-flex items-center gap-2 rounded-full border border-primary/25 bg-primary/8 px-3 py-1 text-xs font-semibold uppercase tracking-widest text-primary mb-4">
            <Zap className="h-3 w-3" /> Platform Features
          </span>
          <h2 className="font-heading text-4xl md:text-5xl font-bold mb-4">
            Everything Your Campus Needs
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            A complete suite of tools purpose-built for modern educational institutions
          </p>
        </motion.div>

        <motion.div
          ref={ref}
          variants={stagger(0.08)}
          initial="hidden"
          animate={inView ? "show" : "hidden"}
          className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4"
        >
          {FEATURES.map((f) => (
            <motion.div key={f.title} variants={fadeUp}>
              <div className="group relative h-full rounded-2xl border-2 bg-card p-6 hover:border-primary/40 hover:shadow-brand transition-all duration-300 cursor-default">
                <div className={`mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br ${f.color} shadow-md`}>
                  <f.icon className="h-6 w-6 text-white" />
                </div>
                <h3 className="font-heading font-semibold text-base mb-2 group-hover:text-primary transition-colors">
                  {f.title}
                </h3>
                <p className="text-sm text-muted-foreground leading-relaxed">{f.description}</p>

                {/* hover accent line */}
                <div className="absolute bottom-0 left-6 right-6 h-0.5 rounded-full bg-gradient-primary opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
              </div>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}


// ─── Testimonials ────────────────────────────────────────────────────────────

function Testimonials() {
  return (
    <section id="testimonials" className="py-24 px-4">
      <div className="mx-auto max-w-6xl">
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <span className="inline-flex items-center gap-2 rounded-full border border-primary/25 bg-primary/8 px-3 py-1 text-xs font-semibold uppercase tracking-widest text-primary mb-4">
            <Star className="h-3 w-3" /> Trusted by Leaders
          </span>
          <h2 className="font-heading text-4xl md:text-5xl font-bold mb-4">
            What Educators Say
          </h2>
          <p className="text-lg text-muted-foreground max-w-xl mx-auto">
            Hear from campus leaders who transformed their institutions with CampusOS
          </p>
        </motion.div>

        <motion.div
          variants={stagger(0.15)}
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, margin: "-60px" }}
          className="grid gap-6 md:grid-cols-3"
        >
          {TESTIMONIALS.map((t) => (
            <motion.div key={t.name} variants={fadeUp}>
              <div className="h-full rounded-2xl border-2 bg-card p-7 hover:border-primary/40 hover:shadow-brand transition-all duration-300 flex flex-col">
                {/* Stars */}
                <div className="flex gap-1 mb-5">
                  {Array.from({ length: t.rating }).map((_, i) => (
                    <Star key={i} className="h-4 w-4 fill-amber-400 text-amber-400" />
                  ))}
                </div>
                {/* Quote */}
                <blockquote className="text-sm leading-7 text-muted-foreground flex-1 mb-6">
                  &ldquo;{t.text}&rdquo;
                </blockquote>
                {/* Author */}
                <div className="flex items-center gap-3 pt-4 border-t border-border/50">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-gradient-primary text-sm font-bold text-white shadow-brand">
                    {t.avatar}
                  </div>
                  <div>
                    <div className="text-sm font-semibold">{t.name}</div>
                    <div className="text-xs text-muted-foreground">{t.role}</div>
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}


// ─── Partners ────────────────────────────────────────────────────────────────

function Partners() {
  return (
    <section className="py-16 px-4 border-y bg-muted/20 dark:bg-muted/10">
      <div className="mx-auto max-w-5xl">
        <motion.p
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          className="text-center text-xs font-semibold uppercase tracking-widest text-muted-foreground mb-10"
        >
          Trusted by India&apos;s Top Institutions
        </motion.p>
        <motion.div
          variants={stagger(0.1)}
          initial="hidden"
          whileInView="show"
          viewport={{ once: true }}
          className="flex flex-wrap items-center justify-center gap-4"
        >
          {PARTNERS.map((p) => (
            <motion.div
              key={p}
              variants={fadeUp}
              className="rounded-xl border-2 border-border/60 bg-card px-5 py-3 text-sm font-semibold text-muted-foreground hover:border-primary/40 hover:text-foreground hover:shadow-brand transition-all duration-300 cursor-default"
            >
              {p}
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}


// ─── Pricing / CTA ───────────────────────────────────────────────────────────

function Pricing() {
  return (
    <section id="pricing" className="py-24 px-4">
      <div className="mx-auto max-w-5xl">
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <span className="inline-flex items-center gap-2 rounded-full border border-primary/25 bg-primary/8 px-3 py-1 text-xs font-semibold uppercase tracking-widest text-primary mb-4">
            Simple Pricing
          </span>
          <h2 className="font-heading text-4xl md:text-5xl font-bold mb-4">
            Start Free, Scale Confidently
          </h2>
          <p className="text-lg text-muted-foreground max-w-xl mx-auto">
            Every plan includes tenant isolation, RBAC, and 24/7 support. No hidden fees.
          </p>
        </motion.div>

        <motion.div
          variants={stagger(0.1)}
          initial="hidden"
          whileInView="show"
          viewport={{ once: true }}
          className="grid md:grid-cols-3 gap-6"
        >
          {[
            {
              name: "Starter",
              price: "Free",
              desc: "Perfect for small institutions",
              features: ["Up to 500 students", "3 admin users", "AI Assistant (50 queries/mo)", "Basic analytics", "Email support"],
              cta: "Get Started",
              href: "/login?demo=true",
              highlighted: false,
            },
            {
              name: "Growth",
              price: "₹4,999",
              period: "/month",
              desc: "For growing campuses",
              features: ["Up to 5,000 students", "Unlimited admins", "AI Assistant (unlimited)", "Advanced analytics", "Bus & hostel module", "Priority support"],
              cta: "Start Free Trial",
              href: "/login?demo=true",
              highlighted: true,
            },
            {
              name: "Enterprise",
              price: "Custom",
              desc: "For large universities",
              features: ["Unlimited students", "Custom integrations", "Dedicated infrastructure", "SLA guarantee", "Custom branding", "Onboarding support"],
              cta: "Contact Us",
              href: "/login?demo=true",
              highlighted: false,
            },
          ].map((plan) => (
            <motion.div key={plan.name} variants={fadeUp}>
              <div className={`relative h-full rounded-2xl border-2 p-7 flex flex-col transition-all duration-300 ${
                plan.highlighted
                  ? "border-primary bg-gradient-to-b from-primary/8 to-accent/5 shadow-brand scale-[1.02]"
                  : "border-border bg-card hover:border-primary/40 hover:shadow-brand"
              }`}>
                {plan.highlighted && (
                  <div className="absolute -top-3.5 left-1/2 -translate-x-1/2">
                    <span className="rounded-full bg-gradient-primary px-4 py-1 text-xs font-bold text-white shadow-brand">
                      Most Popular
                    </span>
                  </div>
                )}
                <div className="mb-6">
                  <div className="text-sm font-semibold uppercase tracking-widest text-muted-foreground mb-2">{plan.name}</div>
                  <div className="flex items-end gap-1 mb-1">
                    <span className="font-heading text-4xl font-bold">{plan.price}</span>
                    {plan.period && <span className="text-muted-foreground mb-1">{plan.period}</span>}
                  </div>
                  <p className="text-sm text-muted-foreground">{plan.desc}</p>
                </div>
                <ul className="space-y-2.5 mb-8 flex-1">
                  {plan.features.map((feat) => (
                    <li key={feat} className="flex items-start gap-2.5 text-sm">
                      <span className="mt-0.5 flex h-4 w-4 shrink-0 items-center justify-center rounded-full bg-gradient-primary text-white text-[10px] font-bold">✓</span>
                      {feat}
                    </li>
                  ))}
                </ul>
                <Link href={plan.href}>
                  <Button className={`w-full font-semibold ${plan.highlighted ? "shadow-brand" : ""}`}
                    variant={plan.highlighted ? "default" : "outline"}>
                    {plan.cta}
                  </Button>
                </Link>
              </div>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}


// ─── Call to Action ──────────────────────────────────────────────────────────

function CallToAction() {
  return (
    <section className="py-24 px-4">
      <div className="mx-auto max-w-5xl">
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.7 }}
          className="relative overflow-hidden rounded-3xl bg-gradient-primary p-12 md:p-16 text-center text-white"
        >
          {/* Animated background shapes inside CTA */}
          <motion.div
            className="absolute top-0 right-0 h-72 w-72 rounded-full bg-white/10"
            animate={{ scale: [1, 1.15, 1], x: [0, 20, 0] }}
            transition={{ duration: 10, repeat: Infinity, ease: "easeInOut" }}
          />
          <motion.div
            className="absolute bottom-0 left-0 h-56 w-56 rounded-full bg-white/8"
            animate={{ scale: [1, 1.2, 1], x: [0, -20, 0] }}
            transition={{ duration: 14, repeat: Infinity, ease: "easeInOut", delay: 2 }}
          />

          <div className="relative z-10">
            <div className="mb-4 inline-flex items-center gap-2 rounded-full bg-white/15 px-4 py-1.5 text-sm font-semibold backdrop-blur-sm">
              <Sparkles className="h-4 w-4" />
              Join 500+ Institutions Worldwide
            </div>
            <h2 className="font-heading text-4xl md:text-5xl font-bold mb-4 text-white">
              Ready to Modernize<br />Your Campus?
            </h2>
            <p className="mx-auto max-w-2xl text-lg text-white/85 mb-10 leading-relaxed">
              Get your institution running on CampusOS in under 5 minutes.
              Free tier includes AI assistant, attendance, and up to 500 students.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Link href="/login?demo=true">
                <Button size="lg" className="bg-white text-primary hover:bg-white/90 h-12 px-8 font-semibold shadow-xl gap-2">
                  Start Free Today <ArrowRight className="h-4 w-4" />
                </Button>
              </Link>
              <Link href="/login">
                <Button size="lg" variant="outline" className="border-white/40 bg-white/10 hover:bg-white/20 text-white hover:text-white h-12 px-8 font-medium backdrop-blur-sm">
                  Sign In
                </Button>
              </Link>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}


// ─── Footer ──────────────────────────────────────────────────────────────────

function Footer() {
  const year = new Date().getFullYear();
  return (
    <footer className="border-t bg-card px-4 pt-16 pb-8">
      <div className="mx-auto max-w-6xl">
        <div className="grid gap-10 md:grid-cols-4 mb-12">
          {/* Brand */}
          <div className="md:col-span-1">
            <CampusLogo className="mb-4" />
            <p className="text-sm text-muted-foreground leading-relaxed">
              Smart Campus Operating System for modern educational institutions worldwide.
            </p>
          </div>

          {/* Product */}
          <div>
            <h4 className="font-heading font-semibold text-sm mb-4">Product</h4>
            <ul className="space-y-3 text-sm text-muted-foreground">
              {["Features", "Pricing", "AI Assistant", "Security"].map((item) => (
                <li key={item}>
                  <Link href="#features" className="hover:text-foreground transition-colors">{item}</Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Company */}
          <div>
            <h4 className="font-heading font-semibold text-sm mb-4">Company</h4>
            <ul className="space-y-3 text-sm text-muted-foreground">
              {["About", "Blog", "Careers", "Contact"].map((item) => (
                <li key={item}>
                  <Link href="#" className="hover:text-foreground transition-colors">{item}</Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Get Started */}
          <div>
            <h4 className="font-heading font-semibold text-sm mb-4">Get Started</h4>
            <ul className="space-y-3 text-sm text-muted-foreground">
              <li><Link href="/login?demo=true" className="hover:text-foreground transition-colors">Request Demo</Link></li>
              <li><Link href="/login" className="hover:text-foreground transition-colors">Sign In</Link></li>
              <li><Link href="#" className="hover:text-foreground transition-colors">Documentation</Link></li>
              <li><Link href="#" className="hover:text-foreground transition-colors">API Reference</Link></li>
            </ul>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 border-t pt-8">
          <p className="text-xs text-muted-foreground">
            © {year} CampusOS. All rights reserved.
          </p>
          <div className="flex gap-6 text-xs text-muted-foreground">
            <Link href="#" className="hover:text-foreground transition-colors">Privacy Policy</Link>
            <Link href="#" className="hover:text-foreground transition-colors">Terms of Service</Link>
            <Link href="#" className="hover:text-foreground transition-colors">Cookie Policy</Link>
          </div>
        </div>
      </div>
    </footer>
  );
}


// ─── Page ─────────────────────────────────────────────────────────────────────

export default function LandingPage() {
  return (
    <div className="min-h-screen overflow-x-hidden">
      <Navbar />
      <AiBanner />
      <Hero />
      <Partners />
      <Stats />
      <Features />
      <Testimonials />
      <Pricing />
      <CallToAction />
      <Footer />
    </div>
  );
}
