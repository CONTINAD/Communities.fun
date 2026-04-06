import { cn } from "@/lib/utils";
import { ButtonHTMLAttributes, forwardRef } from "react";
import LoadingSpinner from "./LoadingSpinner";

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "secondary" | "danger" | "ghost";
  size?: "sm" | "md" | "lg";
  loading?: boolean;
}

const variantStyles = {
  primary:
    "bg-accent text-white font-bold hover:bg-accent-hover disabled:opacity-50",
  secondary:
    "bg-transparent border border-border-primary text-text-primary hover:bg-bg-secondary disabled:opacity-50",
  danger:
    "bg-danger text-white font-bold hover:bg-danger/90 disabled:opacity-50",
  ghost:
    "bg-transparent text-text-primary hover:bg-bg-secondary disabled:opacity-50",
};

const sizeStyles = {
  sm: "px-3 py-1 text-sm",
  md: "px-4 py-2 text-sm",
  lg: "px-6 py-2.5 text-base",
};

const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      variant = "primary",
      size = "md",
      loading = false,
      disabled,
      className,
      children,
      ...props
    },
    ref
  ) => {
    return (
      <button
        ref={ref}
        disabled={disabled || loading}
        className={cn(
          "inline-flex items-center justify-center rounded-full transition-colors",
          variantStyles[variant],
          sizeStyles[size],
          className
        )}
        {...props}
      >
        {loading && (
          <LoadingSpinner
            size="sm"
            className="mr-2 text-current"
          />
        )}
        {children}
      </button>
    );
  }
);

Button.displayName = "Button";

export default Button;
