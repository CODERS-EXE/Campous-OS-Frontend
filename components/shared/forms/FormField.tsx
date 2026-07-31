"use client";

import { useState, useId } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { AlertCircle } from "lucide-react";

interface FormFieldProps {
  label: string;
  type?: string;
  value: string | number;
  onChange: (v: string) => void;
  icon?: React.ElementType;
  rightSlot?: React.ReactNode;
  error?: string;
  placeholder?: string;
  required?: boolean;
  disabled?: boolean;
  autoComplete?: string;
  id?: string;
  min?: string | number;
  max?: string | number;
  step?: string | number;
  className?: string;
}

export function FormField({
  label,
  type = "text",
  value,
  onChange,
  icon: Icon,
  rightSlot,
  error,
  placeholder,
  required,
  disabled,
  autoComplete,
  id: externalId,
  min,
  max,
  step,
  className = "",
}: FormFieldProps) {
  const generatedId = useId();
  const id = externalId || generatedId;
  const [focused, setFocused] = useState(false);
  const strValue = value !== undefined && value !== null ? String(value) : "";
  const floated = focused || strValue.length > 0;
  const hasIcon = !!Icon;

  return (
    <div className={`relative ${className}`}>
      {/* Floating container */}
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
        {/* Left icon */}
        {hasIcon && (
          <span
            className={`absolute left-3.5 z-10 transition-colors duration-200 ${
              error
                ? "text-rose-500"
                : focused
                ? "text-primary"
                : "text-muted-foreground"
            }`}
          >
            <Icon className="h-4 w-4" />
          </span>
        )}

        {/* Floating label */}
        <motion.label
          htmlFor={id}
          animate={
            floated
              ? { y: -22, scale: 0.78, x: hasIcon ? -4 : 0 }
              : { y: 0, scale: 1, x: 0 }
          }
          transition={{ duration: 0.18, ease: [0.4, 0, 0.2, 1] }}
          style={{ originX: 0, originY: 0 }}
          className={`pointer-events-none absolute left-0 z-10 select-none font-medium transition-colors duration-200 ${
            hasIcon ? "pl-10" : "pl-4"
          } ${
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

        {/* Input */}
        <input
          id={id}
          type={type}
          value={strValue}
          onChange={(e) => onChange(e.target.value)}
          onFocus={() => setFocused(true)}
          onBlur={() => setFocused(false)}
          required={required}
          disabled={disabled}
          autoComplete={autoComplete}
          placeholder={focused ? placeholder : ""}
          min={min}
          max={max}
          step={step}
          className={`h-14 w-full bg-transparent text-sm text-foreground placeholder:text-muted-foreground/50 focus:outline-none disabled:cursor-not-allowed pt-4 ${
            hasIcon ? "pl-10" : "pl-4"
          } ${rightSlot ? "pr-11" : "pr-4"}`}
        />

        {/* Right slot */}
        {rightSlot && (
          <span className="absolute right-3.5 z-10">{rightSlot}</span>
        )}
      </div>

      {/* Inline error */}
      <AnimatePresence>
        {error && (
          <motion.p
            initial={{ opacity: 0, height: 0, y: -4 }}
            animate={{ opacity: 1, height: "auto", y: 0 }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.18 }}
            className="mt-1.5 flex items-center gap-1.5 text-xs font-medium text-rose-500"
          >
            <AlertCircle className="h-3 w-3 shrink-0" />
            {error}
          </motion.p>
        )}
      </AnimatePresence>
    </div>
  );
}
