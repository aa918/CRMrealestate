import { useState } from "react"
import { useNavigate } from "react-router-dom"
import { Phone, Mail, MapPin, Wallet, BedDouble, ExternalLink, Plus, Trash2 } from "lucide-react"
import SidePanel from "../ui/SidePanel"
import StatusBadge from "../ui/StatusBadge"
import Button from "../ui/Button"
import { Select } from "../ui/FormField"
import ConfirmDialog from "../ui/ConfirmDialog"
import ActivityTimeline from "../activities/ActivityTimeline"
import LogActivityForm from "../activities/LogActivityForm"
import TaskCard from "../tasks/TaskCard"
import TaskFormModal from "../tasks/TaskFormModal"
import DealCard from "../deals/DealCard"
import { useLead, useUpdateLead, useDeleteLead } from "../../hooks/useLeads"
import { useLeadActivities } from "../../hooks/useActivities"
import { useLeadTasks } from "../../hooks/useTasks"
import { useLeadDeals } from "../../hooks/useDeals"
import { useAgents } from "../../hooks/useUsers"
import { useAuth } from "../../context/AuthContext"
import { fullName, formatDateTime, formatDuration, formatCurrency } from "../../lib/format"
import {
  LEAD_STATUS,
  LEAD_STATUS_LABELS,
  RESPONSE_STATUS_LABELS,
  LEAD_SOURCE_LABELS,
  INTEREST_TYPE_LABELS,
  PROPERTY_KIND_LABELS,
} from "../../lib/enums"
import { RESPONSE_STATUS_TONE } from "../../lib/statusTones"

export default function LeadDetailsPanel({ leadId, open, onClose }) {
  const { user } = useAuth()
  const navigate = useNavigate()
  const [confirmDelete, setConfirmDelete] = useState(false)
  const [taskModalOpen, setTaskModalOpen] = useState(false)

  const { data: lead, isLoading } = useLead(leadId)
  const { data: activities, isLoading: activitiesLoading } = useLeadActivities(leadId)
  const { data: tasks, isLoading: tasksLoading } = useLeadTasks(leadId)
  const { data: deals, isLoading: dealsLoading } = useLeadDeals(leadId)
  const { data: agents } = useAgents()

  const updateLead = useUpdateLead()
  const deleteLead = useDeleteLead()

  const canManage = user?.role === "ADMIN" || user?.role === "MANAGER"

  if (!open) return null

  return (
    <>
      <SidePanel
        open={open}
        onClose={onClose}
        title={lead ? fullName(lead.contact) : "טוען..."}
        subtitle={lead ? `ליד #${lead.id.slice(-6)} · ${LEAD_SOURCE_LABELS[lead.source]}` : ""}
      >
        {isLoading || !lead ? (
          <div className="p-6 text-sm text-muted">טוען פרטי ליד...</div>
        ) : (
          <div className="space-y-6 p-6">
            {/* Status + response timer */}
            <div className="flex flex-wrap items-center gap-2">
              <StatusBadge tone={RESPONSE_STATUS_TONE[lead.responseStatus]}>
                {RESPONSE_STATUS_LABELS[lead.responseStatus]}
              </StatusBadge>
              <span className="text-xs text-muted">
                התקבל {formatDateTime(lead.receivedAt)} ({formatDuration(lead.receivedAt, lead.firstResponseAt)}
                {lead.firstResponseAt ? " למענה" : " ומחכה"})
              </span>
            </div>

            {/* Status + assignment controls */}
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="mb-1 block text-xs font-medium text-muted">סטטוס ליד</label>
                <Select
                  value={lead.status}
                  onChange={(e) => updateLead.mutate({ id: lead.id, payload: { status: e.target.value } })}
                >
                  {LEAD_STATUS.map((s) => (
                    <option key={s} value={s}>
                      {LEAD_STATUS_LABELS[s]}
                    </option>
                  ))}
                </Select>
              </div>
              <div>
                <label className="mb-1 block text-xs font-medium text-muted">סוכן מוקצה</label>
                <Select
                  value={lead.assignedUserId || ""}
                  onChange={(e) =>
                    updateLead.mutate({ id: lead.id, payload: { assignedUserId: e.target.value || null } })
                  }
                >
                  <option value="">לא מוקצה</option>
                  {agents?.data?.map((agent) => (
                    <option key={agent.id} value={agent.id}>
                      {fullName(agent)}
                    </option>
                  ))}
                </Select>
              </div>
            </div>
            {updateLead.isError && <p className="text-xs text-danger">{updateLead.error.message}</p>}

            {/* Contact & lead info */}
            <div className="rounded-xl border border-border p-4">
              <div className="flex items-center justify-between">
                <h4 className="text-sm font-semibold text-text">פרטי הליד</h4>
                <button
                  onClick={() => navigate(`/contacts?open=${lead.contactId}`)}
                  className="flex items-center gap-1 text-xs font-medium text-brand hover:underline"
                >
                  כרטיס איש קשר מלא
                  <ExternalLink className="size-3" />
                </button>
              </div>
              <div className="mt-3 grid grid-cols-2 gap-3 text-sm">
                <p className="flex items-center gap-2 text-text">
                  <Phone className="size-3.5 text-muted" /> <span dir="ltr">{lead.contact?.phone}</span>
                </p>
                <p className="flex items-center gap-2 text-text">
                  <Mail className="size-3.5 text-muted" /> {lead.contact?.email || "—"}
                </p>
                <p className="flex items-center gap-2 text-text">
                  <MapPin className="size-3.5 text-muted" /> {lead.city || "—"}
                </p>
                <p className="flex items-center gap-2 text-text">
                  <Wallet className="size-3.5 text-muted" /> {formatCurrency(lead.budget)}
                </p>
                <p className="flex items-center gap-2 text-text">
                  <BedDouble className="size-3.5 text-muted" /> {lead.bedrooms ?? "—"} חדרים
                </p>
                <p className="text-text">
                  {INTEREST_TYPE_LABELS[lead.interestType] || "—"} · {PROPERTY_KIND_LABELS[lead.propertyType] || "—"}
                </p>
              </div>
              {lead.message && <p className="mt-3 rounded-lg bg-slate-50 p-3 text-sm text-muted">{lead.message}</p>}
            </div>

            {/* Quick action: log activity */}
            <div>
              <h4 className="mb-2 text-sm font-semibold text-text">תיעוד פעילות</h4>
              <LogActivityForm contactId={lead.contactId} leadId={lead.id} />
            </div>

            {/* Tasks */}
            <div>
              <div className="mb-2 flex items-center justify-between">
                <h4 className="text-sm font-semibold text-text">משימות</h4>
                <Button size="sm" variant="subtle" icon={Plus} onClick={() => setTaskModalOpen(true)}>
                  משימה חדשה
                </Button>
              </div>
              {tasksLoading ? (
                <p className="text-xs text-muted">טוען משימות...</p>
              ) : tasks?.data?.length ? (
                <div className="space-y-2">
                  {tasks.data.map((task) => (
                    <TaskCard key={task.id} task={task} compact />
                  ))}
                </div>
              ) : (
                <p className="text-xs text-muted">אין משימות לליד זה</p>
              )}
            </div>

            {/* Linked deals */}
            {deals?.data?.length > 0 && (
              <div>
                <h4 className="mb-2 text-sm font-semibold text-text">עסקאות מקושרות</h4>
                <div className="space-y-2">
                  {deals.data.map((deal) => (
                    <DealCard key={deal.id} deal={deal} onClick={() => navigate(`/deals?open=${deal.id}`)} compact />
                  ))}
                </div>
              </div>
            )}
            {dealsLoading && <p className="text-xs text-muted">טוען עסקאות...</p>}

            {/* Activity timeline */}
            <div>
              <h4 className="mb-2 text-sm font-semibold text-text">ציר זמן פעילות</h4>
              <ActivityTimeline activities={activities?.data} isLoading={activitiesLoading} />
            </div>

            {canManage && (
              <div className="border-t border-border pt-4">
                <Button variant="danger" size="sm" icon={Trash2} onClick={() => setConfirmDelete(true)}>
                  מחיקת ליד
                </Button>
              </div>
            )}
          </div>
        )}
      </SidePanel>

      {lead && (
        <TaskFormModal
          open={taskModalOpen}
          onClose={() => setTaskModalOpen(false)}
          contactId={lead.contactId}
          leadId={lead.id}
          defaultTitle={`פולו אפ - ${fullName(lead.contact)}`}
          onCreated={() => setTaskModalOpen(false)}
        />
      )}

      <ConfirmDialog
        open={confirmDelete}
        onClose={() => setConfirmDelete(false)}
        title="מחיקת ליד"
        description="פעולה זו תמחק את הליד לצמיתות. אנשי קשר, משימות ועסקאות מקושרות יישארו במערכת."
        confirmLabel="מחיקה"
        isLoading={deleteLead.isPending}
        onConfirm={async () => {
          await deleteLead.mutateAsync(leadId)
          setConfirmDelete(false)
          onClose()
        }}
      />
    </>
  )
}
