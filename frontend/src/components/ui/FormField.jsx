import clsx from "clsx"

const baseInputClasses =
  "focus-ring w-full rounded-lg border border-border bg-white px-3 h-10 text-sm text-text placeholder:text-muted disabled:bg-slate-50 disabled:text-muted"

export function Label({ children, required, className }) {
  return (
    <label className={clsx("mb-1.5 block text-sm font-medium text-text", className)}>
      {children}
      {required && <span className="mr-1 text-danger">*</span>}
    </label>
  )
}

export function FieldError({ children }) {
  if (!children) return null
  return <p className="mt-1 text-xs text-danger">{children}</p>
}

export function Input({ className, error, ...props }) {
  return <input className={clsx(baseInputClasses, error && "border-danger", className)} {...props} />
}

export function Textarea({ className, error, rows = 3, ...props }) {
  return (
    <textarea
      rows={rows}
      className={clsx(baseInputClasses, "h-auto py-2 resize-none", error && "border-danger", className)}
      {...props}
    />
  )
}

export function Select({ className, error, children, ...props }) {
  return (
    <select className={clsx(baseInputClasses, "pr-3", error && "border-danger", className)} {...props}>
      {children}
    </select>
  )
}

export function Field({ label, required, error, children, hint }) {
  return (
    <div>
      {label && <Label required={required}>{label}</Label>}
      {children}
      {hint && !error && <p className="mt-1 text-xs text-muted">{hint}</p>}
      <FieldError>{error}</FieldError>
    </div>
  )
}
