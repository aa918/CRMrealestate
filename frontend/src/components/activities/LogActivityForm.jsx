import { useState } from "react"
import { Phone, MessageCircle, Mail, StickyNote, Send } from "lucide-react"
import clsx from "clsx"
import Button from "../ui/Button"
import { Textarea } from "../ui/FormField"
import { useCreateActivity } from "../../hooks/useActivities"

const TYPES = [
  { value: "CALL", label: "שיחה", icon: Phone, hasDirection: true },
  { value: "WHATSAPP", label: "וואטסאפ", icon: MessageCircle, hasDirection: true },
  { value: "EMAIL", label: "אימייל", icon: Mail, hasDirection: true },
  { value: "NOTE", label: "הערה", icon: StickyNote, hasDirection: false },
]

const DEFAULT_DESCRIPTIONS = {
  CALL: "שיחת טלפון עם הלקוח",
  WHATSAPP: "הודעת וואטסאפ נשלחה ללקוח",
  EMAIL: "אימייל נשלח ללקוח",
  NOTE: "",
}

/**
 * Logging a CALL / outbound WHATSAPP / outbound EMAIL here is exactly what
 * flips a lead from WAITING to RESPONDED on the backend (Speed-to-Lead) -
 * this is a real action, not a cosmetic log.
 */
export default function LogActivityForm({ contactId, leadId, onLogged }) {
  const [type, setType] = useState("CALL")
  const [direction, setDirection] = useState("OUTBOUND")
  const [description, setDescription] = useState(DEFAULT_DESCRIPTIONS.CALL)
  const createActivity = useCreateActivity()

  const selectType = (value) => {
    setType(value)
    setDescription(DEFAULT_DESCRIPTIONS[value] || "")
  }

  const submit = async (e) => {
    e.preventDefault()
    if (!description.trim()) return
    const activeType = TYPES.find((t) => t.value === type)
    await createActivity.mutateAsync({
      contactId,
      leadId,
      type,
      direction: activeType.hasDirection ? direction : undefined,
      description: description.trim(),
    })
    setDescription(DEFAULT_DESCRIPTIONS[type] || "")
    onLogged?.()
  }

  const activeType = TYPES.find((t) => t.value === type)

  return (
    <form onSubmit={submit} className="space-y-3 rounded-xl border border-border bg-slate-50/60 p-3">
      <div className="flex flex-wrap gap-1.5">
        {TYPES.map((t) => (
          <button
            key={t.value}
            type="button"
            onClick={() => selectType(t.value)}
            className={clsx(
              "focus-ring flex items-center gap-1.5 rounded-lg border px-2.5 py-1.5 text-xs font-medium transition-colors",
              type === t.value ? "border-brand bg-info-bg text-brand" : "border-border bg-white text-muted hover:text-text"
            )}
          >
            <t.icon className="size-3.5" />
            {t.label}
          </button>
        ))}

        {activeType.hasDirection && (
          <div className="mr-auto flex items-center gap-1 rounded-lg bg-slate-200 p-0.5 text-xs">
            <button
              type="button"
              onClick={() => setDirection("OUTBOUND")}
              className={clsx("rounded-md px-2 py-1 font-medium", direction === "OUTBOUND" ? "bg-white shadow-sm" : "text-muted")}
            >
              יוצאת (אנחנו)
            </button>
            <button
              type="button"
              onClick={() => setDirection("INBOUND")}
              className={clsx("rounded-md px-2 py-1 font-medium", direction === "INBOUND" ? "bg-white shadow-sm" : "text-muted")}
            >
              נכנסת (מהלקוח)
            </button>
          </div>
        )}
      </div>

      <Textarea
        value={description}
        onChange={(e) => setDescription(e.target.value)}
        placeholder="תיאור הפעילות..."
        rows={2}
      />

      {activeType.hasDirection && direction === "OUTBOUND" && (
        <p className="text-[11px] text-muted">פעילות יוצאת ראשונה תירשם כמענה הראשון של הסוכן ותעדכן את מד זמן התגובה.</p>
      )}

      {createActivity.isError && <p className="text-xs text-danger">{createActivity.error.message}</p>}

      <div className="flex justify-end">
        <Button type="submit" size="sm" icon={Send} isLoading={createActivity.isPending} disabled={!description.trim()}>
          תיעוד פעילות
        </Button>
      </div>
    </form>
  )
}
