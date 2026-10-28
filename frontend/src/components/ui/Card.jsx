import clsx from "clsx"

export default function Card({ className, children, padded = true, ...props }) {
  return (
    <div
      className={clsx("rounded-2xl border border-border bg-card shadow-[0_1px_2px_rgba(16,24,40,0.04)]", padded && "p-5", className)}
      {...props}
    >
      {children}
    </div>
  )
}
