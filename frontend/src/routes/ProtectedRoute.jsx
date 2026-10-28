import { Navigate, Outlet, useLocation } from "react-router-dom"
import { useAuth } from "../context/AuthContext"
import LoadingSkeleton from "../components/ui/LoadingSkeleton"

export default function ProtectedRoute() {
  const { isAuthenticated, isLoading } = useAuth()
  const location = useLocation()

  if (isLoading) {
    return (
      <div className="flex h-screen items-center justify-center bg-app-bg">
        <LoadingSkeleton className="h-10 w-48" />
      </div>
    )
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace state={{ from: location }} />
  }

  return <Outlet />
}
