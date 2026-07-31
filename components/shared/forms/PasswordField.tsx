"use client";

import { useState, useId, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { AlertCircle, Eye, EyeOff, Lock, Check, X } from "lucide-react";

interface PasswordFieldProps {
  label?: string;
  value: string;
  onChange: (v: string) => void;
  showStrength?: boolean;
  error?: string;
  required?: boolean;
  disabled?: boolean;
  autoComplete?: string;
  id?: string;
  placeholder?: string;
  className?: string;
}

interface Requirement {
  label: string;
  met: boolean;
}

function getStrength(pwd: string): { score: number; label: string; color: string } {
  let score = 0;
  if (pwd.length >= 8) score++;
  if (/[A-Z]/.test(pwd)) score++;
  if (/[0-9]/.test(pwd)) score++;
  if (/[^A-Za-z0-9]/.test(pwd)) score++;

  const levels = [
    { label: "Weak", color: "bg-rose-500" },
    { label: "Fair", color: "bg-amber-500" },
    { label: "Good", color: "bg-blue-500" },
    { label: "Strong", color: "bg-emerald-500" },
  ];

  return { score, ...levels[Math.max(score - 1, 0)] };
}

export function PasswordField({
  label = "Password",
  value,
  onChange,
  showStrength = false,
  error,
  required,
  disabled,
  autoComplete = "current-password",
  id: externalId,
  placeholder,
  className = "",
}: PasswordFieldProps) {
  const generatedId = useId();
  const id = externalId || generatedId;
  const [focused, setFocused] = useState(false);
  const [show, setShow] = useState(false);
  const floated = focused || value.length > 0;

  const strength = useMemo(() => getStrength(value), [value]);

  const requirements: Requirement[] = [
    { label: "At least 8 characters", met: value.length >= 8 },
    { label: "One uppercase letter", met: /[A-Z]/.test(value) },
    { label: "One number", met: /[0-9]/.test(value) },
    { label: "One special character", met: /[^A-Za-z0-9]/.test(value) },
  ];

  return (
    <div className={`space-y-2 ${className}`}>
      {/* Input */}
      <div
        className={`relative flex items-center rounded-2xl border-2 bg-background/80 backdrop-blur-sm transition-all duration-200 ${
          disabled ? "opacity-60 cursor-not-allowed" : ""
        } ${
          error
            ? "border-rose-500/70 shadow-[0_0_0_3px_rgba(244,63,94,0.12)]"
            : focused
            ? "border-primary shadow-[0_0_0_3px_hsl(var(--primary)/0.15)]"
            : "border-border/70 hover:border-border"
        }`}
      >
        {/* Lock icon */}
        <span
          className={`absolute left-3.5 z-10 transition-colors duration-200 ${
            error ? "text-rose-500" : focused ? "text-primary" : "text-muted-foreground"
          }`}
        >
          <Lock className="h-4 w-4" />
        </span>

        {/* Floating label */}
        <motion.label
          htmlFor={id}
          animate={
            floated
              ? { y: -22, scale: 0.78, x: -4 }
              : { y: 0, scale: 1, x: 0 }
          }
          transition={{ duration: 0.18, ease: [0.4, 0, 0.2, 1] }}
          style={{ originX: 0, originY: 0 }}
          className={`pointer-events-none absolute left-0 z-10 select-none pl-10 font-medium transition-colors duration-200 ${
            floated
              ? error
                ? "text-rose-500 text-xs"
                : focused
                ? "text-primary text-xs"
                : "text-muted-foreground text-xs"
              : "text-muted-foreground text-sm"
          }`}
        >
          {label}
          {required && <span className="text-rose-400 ml-0.5">*</span>}
        </motion.label>

        <input
          id={id}
          type={show ? "text" : "password"}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          onFocus={() => setFocused(true)}
          onBlur={() => setFocused(false)}
          required={required}
          disabled={disabled}
          autoComplete={autoComplete}
          placeholder={focused ? (placeholder || "••••••••") : ""}
          className="h-14 w-full bg-transparent pl-10 pr-11 text-sm text-foreground placeholder:text-muted-foreground/50 focus:outline-none disabled:cursor-not-allowed pt-4"
        />

        {/* Eye toggle */}
        <button
          type="button"
          tabIndex={-1}
          onClick={() => setShow((v) => !v)}
          disabled={disabled}
          aria-label={show ? "Hide password" : "Show password"}
          className="absolute right-3.5 z-10 text-muted-foreground hover:text-foreground transition-colors focus:outline-none"
        >
          <AnimatePresence mode="wait" initial={false}>
            <motion.span
              key={show ? "hide" : "show"}
              initial={{ opacity: 0, scale: 0.6, rotate: -15 }}
              animate={{ opacity: 1, scale: 1, rotate: 0 }}
              exit={{ opacity: 0, scale: 0.6, rotate: 15 }}
              transition={{ duration: 0.15 }}
            >
              {show ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
            </motion.span>
          </AnimatePresence>
        </button>
      </div>

      {/* Strength meter (only when showStrength=true and value exists) */}
      <AnimatePresence>
        {showStrength && value.length > 0 && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.22 }}
            className="space-y-2.5 overflow-hidden"
          >
            {/* Strength bar */}
            <div className="space-y-1">
              <div className="flex gap-1">
                {Array.from({ length: 4 }).map((_, i) => (
                  <motion.div
                    key={i}
                    className={`h-1.5 flex-1 rounded-full transition-all duration-300 ${
                      i < strength.score ? strength.color : "bg-muted"
                    }`}
                    initial={{ scaleX: 0 }}
                    animate={{ scaleX: 1 }}
                    transition={{ delay: i * 0.06, duration: 0.2 }}
                    style={{ originX: 0 }}
                  />
                ))}
              </div>
              <p className={`text-xs font-semibold ${
                strength.score <= 1 ? "text-rose-500" :
                strength.score === 2 ? "text-amber-500" :
                strength.score === 3 ? "text-blue-500" :
                "text-emerald-500"
              }`}>
                Password strength: {strength.label}
              </p>
            </div>

            {/* Requirements checklist */}
            <div className="grid grid-cols-2 gap-1">
              {requirements.map((req) => (
                <div key={req.label} className="flex items-center gap-1.5">
                  <AnimatePresence mode="wait" initial={false}>
                    <motion.span
                      key={req.met ? "check" : "x"}
                      initial={{ scale: 0.5, opacity: 0 }}
                      animate={{ scale: 1, opacity: 1 }}
                      exit={{ scale: 0.5, opacity: 0 }}
                      transition={{ duration: 0.15 }}
                    >
                      {req.met ? (
                        <Check className="h-3 w-3 text-emerald-500" />
                      ) : (
                        <X className="h-3 w-3 text-muted-foreground/50" />
                      )}
                    </motion.span>
                  </AnimatePresence>
                  <span className={`text-[11px] font-medium ${req.met ? "text-foreground" : "text-muted-foreground"}`}>
                    {req.label}
                  </span>
                </div>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Inline error */}
      <AnimatePresence>
        {error && (
          <motion.p
            initial={{ opacity: 0, height: 0, y: -4 }}
            animate={{ opacity: 1, height: "auto", y: 0 }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.18 }}
            className="flex items-center gap-1.5 text-xs font-medium text-rose-500"
          >
            <AlertCircle className="h-3 w-3 shrink-0" />
            {error}
          </motion.p>
        )}
      </AnimatePresence>
    </div>
  );
}
