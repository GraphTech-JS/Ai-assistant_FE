import React, { MouseEvent, ReactNode } from "react";
import { ThemedText } from "./ThemedText";

type Variant = "primary" | "secondary";

interface ButtonProps {
  children: ReactNode;
  variant?: Variant;
  size?: "large" | "medium" | "small";
  type?: "button" | "reset" | "submit";
  onClick?: (e: MouseEvent<HTMLButtonElement>) => void;
  loading?: boolean;
  className?: string;
}

const baseStyles =
  "px-4 py-2 font-medium rounded-lg transition focus:outline-none disabled:opacity-50 disabled:cursor-not-allowed";
const variantStyles: Record<Variant, string> = {
  primary: "bg-[#462f7b]  text-white hover:bg-primary/90",
  secondary: "bg-secondary text-white hover:bg-secondary/90",
};

const sizeStyles: Record<NonNullable<ButtonProps["size"]>, string> = {
  large: "h-[73px] w-[316px] rounded-[5px] px-[9px]",
  medium:
    "h-[48px] md:h-[61px] w-full lg:max-w-[286px] text-center rounded-[5px]",
  small: "w-[136px] h-[48px] rounded-[5px] px-4",
};

export const Button: React.FC<ButtonProps> = ({
  variant = "primary",
  size = "medium",
  className = "",
  children,
  onClick,
  type = "button",
  loading = false,
  ...rest
}) => (
  <button
    type={type}
    onClick={onClick}
    disabled={loading}
    className={`${baseStyles} ${variantStyles[variant]} ${sizeStyles[size]} ${className}`}
    {...rest}
  >
    <ThemedText>{loading ? "Завантаження..." : children}</ThemedText>
  </button>
);
