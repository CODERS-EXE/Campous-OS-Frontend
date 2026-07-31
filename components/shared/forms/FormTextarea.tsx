"use client";

import { useState, useId } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { AlertCircle } from "lucide-react";

interface FormTextareaProps {
  label: string;
  value: string;
  onChange: (v: string) => void;
  icon?: React.ElementType;
  error?: string;
  placeholder?: string;
  required?: boolean;
  disabled?: boolean;
  rows?: number;
  maxLength?: number;
  id?: string;
}

export function FormTextarea({
  label,
  value,
  onChange,
  icon: Icon,
  error,
  placeholder,
  required,
  disabled,
  rows = 4,
  maxLength,
  id: externalId,
}: FormTextareaProps) {
  const generatedId = useId();
  const id = externalId || generatedId;
  const [focused, setFocused] = useState(false);
  const floated = focused || value.length > 0;
  const hasIcon = !!Icon;

  return (
    <div className="relative">
      <div
        className={`relative rounded-2xl border-2 bg-background/80 backdrop-blur-sm transition-all duration-200 ${
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
            className={`absolute left-3.5 top-4 z-10 transition-colors duration-200 ${
              error ? "text-rose-500" : focused ? "text-primary" : "text-muted-foreground"
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
              ? { y: -10, scale: 0.78, x: hasIcon ? -4 : 0 }
              : { y: 0, scale: 1, x: 0 }
          }
          transition={{ duration: 0.18, ease: [0.4, 0, 0.2, 1] }}
          style={{ originX: 0, originY: 0 }}
          className={`pointer-events-none absolute left-0 top-4 z-10 select-none font-medium transition-colors duration-200 ${
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

        {/* Textarea */}
        <textarea
          id={id}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          onFocus={() => setFocused(true)}
          onBlur={() => setFocused(false)}
          required={required}
          disabled={disabled}
          placeholder={focused ? placeholder : ""}
          rows={rows}
          maxLength={maxLength}
          className={`w-full resize-none bg-transparent text-sm text-foreground placeholder:text-muted-foreground/50 focus:outline-none disabled:cursor-not-allowed pt-7 pb-3 ${
            hasIcon ? "pl-10" : "pl-4"
          } pr-4`}
        />

        {/* Character count */}
        {maxLength && (
          <div className="absolute bottom-3 right-4 text-[10px] text-muted-foreground font-mono">
            {value.length}/{maxLength}
          </div>
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
