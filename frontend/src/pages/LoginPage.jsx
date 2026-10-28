import { useState } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { Link, useLocation, useNavigate } from "react-router-dom"
import { LogIn } from "lucide-react"
import Logo from "../components/shell/Logo"
import Button from "../components/ui/Button"
import { Field, Input } from "../components/ui/FormField"
import { useAuth } from "../context/AuthContext"
import { loginSchema } from "../lib/validation/auth.schema"
import { ApiError } from "../lib/apiClient"

export default function LoginPage() {
  const { login } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()
  const [formError, setFormError] = useState(null)

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm({ resolver: zodResolver(loginSchema) })

  const onSubmit = async (values) => {
    setFormError(null)
    try {
      await login(values.email, values.password)
      navigate(location.state?.from?.pathname || "/", { replace: true })
    } catch (err) {
      setFormError(err instanceof ApiError ? err.message : "ההתחברות נכשלה. נסה שוב.")
    }
  }

  return (
    <div className="flex min-h-screen">
      <div className="hidden w-1/2 flex-col justify-between bg-navy p-12 text-white lg:flex">
        <Logo theme="dark" />
        <div>
          <h2 className="text-3xl font-bold leading-tight">
            ה-CRM שמבין
            <br />
            נדל"ן ישראלי
          </h2>
          <p className="mt-4 max-w-sm text-white/60">
            לידים, נכסים ועסקאות במקום אחד - עם מדידת זמן תגובה אמיתית, כדי שאף ליד לא יישאר בלי מענה.
          </p>
        </div>
        <p className="text-xs text-white/40">© {new Date().getFullYear()} ESTATEFLOW</p>
      </div>

      <div className="flex w-full flex-col items-center justify-center bg-app-bg px-6 py-12 lg:w-1/2">
        <div className="mb-8 lg:hidden">
          <Logo theme="light" />
        </div>

        <div className="w-full max-w-sm rounded-2xl border border-border bg-white p-8 shadow-sm">
          <h1 className="text-xl font-bold text-text">התחברות לחשבון</h1>
          <p className="mt-1 text-sm text-muted">היכנס כדי לגשת ללוח הבקרה שלך</p>

          <form onSubmit={handleSubmit(onSubmit)} className="mt-6 space-y-4">
            <Field label="אימייל" required error={errors.email?.message}>
              <Input type="email" autoComplete="email" dir="ltr" className="text-left" {...register("email")} />
            </Field>
            <Field label="סיסמה" required error={errors.password?.message}>
              <Input type="password" autoComplete="current-password" {...register("password")} />
            </Field>

            {formError && (
              <div className="rounded-lg bg-danger-bg px-3 py-2 text-sm text-danger">{formError}</div>
            )}

            <Button type="submit" className="w-full" icon={LogIn} isLoading={isSubmitting}>
              התחברות
            </Button>
          </form>

          <p className="mt-6 text-center text-sm text-muted">
            עדיין אין לך משרד רשום?{" "}
            <Link to="/register" className="font-medium text-brand hover:underline">
              הרשמת המשרד שלך
            </Link>
          </p>
        </div>
      </div>
    </div>
  )
}
