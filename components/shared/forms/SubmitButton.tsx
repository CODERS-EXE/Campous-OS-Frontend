"use client";

import { motion } from "framer-motion";
import { CheckCircle2, Loader2 } from "lucide-react";

interface SubmitButtonProps {
  isLoading?: boolean;
  isSuccess?: boolean;
  loadingText?: string;
  successText?: string;
  children: React.ReactNode;
  disabled?: boolean;
  onClick?: () => void;
  type?: "submit" | "button" | "reset";
  variant?: "primary" | "success" | "warning" | "danger";
  fullWidth?: boolean;
  size?: "sm" | "md" | "lg";
  className?: string;
}

const variantStyles = {
  primary: "bg-indigo-600 hover:bg-indigo-500 shadow-indigo-500/25",
  success: "bg-emerald-600 hover:bg-emerald-500 shadow-emerald-500/25",
  warning: "bg-amber-600 hover:bg-amber-500 shadow-amber-500/25",
  danger:  "bg-rose-600 hover:bg-rose-500 shadow-rose-500/25",
};

const sizeStyles = {
  sm: "h-10 px-5 text-xs",
  md: "h-12 px-6 text-sm",
  lg: "h-14 px-8 text-base",
};

export function SubmitButton({
  isLoading = false,
  isSuccess = false,
  loadingText = "Saving...",
  successText = "Saved!",
  children,
  disabled,
  onClick,
  type = "submit",
  variant = "primary",
  fullWidth = false,
  size = "md",
  className = "",
}: SubmitButtonProps) {
  const isDisabled = isLoading || isSuccess || disabled;

  return (
    <motion.button
      type={type}
      disabled={isDisabled}
      onClick={onClick}
      whileTap={isDisabled ? {} : { scale: 0.97 }}
      whileHover={isDisabled ? {} : { scale: 1.01 }}
      className={`
        relative overflow-hidden rounded-2xl font-semibold text-white
        shadow-lg transition-all duration-200
        focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-current
        disabled:opacity-70 disabled:cursor-not-allowed disabled:scale-100
        ${variantStyles[variant]}
        ${sizeStyles[size]}
        ${fullWidth ? "w-full" : ""}
        ${className}
      `}
    >
      {/* Shimmer sweep */}
      {!isLoading && !isSuccess && (
        <motion.div
          className="absolute inset-0 bg-gradient-to-r from-transparent via-white/15 to-transparent -skew-x-12 pointer-events-none"
          initial={{ x: "-120%" }}
          animate={{ x: ["−120%", "220%"] }}
          transition={{
            duration: 2.8,
            repeat: Infinity,
            repeatDelay: 4,
            ease: "easeInOut",
          }}
        />
      )}

      {/* Content */}
      <span className="relative flex items-center justify-center gap-2">
        {isLoading ? (
          <>
            <Loader2 className="h-4 w-4 animate-spin" />
            {loadingText}
          </>
        ) : isSuccess ? (
          <motion.span
            initial={{ scale: 0.5, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="flex items-center gap-2"
          >
            <CheckCircle2 className="h-4 w-4" />
            {successText}
          </motion.span>
        ) : (
          children
        )}
      </span>
    </motion.button>
  );
}
