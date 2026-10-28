import { useState } from "react"
import { Outlet, useLocation } from "react-router-dom"
import Sidebar from "./Sidebar"
import Topbar from "./Topbar"
import { getPageTitle } from "./navItems"

export default function AppShell() {
  const [mobileNavOpen, setMobileNavOpen] = useState(false)
  const location = useLocation()
  const title = getPageTitle(location.pathname)

  return (
    <div className="flex h-screen overflow-hidden bg-app-bg">
      {/* Desktop sidebar */}
      <div className="hidden lg:block">
        <Sidebar />
      </div>

      {/* Mobile sidebar drawer */}
      {mobileNavOpen && (
        <div className="fixed inset-0 z-50 flex lg:hidden">
          <div className="absolute inset-0 bg-slate-900/50" onClick={() => setMobileNavOpen(false)} />
          <div className="relative z-10">
            <Sidebar onNavigate={() => setMobileNavOpen(false)} />
          </div>
        </div>
      )}

      <div className="flex min-w-0 flex-1 flex-col">
        <Topbar title={title} onMenuClick={() => setMobileNavOpen(true)} />
        <main className="flex-1 overflow-y-auto">
          <div className="mx-auto max-w-[1400px] px-4 py-6 sm:px-6">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  )
}
