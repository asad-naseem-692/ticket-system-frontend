import React from "react";

export interface SkeletonProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: "text" | "circular" | "rectangular";
}

export function Skeleton({
  variant = "rectangular",
  className = "",
  ...props
}: SkeletonProps) {
  const variantClasses = {
    text: "h-4 rounded-md w-full",
    circular: "rounded-full shrink-0",
    rectangular: "rounded-xl w-full",
  };

  return (
    <div
      className={`shimmer-bg animate-shimmer ${variantClasses[variant]} ${className}`}
      {...props}
    />
  );
}
