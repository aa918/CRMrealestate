import {
  LayoutDashboard,
  UserPlus,
  BookUser,
  Building2,
  Handshake,
  ListChecks,
  CalendarDays,
  Workflow,
  BarChart3,
  Settings,
} from "lucide-react"

export const NAV_ITEMS = [
  { to: "/", label: "סקירה כללית", icon: LayoutDashboard, end: true },
  { to: "/leads", label: "לידים", icon: UserPlus },
  { to: "/contacts", label: "אנשי קשר", icon: BookUser },
  { to: "/properties", label: "נכסים", icon: Building2 },
  { to: "/deals", label: "עסקאות", icon: Handshake },
  { to: "/tasks", label: "משימות", icon: ListChecks },
  { to: "/calendar", label: "יומן", icon: CalendarDays },
  { to: "/automations", label: "אוטומציות", icon: Workflow },
  { to: "/reports", label: "דוחות", icon: BarChart3 },
  { to: "/settings", label: "הגדרות", icon: Settings },
]

export function getPageTitle(pathname) {
  if (pathname === "/") return "סקירה כללית"
  const match = NAV_ITEMS.filter((item) => item.to !== "/").find((item) => pathname.startsWith(item.to))
  return match?.label || "ESTATEFLOW"
}
