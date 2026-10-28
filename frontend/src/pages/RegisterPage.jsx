import { useState } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { Link, useNavigate } from "react-router-dom"
import { Rocket } from "lucide-react"
import Logo from "../components/shell/Logo"
import Button from "../components/ui/Button"
import { Field, Input } from "../components/ui/FormField"
import { useAuth } from "../context/AuthContext"
import { registerSchema } from "../lib/validation/auth.schema"
import { ApiError } from "../lib/apiClient"

export default function RegisterPage() {
  const { register: registerOrg } = useAuth()
  const navigate = useNavigate()
  const [formError, setFormError] = useState(null)

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm({ resolver: zodResolver(registerSchema) })

  const onSubmit = async (values) => {
    setFormError(null)
    try {
      const payload = {
        organizationName: values.organizationName,
        organizationPhone: values.organizationPhone || undefined,
        organizationEmail: values.organizationEmail || undefined,
        firstName: values.firstName,
        lastName: values.lastName,
        email: values.email,
        password: values.password,
        phone: values.phone || undefined,
      }
      await registerOrg(payload)
      navigate("/", { replace: true })
    } catch (err) {
      setFormError(err instanceof ApiError ? err.message : "ההרשמה נכשלה. נסה שוב.")
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-app-bg px-6 py-12">
      <div className="w-full max-w-lg rounded-2xl border border-border bg-white p-8 shadow-sm">
        <Logo theme="light" />
        <h1 className="mt-6 text-xl font-bold text-text">הרשמת המשרד שלך ל-ESTATEFLOW</h1>
        <p className="mt-1 text-sm text-muted">ייווצר ארגון חדש ומשתמש מנהל ראשון בשבילך</p>

        <form onSubmit={handleSubmit(onSubmit)} className="mt-6 space-y-4">
          <Field label="שם המשרד" required error={errors.organizationName?.message}>
            <Input placeholder="לדוגמה: נדל״ן פרימיום" {...register("organizationName")} />
          </Field>

          <div className="grid grid-cols-2 gap-4">
            <Field label="טלפון המשרד" error={errors.organizationPhone?.message}>
              <Input dir="ltr" className="text-left" {...register("organizationPhone")} />
            </Field>
            <Field label="אימייל המשרד" error={errors.organizationEmail?.message}>
              <Input dir="ltr" className="text-left" {...register("organizationEmail")} />
            </Field>
          </div>

          <div className="h-px bg-border" />

          <div className="grid grid-cols-2 gap-4">
            <Field label="שם פרטי" required error={errors.firstName?.message}>
              <Input {...register("firstName")} />
            </Field>
            <Field label="שם משפחה" required error={errors.lastName?.message}>
              <Input {...register("lastName")} />
            </Field>
          </div>

          <Field label="אימייל אישי" required error={errors.email?.message}>
            <Input type="email" dir="ltr" className="text-left" {...register("email")} />
          </Field>

          <div className="grid grid-cols-2 gap-4">
            <Field label="סיסמה" required error={errors.password?.message} hint="לפחות 8 תווים">
              <Input type="password" {...register("password")} />
            </Field>
            <Field label="טלפון אישי" error={errors.phone?.message}>
              <Input dir="ltr" className="text-left" {...register("phone")} />
            </Field>
          </div>

          {formError && <div className="rounded-lg bg-danger-bg px-3 py-2 text-sm text-danger">{formError}</div>}

          <Button type="submit" className="w-full" icon={Rocket} isLoading={isSubmitting}>
            יצירת המשרד שלי
          </Button>
        </form>

        <p className="mt-6 text-center text-sm text-muted">
          יש לך כבר חשבון?{" "}
          <Link to="/login" className="font-medium text-brand hover:underline">
            התחברות
          </Link>
        </p>
      </div>
    </div>
  )
}
