import React, { InputHTMLAttributes } from "react";

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  className?: string;
}

export const Input: React.FC<InputProps> = ({
  label,
  error,
  className = "",
  ...rest
}) => (
  <label className="block">
    {label && (
      <span className="text-sm font-medium text-gray-700 mb-1 block">
        {label}
      </span>
    )}
    <input
      className={`
        block w-full rounded-md border text-white
        ${error ? "border-red-500" : "border-gray-300"} 
        px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary 
        transition-colors duration-200
        ${className}
      `}
      {...rest}
    />
    {error && <p className="mt-1 text-sm text-red-600">{error}</p>}
  </label>
);
