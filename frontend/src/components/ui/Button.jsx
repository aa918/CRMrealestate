import clsx from "clsx"
import { Loader2 } from "lucide-react"

const variants = {
  primary: "bg-brand text-white hover:bg-brand-dark shadow-sm",
  secondary: "bg-white text-text border border-border hover:bg-slate-50",
  ghost: "bg-transparent text-text hover:bg-slate-100",
  danger: "bg-danger text-white hover:opacity-90",
  subtle: "bg-info-bg text-brand hover:bg-blue-100",
}

const sizes = {
  sm: "h-8 px-3 text-xs gap-1.5",
  md: "h-10 px-4 text-sm gap-2",
  lg: "h-12 px-5 text-base gap-2",
}

export default function Button({
  variant = "primary",
  size = "md",
  className,
  isLoading,
  disabled,
  children,
  icon: Icon,
  type = "button",
  ...props
}) {
  return (
    <button
      type={type}
      disabled={disabled || isLoading}
      className={clsx(
        "focus-ring inline-flex items-center justify-center rounded-xl font-medium transition-colors disabled:cursor-not-allowed disabled:opacity-50",
        variants[variant],
        sizes[size],
        className
      )}
      {...props}
    >
      {isLoading ? <Loader2 className="size-4 animate-spin" /> : Icon ? <Icon className="size-4" /> : null}
      {children}
    </button>
  )
}
