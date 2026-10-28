import clsx from "clsx"
import { initials } from "../../lib/format"

const colors = [
  "bg-blue-100 text-blue-700",
  "bg-emerald-100 text-emerald-700",
  "bg-amber-100 text-amber-700",
  "bg-rose-100 text-rose-700",
  "bg-violet-100 text-violet-700",
  "bg-cyan-100 text-cyan-700",
]

function colorFor(seed) {
  if (!seed) return colors[0]
  let hash = 0
  for (let i = 0; i < seed.length; i++) hash = (hash + seed.charCodeAt(i)) % colors.length
  return colors[hash]
}

export default function Avatar({ user, size = "md", className }) {
  if (!user) return null
  const sizeClasses = { sm: "size-7 text-[10px]", md: "size-9 text-xs", lg: "size-12 text-sm" }
  return (
    <span
      className={clsx(
        "flex shrink-0 items-center justify-center rounded-full font-semibold",
        sizeClasses[size],
        colorFor(user.id || user.email),
        className
      )}
      title={[user.firstName, user.lastName].filter(Boolean).join(" ")}
    >
      {initials(user.firstName, user.lastName)}
    </span>
  )
}
