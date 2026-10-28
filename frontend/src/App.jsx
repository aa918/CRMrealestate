import { Routes, Route } from "react-router-dom"
import { AuthProvider } from "./context/AuthContext"
import ProtectedRoute from "./routes/ProtectedRoute"
import AppShell from "./components/shell/AppShell"

import LoginPage from "./pages/LoginPage"
import RegisterPage from "./pages/RegisterPage"
import DashboardPage from "./pages/DashboardPage"
import LeadsPage from "./pages/LeadsPage"
import ContactsPage from "./pages/ContactsPage"
import PropertiesPage from "./pages/PropertiesPage"
import DealsPage from "./pages/DealsPage"
import TasksPage from "./pages/TasksPage"
import CalendarPage from "./pages/CalendarPage"
import AutomationsPage from "./pages/AutomationsPage"
import ReportsPage from "./pages/ReportsPage"
import SettingsPage from "./pages/SettingsPage"
import NotFoundPage from "./pages/NotFoundPage"

export default function App() {
  return (
    <AuthProvider>
      <Routes>
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />

        <Route element={<ProtectedRoute />}>
          <Route element={<AppShell />}>
            <Route path="/" element={<DashboardPage />} />
            <Route path="/leads" element={<LeadsPage />} />
            <Route path="/contacts" element={<ContactsPage />} />
            <Route path="/properties" element={<PropertiesPage />} />
            <Route path="/deals" element={<DealsPage />} />
            <Route path="/tasks" element={<TasksPage />} />
            <Route path="/calendar" element={<CalendarPage />} />
            <Route path="/automations" element={<AutomationsPage />} />
            <Route path="/reports" element={<ReportsPage />} />
            <Route path="/settings" element={<SettingsPage />} />
          </Route>
        </Route>

        <Route path="*" element={<NotFoundPage />} />
      </Routes>
    </AuthProvider>
  )
}
