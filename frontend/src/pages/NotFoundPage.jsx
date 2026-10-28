import { Link } from "react-router-dom"
import { CompassIcon } from "lucide-react"
import Button from "../components/ui/Button"

export default function NotFoundPage() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-4 bg-app-bg px-6 text-center">
      <span className="flex size-14 items-center justify-center rounded-2xl bg-info-bg text-brand">
        <CompassIcon className="size-7" />
      </span>
      <h1 className="text-2xl font-bold text-text">הדף לא נמצא</h1>
      <p className="max-w-sm text-sm text-muted">הכתובת שחיפשת לא קיימת במערכת, או שאין לך הרשאה לצפות בה.</p>
      <Link to="/">
        <Button>חזרה לדף הבית</Button>
      </Link>
    </div>
  )
}
