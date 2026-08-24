"use client";

import React from "react";
import { Loader2 } from "lucide-react";

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "secondary" | "danger" | "ghost";
  size?: "sm" | "md" | "lg";
  loading?: boolean;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      children,
      variant = "primary",
      size = "md",
      loading = false,
      leftIcon,
      rightIcon,
      className = "",
      disabled,
      ...props
    },
    ref
  ) => {
    const sizeClasses = {
      sm: "h-8 px-3 text-xs gap-1.5 rounded-lg",
      md: "h-10 px-4 text-sm gap-2 rounded-xl",
      lg: "h-11 px-5 text-base gap-2.5 rounded-xl",
    };

    const variantClasses = {
      primary:
        "bg-[#0D9488] hover:bg-[#0F766E] text-white shadow-sm hover:shadow active:scale-[0.98] disabled:bg-teal-300 disabled:shadow-none",
      secondary:
        "bg-white hover:bg-slate-50 text-[#1F2933] border border-[#E4E7EB] shadow-sm hover:border-slate-300 active:scale-[0.98] disabled:bg-slate-50 disabled:text-slate-400",
      danger:
        "bg-red-600 hover:bg-red-700 text-white shadow-sm hover:shadow active:scale-[0.98] disabled:bg-red-300",
      ghost:
        "text-[#52606D] hover:bg-slate-100 hover:text-[#1F2933] active:bg-slate-200 disabled:text-slate-300",
    };

    return (
      <button
        ref={ref}
        disabled={disabled || loading}
        className={`inline-flex items-center justify-center font-medium transition-all duration-150 ease-out focus:outline-none focus-visible:ring-2 focus-visible:ring-[#0D9488] focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:transform-none select-none ${sizeClasses[size]} ${variantClasses[variant]} ${className}`}
        {...props}
      >
        {loading ? (
          <Loader2 className="w-4 h-4 animate-spin shrink-0" />
        ) : leftIcon ? (
          <span className="shrink-0">{leftIcon}</span>
        ) : null}
        <span>{children}</span>
        {!loading && rightIcon && <span className="shrink-0">{rightIcon}</span>}
      </button>
    );
  }
);

Button.displayName = "Button";
