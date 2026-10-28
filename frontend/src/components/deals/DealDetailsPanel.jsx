import { useState } from "react"
import { useNavigate } from "react-router-dom"
import { Pencil, Trash2, ExternalLink } from "lucide-react"
import SidePanel from "../ui/SidePanel"
import Button from "../ui/Button"
import StatusBadge from "../ui/StatusBadge"
import ConfirmDialog from "../ui/ConfirmDialog"
import ActivityTimeline from "../activities/ActivityTimeline"
import DealFormModal from "./DealFormModal"
import { useDeal, useDeleteDeal } from "../../hooks/useDeals"
import { useActivities } from "../../hooks/useActivities"
import { useAuth } from "../../context/AuthContext"
import { fullName, formatCurrency, formatDate } from "../../lib/format"
import { DEAL_STAGE_LABELS } from "../../lib/enums"
import { DEAL_STAGE_TONE } from "../../lib/statusTones"

export default function DealDetailsPanel({ dealId, open, onClose }) {
  const { user } = useAuth()
  const navigate = useNavigate()
  const [editOpen, setEditOpen] = useState(false)
  const [confirmDelete, setConfirmDelete] = useState(false)
  const canManage = user?.role === "ADMIN" || user?.role === "MANAGER"

  const { data: deal, isLoading } = useDeal(dealId)
  const deleteDeal = useDeleteDeal()

  // Activity history: precise (lead-scoped) when the deal has a linked
  // lead, otherwise the contact's overall timeline - Activity has no
  // dealId field on the backend, so this is the closest honest mapping.
  const activityFilter = deal?.leadId ? { leadId: deal.leadId } : deal?.contactId ? { contactId: deal.contactId } : {}
  const { data: activities, isLoading: activitiesLoading } = useActivities({ ...activityFilter, limit: 30 })

  if (!open) return null

  return (
    <>
      <SidePanel
        open={open}
        onClose={onClose}
        title={deal?.title || "טוען..."}
        subtitle={deal ? formatCurrency(deal.value) : ""}
        headerExtra={
          deal && (
            <Button size="sm" variant="ghost" icon={Pencil} onClick={() => setEditOpen(true)}>
              עריכה
            </Button>
          )
        }
      >
        {isLoading || !deal ? (
          <div className="p-6 text-sm text-muted">טוען פרטי עסקה...</div>
        ) : (
          <div className="space-y-6 p-6">
            <div className="flex items-center gap-2">
              <StatusBadge tone={DEAL_STAGE_TONE[deal.stage]}>{DEAL_STAGE_LABELS[deal.stage]}</StatusBadge>
              <span className="text-xs text-muted">סבירות סגירה: {deal.probability}%</span>
            </div>

            <div className="grid grid-cols-2 gap-4 rounded-xl border border-border p-4 text-sm">
              <div>
                <p className="text-xs text-muted">איש קשר</p>
                <button
                  onClick={() => navigate(`/contacts?open=${deal.contactId}`)}
                  className="mt-0.5 flex items-center gap-1 font-medium text-brand hover:underline"
                >
                  {fullName(deal.contact)} <ExternalLink className="size-3" />
                </button>
              </div>
              <div>
                <p className="text-xs text-muted">בעלים</p>
                <p className="mt-0.5 font-medium text-text">{deal.owner ? fullName(deal.owner) : "—"}</p>
              </div>
              <div>
                <p className="text-xs text-muted">נכס מקושר</p>
                <p className="mt-0.5 font-medium text-text">{deal.property ? deal.property.title : "לא מקושר"}</p>
              </div>
              <div>
                <p className="text-xs text-muted">תאריך סגירה משוער</p>
                <p className="mt-0.5 font-medium text-text">{deal.expectedCloseDate ? formatDate(deal.expectedCloseDate) : "—"}</p>
              </div>
              {deal.closedAt && (
                <div>
                  <p className="text-xs text-muted">נסגר בתאריך</p>
                  <p className="mt-0.5 font-medium text-text">{formatDate(deal.closedAt)}</p>
                </div>
              )}
            </div>

            <div>
              <h4 className="mb-2 text-sm font-semibold text-text">ציר זמן פעילות</h4>
              <ActivityTimeline
                activities={activities?.data}
                isLoading={activitiesLoading}
                emptyHint="פעילויות של הלקוח או הליד המקושר יופיעו כאן"
              />
            </div>

            {canManage && (
              <div className="border-t border-border pt-4">
                <Button variant="danger" size="sm" icon={Trash2} onClick={() => setConfirmDelete(true)}>
                  מחיקת עסקה
                </Button>
              </div>
            )}
          </div>
        )}
      </SidePanel>

      <DealFormModal open={editOpen} onClose={() => setEditOpen(false)} deal={deal} onSaved={() => setEditOpen(false)} />

      <ConfirmDialog
        open={confirmDelete}
        onClose={() => setConfirmDelete(false)}
        title="מחיקת עסקה"
        description="פעולה זו תמחק את העסקה לצמיתות."
        confirmLabel="מחיקה"
        isLoading={deleteDeal.isPending}
        onConfirm={async () => {
          await deleteDeal.mutateAsync(dealId)
          setConfirmDelete(false)
          onClose()
        }}
      />
    </>
  )
}
