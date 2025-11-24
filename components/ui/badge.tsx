import * as React from "react";
import { cn } from "@/lib/utils";

export interface BadgeProps
  extends React.HTMLAttributes<HTMLSpanElement> {
  variant?: "default" | "secondary" | "destructive" | "outline" | "success";
}

const Badge = React.forwardRef<HTMLSpanElement, BadgeProps>(
  ({ className, variant = "default", ...props }, ref) => {
    const variants = {
      default:
        "bg-gray-100 text-gray-900 border border-gray-200",
      secondary:
        "bg-blue-50 text-blue-700 border border-blue-200",
      destructive:
        "bg-red-50 text-red-700 border border-red-200",
      outline:
        "border border-gray-300 text-gray-900 bg-white",
      success:
        "bg-green-50 text-green-700 border border-green-200",
    };

    return (
      <span
        ref={ref}
        className={cn(
          "inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold",
          variants[variant],
          className
        )}
        {...props}
      />
    );
  }
);
Badge.displayName = "Badge";

export { Badge };

