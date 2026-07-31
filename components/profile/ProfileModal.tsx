"use client";

import { ReactNode } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Lock, Save, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";

interface ProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  description?: string;
  children: ReactNode;
  onSave?: () => void;
  saveText?: string;
  isSubmitting?: boolean;
}

export function ProfileModal({
  isOpen,
  onClose,
  title,
  description,
  children,
  onSave,
  saveText = "Save Changes",
  isSubmitting = false,
}: ProfileModalProps) {
  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 overflow-y-auto">
          {/* Backdrop Blur overlay */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/60 backdrop-blur-md transition-opacity"
          />

          {/* Modal Container */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            transition={{ type: "spring", duration: 0.35, bounce: 0.15 }}
            className="relative z-10 w-full max-w-lg overflow-hidden rounded-3xl border border-border/80 bg-card/95 backdrop-blur-2xl shadow-2xl p-6 sm:p-8 space-y-6"
          >
            {/* Modal Header */}
            <div className="flex items-center justify-between border-b border-border/60 pb-4">
              <div className="space-y-0.5">
                <h3 className="text-xl font-bold tracking-tight text-foreground flex items-center gap-2">
                  <Sparkles className="h-5 w-5 text-indigo-500" />
                  {title}
                </h3>
                {description && (
                  <p className="text-xs text-muted-foreground">{description}</p>
                )}
              </div>
              <Button
                variant="ghost"
                size="icon"
                onClick={onClose}
                className="h-9 w-9 rounded-full hover:bg-muted/80"
              >
                <X className="h-4 w-4" />
              </Button>
            </div>

            {/* Modal Form Body */}
            <div className="space-y-4 max-h-[70vh] overflow-y-auto pr-1">
              {children}
            </div>

            {/* Modal Footer Actions */}
            <div className="flex items-center justify-end gap-3 border-t border-border/60 pt-4">
              <Button
                variant="outline"
                className="rounded-2xl font-semibold"
                onClick={onClose}
                disabled={isSubmitting}
              >
                Cancel
              </Button>

              {onSave && (
                <Button
                  className="rounded-2xl font-semibold bg-primary hover:bg-primary/90 text-primary-foreground shadow-md transition-all hover:scale-105 active:scale-95"
                  onClick={onSave}
                  disabled={isSubmitting}
                >
                  <Save className="mr-2 h-4 w-4" />
                  {isSubmitting ? "Saving..." : saveText}
                </Button>
              )}
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
