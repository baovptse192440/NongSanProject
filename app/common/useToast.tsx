"use client";

import { useState, useCallback } from "react";
import { Toast, ToastType } from "./Toast";

export function useToast() {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const showToast = useCallback(
    (type: ToastType, title: string, description?: string, duration?: number) => {
      const id = Math.random().toString(36).substring(7);
      const newToast: Toast = {
        id,
        type,
        title,
        description,
        duration,
      };

      setToasts((prev) => [...prev, newToast]);
      return id;
    },
    []
  );

  const removeToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((toast) => toast.id !== id));
  }, []);

  const toast = {
    success: (title: string, description?: string) =>
      showToast("success", title, description),
    error: (title: string, description?: string) =>
      showToast("error", title, description, 7000),
    warning: (title: string, description?: string) =>
      showToast("warning", title, description),
    info: (title: string, description?: string) =>
      showToast("info", title, description),
  };

  return {
    toasts,
    toast,
    removeToast,
  };
}

