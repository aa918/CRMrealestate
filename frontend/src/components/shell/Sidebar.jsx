import { NavLink } from "react-router-dom"
import clsx from "clsx"
import { LogOut } from "lucide-react"
import Logo from "./Logo"
import Avatar from "../ui/Avatar"
import { NAV_ITEMS } from "./navItems"
import { useAuth } from "../../context/AuthContext"
import { ROLE_LABELS } from "../../lib/enums"

export default function Sidebar({ onNavigate }) {
  const { user, organization, logout } = useAuth()

  return (
    <aside className="flex h-full w-64 flex-col bg-navy text-white">
      <div className="px-5 py-6">
        <Logo theme="dark" />
      </div>

      <nav className="flex-1 overflow-y-auto px-3 py-2">
        <ul className="space-y-1">
          {NAV_ITEMS.map((item) => (
            <li key={item.to}>
              <NavLink
                to={item.to}
                end={item.end}
                onClick={onNavigate}
                className={({ isActive }) =>
                  clsx(
                    "focus-ring flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-colors",
                    isActive ? "bg-navy-light text-white" : "text-white/70 hover:bg-navy-light/60 hover:text-white"
                  )
                }
              >
                <item.icon className="size-[18px]" />
                {item.label}
              </NavLink>
            </li>
          ))}
        </ul>
      </nav>

      {user && (
        <div className="border-t border-white/10 p-4">
          <div className="flex items-center gap-3 rounded-xl px-2 py-2">
            <Avatar user={user} />
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-semibold text-white">
                {user.firstName} {user.lastName}
              </p>
              <p className="truncate text-xs text-white/50">
                {ROLE_LABELS[user.role] || user.role}
                {organization?.name ? ` · ${organization.name}` : ""}
              </p>
            </div>
          </div>
          <button
            onClick={logout}
            className="focus-ring mt-1 flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium text-white/70 transition-colors hover:bg-navy-light/60 hover:text-white"
          >
            <LogOut className="size-[18px]" />
            התנתקות
          </button>
        </div>
      )}
    </aside>
  )
}
