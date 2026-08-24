import React from "react";

export interface InputProps
  extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  helperText?: string;
}

export const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ label, error, helperText, className = "", id, ...props }, ref) => {
    const inputId = id || (label ? label.toLowerCase().replace(/\s+/g, "-") : undefined);

    return (
      <div className="w-full space-y-1.5">
        {label && (
          <label
            htmlFor={inputId}
            className="block text-xs font-semibold uppercase tracking-wider text-[#52606D]"
          >
            {label}
          </label>
        )}
        <input
          id={inputId}
          ref={ref}
          className={`w-full h-10 px-3.5 text-sm text-[#1F2933] bg-white border rounded-xl placeholder-[#9AA5B1] transition-all duration-150 ease-out focus:outline-none focus:border-[#0D9488] focus:ring-2 focus:ring-[#0D9488]/20 disabled:bg-slate-50 disabled:text-[#9AA5B1] disabled:cursor-not-allowed ${
            error
              ? "border-red-300 focus:border-red-500 focus:ring-red-500/20"
              : "border-[#E4E7EB] hover:border-slate-300"
          } ${className}`}
          {...props}
        />
        {error && <p className="text-xs text-red-600 font-medium">{error}</p>}
        {!error && helperText && (
          <p className="text-xs text-[#9AA5B1]">{helperText}</p>
        )}
      </div>
    );
  }
);

Input.displayName = "Input";
