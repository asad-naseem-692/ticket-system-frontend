import React from "react";
import { ChevronDown } from "lucide-react";

export interface SelectProps
  extends React.SelectHTMLAttributes<HTMLSelectElement> {
  label?: string;
  error?: string;
  helperText?: string;
}

export const Select = React.forwardRef<HTMLSelectElement, SelectProps>(
  ({ label, error, helperText, children, className = "", id, ...props }, ref) => {
    const selectId = id || (label ? label.toLowerCase().replace(/\s+/g, "-") : undefined);

    return (
      <div className="w-full space-y-1.5">
        {label && (
          <label
            htmlFor={selectId}
            className="block text-xs font-semibold uppercase tracking-wider text-[#52606D]"
          >
            {label}
          </label>
        )}
        <div className="relative">
          <select
            id={selectId}
            ref={ref}
            className={`w-full h-10 pl-3.5 pr-10 text-sm text-[#1F2933] bg-white border rounded-xl appearance-none transition-all duration-150 ease-out focus:outline-none focus:border-[#0D9488] focus:ring-2 focus:ring-[#0D9488]/20 disabled:bg-slate-50 disabled:text-[#9AA5B1] disabled:cursor-not-allowed ${
              error
                ? "border-red-300 focus:border-red-500 focus:ring-red-500/20"
                : "border-[#E4E7EB] hover:border-slate-300"
            } ${className}`}
            {...props}
          >
            {children}
          </select>
          <div className="absolute inset-y-0 right-0 flex items-center px-3 pointer-events-none text-[#9AA5B1]">
            <ChevronDown className="w-4 h-4" />
          </div>
        </div>
        {error && <p className="text-xs text-red-600 font-medium">{error}</p>}
        {!error && helperText && (
          <p className="text-xs text-[#9AA5B1]">{helperText}</p>
        )}
      </div>
    );
  }
);

Select.displayName = "Select";
