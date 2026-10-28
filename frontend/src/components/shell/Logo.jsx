import clsx from "clsx"

/**
 * ESTATEFLOW wordmark: a minimal house icon in a rounded blue square,
 * "ESTATE" + "FLOW" in two tones, and a small "REAL ESTATE CRM" subtitle.
 * `theme="dark"` is for the navy sidebar background, `theme="light"` for
 * white backgrounds (login page).
 */
export default function Logo({ theme = "dark", className, showSubtitle = true }) {
  const estateColor = theme === "dark" ? "text-white" : "text-navy"
  const subtitleColor = theme === "dark" ? "text-white/50" : "text-muted"

  return (
    <div className={clsx("flex items-center gap-3", className)}>
      <svg width="36" height="36" viewBox="0 0 48 48" className="shrink-0" aria-hidden="true">
        <rect width="48" height="48" rx="12" fill="#3367DC" />
        <path
          d="M24 10 L38 21 V37 a2 2 0 0 1 -2 2 H12 a2 2 0 0 1 -2 -2 V21 Z"
          fill="none"
          stroke="#FFFFFF"
          strokeWidth="2.6"
          strokeLinejoin="round"
          strokeLinecap="round"
        />
        <rect x="20" y="27" width="8" height="12" fill="#FFFFFF" />
      </svg>
      <div className="leading-tight">
        <p className="text-lg font-extrabold tracking-tight">
          <span className={estateColor}>ESTATE</span>
          <span className="text-[#6FA3F5]">FLOW</span>
        </p>
        {showSubtitle && (
          <p className={clsx("text-[10px] font-medium tracking-wider", subtitleColor)}>REAL ESTATE CRM</p>
        )}
      </div>
    </div>
  )
}
