import React from "react";

export interface TextareaProps
  extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string;
  error?: string;
  helperText?: string;
}

export const Textarea = React.forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({ label, error, helperText, className = "", id, ...props }, ref) => {
    const textareaId = id || (label ? label.toLowerCase().replace(/\s+/g, "-") : undefined);

    return (
      <div className="w-full space-y-1.5">
        {label && (
          <label
            htmlFor={textareaId}
            className="block text-xs font-semibold uppercase tracking-wider text-[#52606D]"
          >
            {label}
          </label>
        )}
        <textarea
          id={textareaId}
          ref={ref}
          className={`w-full p-3.5 text-sm text-[#1F2933] bg-white border rounded-xl placeholder-[#9AA5B1] transition-all duration-150 ease-out focus:outline-none focus:border-[#0D9488] focus:ring-2 focus:ring-[#0D9488]/20 disabled:bg-slate-50 disabled:text-[#9AA5B1] disabled:cursor-not-allowed ${
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

Textarea.displayName = "Textarea";
