"use client";

import * as React from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X } from "lucide-react";
import { cn } from "@/lib/utils";

interface DialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  children: React.ReactNode;
}

interface DialogContentProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
}

interface DialogHeaderProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
}

interface DialogTitleProps extends React.HTMLAttributes<HTMLHeadingElement> {
  children: React.ReactNode;
}

interface DialogFooterProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
}

const Dialog = ({ open, onOpenChange, children }: DialogProps) => {
  return (
    <AnimatePresence>
      {open && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 z-[100] bg-black/50 backdrop-blur-sm"
            onClick={() => onOpenChange(false)}
            aria-hidden="true"
          />
          {/* Content */}
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 pointer-events-none">
            {children}
          </div>
        </>
      )}
    </AnimatePresence>
  );
};

const DialogContent = React.forwardRef<HTMLDivElement, DialogContentProps>(
  ({ className, children, ...props }, ref) => {
    return (
      <motion.div
        ref={ref}
        initial={{ opacity: 0, scale: 0.95, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 20 }}
        transition={{ duration: 0.2 }}
        className={cn(
          "bg-white rounded-2xl shadow-xl max-w-2xl w-full max-h-[90vh] overflow-hidden pointer-events-auto",
          className
        )}
        {...props}
      >
        {children}
      </motion.div>
    );
  }
);
DialogContent.displayName = "DialogContent";

const DialogHeader = ({ className, children, ...props }: DialogHeaderProps) => {
  return (
    <div
      className={cn(
        "sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between z-10",
        className
      )}
      {...props}
    >
      {children}
    </div>
  );
};

const DialogTitle = ({ className, children, ...props }: DialogTitleProps) => {
  return (
    <h2
      className={cn("text-xl font-bold text-gray-900", className)}
      {...props}
    >
      {children}
    </h2>
  );
};

const DialogFooter = ({ className, children, ...props }: DialogFooterProps) => {
  return (
    <div
      className={cn(
        "flex items-center justify-end gap-3 pt-4 border-t border-gray-200",
        className
      )}
      {...props}
    >
      {children}
    </div>
  );
};

const DialogClose = ({
  onOpenChange,
}: {
  onOpenChange: (open: boolean) => void;
}) => {
  return (
    <button
      onClick={() => onOpenChange(false)}
      className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
    >
      <X size={24} />
    </button>
  );
};

export {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogClose,
};

