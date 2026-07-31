"use client";

import { useState, useId } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { AlertCircle, Calendar as CalendarIcon } from "lucide-react";

interface FormDatePickerProps {
  label: string;
  value: string;
  onChange: (v: string) => void;
  icon?: React.ElementType;
  error?: string;
  placeholder?: string;
  required?: boolean;
  disabled?: boolean;
  id?: string;
  min?: string;
  max?: string;
}

export function FormDatePicker({
  label,
  value,
  onChange,
  icon: Icon = CalendarIcon,
  error,
  placeholder = "Select date",
  required,
  disabled,
  id: externalId,
  min,
  max,
}: FormDatePickerProps) {
  const generatedId = useId();
  const id = externalId || generatedId;
  const [focused, setFocused] = useState(false);
  const floated = focused || value.length > 0;

  return (
    <div className="relative">
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
        {/* Calendar Icon */}
        <span
          className={`pointer-events-none absolute left-3.5 z-10 transition-colors duration-200 ${
            error ? "text-rose-500" : focused ? "text-primary" : "text-muted-foreground"
          }`}
        >
          <Icon className="h-4 w-4" />
        </span>

        {/* Floating Label */}
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

        {/* Native Date Input with custom styling */}
        <input
          id={id}
          type="date"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          onFocus={() => setFocused(true)}
          onBlur={() => setFocused(false)}
          required={required}
          disabled={disabled}
          min={min}
          max={max}
          placeholder={placeholder}
          className="h-14 w-full cursor-pointer bg-transparent pl-10 pr-4 pt-4 text-sm text-foreground focus:outline-none disabled:cursor-not-allowed [color-scheme:dark_light]"
        />
      </div>

      {/* Inline Error */}
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
