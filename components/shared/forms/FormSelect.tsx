"use client";

import { useState, useId } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { AlertCircle, ChevronDown } from "lucide-react";

export interface SelectOption {
  value: string;
  label: string;
}

interface FormSelectProps {
  label: string;
  value: string;
  onChange: (v: string) => void;
  options?: (SelectOption | string)[];
  icon?: React.ElementType;
  error?: string;
  required?: boolean;
  disabled?: boolean;
  placeholder?: string;
  id?: string;
  children?: React.ReactNode;
  className?: string;
}

export function FormSelect({
  label,
  value,
  onChange,
  options = [],
  icon: Icon,
  error,
  required,
  disabled,
  placeholder = "Select an option",
  id: externalId,
  children,
  className = "",
}: FormSelectProps) {
  const generatedId = useId();
  const id = externalId || generatedId;
  const [focused, setFocused] = useState(false);
  const floated = focused || (value !== undefined && value !== null && value !== "");
  const hasIcon = !!Icon;

  const normalizedOptions: SelectOption[] = options.map((opt) =>
    typeof opt === "string" ? { value: opt, label: opt } : opt
  );

  return (
    <div className={`relative ${className}`}>
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
            className={`pointer-events-none absolute left-3.5 z-10 transition-colors duration-200 ${
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

        {/* Chevron icon */}
        <motion.span
          animate={{ rotate: focused ? 180 : 0 }}
          transition={{ duration: 0.2 }}
          className="pointer-events-none absolute right-3.5 z-10 text-muted-foreground"
        >
          <ChevronDown className="h-4 w-4" />
        </motion.span>

        {/* Select element */}
        <select
          id={id}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          onFocus={() => setFocused(true)}
          onBlur={() => setFocused(false)}
          required={required}
          disabled={disabled}
          className={`h-14 w-full cursor-pointer appearance-none bg-transparent text-sm text-foreground focus:outline-none disabled:cursor-not-allowed pt-4 pr-10 ${
            hasIcon ? "pl-10" : "pl-4"
          } ${!value ? "text-muted-foreground" : ""}`}
        >
          {placeholder && (
            <option value="" disabled className="bg-popover text-muted-foreground">
              {placeholder}
            </option>
          )}
          {children
            ? children
            : normalizedOptions.map((opt) => (
                <option key={opt.value} value={opt.value} className="bg-popover text-popover-foreground">
                  {opt.label}
                </option>
              ))}
        </select>
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
