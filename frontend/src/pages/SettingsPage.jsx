import { useEffect, useState } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { Copy, Check, Plus, UserCog } from "lucide-react"
import PageHeader from "../components/ui/PageHeader"
import Card from "../components/ui/Card"
import Button from "../components/ui/Button"
import StatusBadge from "../components/ui/StatusBadge"
import { Field, Input } from "../components/ui/FormField"
import { TableSkeleton } from "../components/ui/LoadingSkeleton"
import UserFormModal from "../components/settings/UserFormModal"
import { useAuth } from "../context/AuthContext"
import { useUpdateUser, useUsers } from "../hooks/useUsers"
import { profileSchema } from "../lib/validation/user.schema"
import { ROLE_LABELS } from "../lib/enums"
import { fullName } from "../lib/format"

function ProfileCard() {
  const { user, refresh } = useAuth()
  const updateUser = useUpdateUser()
  const [saved, setSaved] = useState(false)

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm({ resolver: zodResolver(profileSchema) })

  useEffect(() => {
    if (user) reset({ firstName: user.firstName, lastName: user.lastName, phone: user.phone || "", password: "" })
  }, [user, reset])

  const onSubmit = async (values) => {
    const payload = Object.fromEntries(Object.entries(values).filter(([, v]) => v !== ""))
    await updateUser.mutateAsync({ id: user.id, payload })
    await refresh()
    setSaved(true)
    setTimeout(() => setSaved(false), 2500)
  }

  return (
    <Card>
      <h3 className="mb-4 text-sm font-semibold text-text">הפרופיל שלי</h3>
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <Field label="שם פרטי" error={errors.firstName?.message}>
            <Input {...register("firstName")} />
          </Field>
          <Field label="שם משפחה" error={errors.lastName?.message}>
            <Input {...register("lastName")} />
          </Field>
        </div>
        <Field label="טלפון" error={errors.phone?.message}>
          <Input dir="ltr" className="text-left" {...register("phone")} />
        </Field>
        <Field label="סיסמה חדשה" error={errors.password?.message} hint="השאר ריק אם לא רוצים לשנות">
          <Input type="password" {...register("password")} />
        </Field>
        {updateUser.isError && <p className="text-xs text-danger">{updateUser.error.message}</p>}
        <div className="flex items-center gap-2">
          <Button type="submit" isLoading={isSubmitting}>
            שמירה
          </Button>
          {saved && <span className="text-sm text-success">נשמר בהצלחה</span>}
        </div>
      </form>
    </Card>
  )
}

function OrganizationCard() {
  const { organization } = useAuth()
  const [copied, setCopied] = useState(false)

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(organization.publicApiKey)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch {
      // clipboard unavailable - the key is still visible to copy manually
    }
  }

  if (!organization) return null

  return (
    <Card>
      <h3 className="mb-4 text-sm font-semibold text-text">המשרד שלי</h3>
      <div className="space-y-3 text-sm">
        <div>
          <p className="text-xs text-muted">שם המשרד</p>
          <p className="font-medium text-text">{organization.name}</p>
        </div>
        <div>
          <p className="text-xs text-muted">מפתח API לטופס לידים ציבורי</p>
          <p className="mb-1 text-xs text-muted">
            שלחו מפתח זה בכותרת <code dir="ltr" className="rounded bg-slate-100 px-1">x-public-api-key</code> בעת
            שליחת ליד מטופס האתר ל-<code dir="ltr" className="rounded bg-slate-100 px-1">POST /api/public/leads</code>
          </p>
          <div className="flex items-center gap-2">
            <code dir="ltr" className="flex-1 truncate rounded-lg bg-slate-100 px-3 py-2 text-xs">
              {organization.publicApiKey}
            </code>
            <Button size="sm" variant="secondary" icon={copied ? Check : Copy} onClick={copy}>
              {copied ? "הועתק" : "העתקה"}
            </Button>
          </div>
        </div>
      </div>
    </Card>
  )
}

function TeamCard() {
  const { data, isLoading } = useUsers({ limit: 50 })
  const updateUser = useUpdateUser()
  const [addOpen, setAddOpen] = useState(false)

  return (
    <Card padded={false}>
      <div className="flex items-center justify-between px-5 pt-4">
        <h3 className="text-sm font-semibold text-text">הצוות</h3>
        <Button size="sm" icon={Plus} onClick={() => setAddOpen(true)}>
          הוספת איש צוות
        </Button>
      </div>

      <div className="mt-3">
        {isLoading ? (
          <div className="px-5 pb-4">
            <TableSkeleton rows={3} cols={4} />
          </div>
        ) : (
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border bg-slate-50/70 text-right text-xs font-semibold text-muted">
                <th className="px-5 py-2">שם</th>
                <th className="px-5 py-2">אימייל</th>
                <th className="px-5 py-2">תפקיד</th>
                <th className="px-5 py-2">סטטוס</th>
              </tr>
            </thead>
            <tbody>
              {data?.data?.map((u) => (
                <tr key={u.id} className="border-b border-border last:border-0">
                  <td className="px-5 py-2.5 font-medium text-text">{fullName(u)}</td>
                  <td className="px-5 py-2.5 text-muted" dir="ltr">{u.email}</td>
                  <td className="px-5 py-2.5">{ROLE_LABELS[u.role]}</td>
                  <td className="px-5 py-2.5">
                    <button onClick={() => updateUser.mutate({ id: u.id, payload: { isActive: !u.isActive } })}>
                      <StatusBadge tone={u.isActive ? "success" : "neutral"}>{u.isActive ? "פעיל" : "לא פעיל"}</StatusBadge>
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      <UserFormModal open={addOpen} onClose={() => setAddOpen(false)} onCreated={() => setAddOpen(false)} />
    </Card>
  )
}

export default function SettingsPage() {
  const { user } = useAuth()
  const canManageTeam = user?.role === "ADMIN" || user?.role === "MANAGER"

  return (
    <div>
      <PageHeader title="הגדרות" description="פרופיל אישי, פרטי המשרד וניהול צוות" />

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        <ProfileCard />
        <OrganizationCard />
      </div>

      {canManageTeam ? (
        <div className="mt-4">
          <TeamCard />
        </div>
      ) : (
        <Card className="mt-4 flex items-center gap-3">
          <span className="flex size-10 items-center justify-center rounded-xl bg-info-bg text-brand">
            <UserCog className="size-5" />
          </span>
          <p className="text-sm text-muted">ניהול צוות זמין למנהלים בלבד</p>
        </Card>
      )}
    </div>
  )
}
