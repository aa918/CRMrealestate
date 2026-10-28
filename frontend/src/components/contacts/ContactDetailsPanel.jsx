import { useState } from "react"
import { useNavigate } from "react-router-dom"
import { Phone, Mail, Pencil, ExternalLink } from "lucide-react"
import SidePanel from "../ui/SidePanel"
import Button from "../ui/Button"
import StatusBadge from "../ui/StatusBadge"
import ActivityTimeline from "../activities/ActivityTimeline"
import LogActivityForm from "../activities/LogActivityForm"
import TaskCard from "../tasks/TaskCard"
import DealCard from "../deals/DealCard"
import ContactFormModal from "./ContactFormModal"
import { useContact, useContactActivities } from "../../hooks/useContacts"
import { useContactLeads } from "../../hooks/useLeads"
import { useContactDeals } from "../../hooks/useDeals"
import { useTasks } from "../../hooks/useTasks"
import { fullName, formatDate } from "../../lib/format"
import { LEAD_STATUS_LABELS, RESPONSE_STATUS_LABELS } from "../../lib/enums"
import { RESPONSE_STATUS_TONE } from "../../lib/statusTones"

export default function ContactDetailsPanel({ contactId, open, onClose }) {
  const navigate = useNavigate()
  const [editOpen, setEditOpen] = useState(false)

  const { data: contact, isLoading } = useContact(contactId)
  const { data: leads, isLoading: leadsLoading } = useContactLeads(contactId)
  const { data: deals, isLoading: dealsLoading } = useContactDeals(contactId)
  const { data: tasks, isLoading: tasksLoading } = useTasks({ contactId, limit: 20 })
  const { data: activities, isLoading: activitiesLoading } = useContactActivities(contactId, { limit: 50 })

  if (!open) return null

  return (
    <>
      <SidePanel
        open={open}
        onClose={onClose}
        title={contact ? fullName(contact) : "טוען..."}
        subtitle={contact ? `איש קשר מאז ${formatDate(contact.createdAt)}` : ""}
        headerExtra={
          contact && (
            <Button size="sm" variant="ghost" icon={Pencil} onClick={() => setEditOpen(true)}>
              עריכה
            </Button>
          )
        }
      >
        {isLoading || !contact ? (
          <div className="p-6 text-sm text-muted">טוען פרטי איש קשר...</div>
        ) : (
          <div className="space-y-6 p-6">
            <div className="rounded-xl border border-border p-4">
              <div className="grid grid-cols-2 gap-3 text-sm">
                <p className="flex items-center gap-2 text-text">
                  <Phone className="size-3.5 text-muted" /> <span dir="ltr">{contact.phone}</span>
                </p>
                <p className="flex items-center gap-2 text-text">
                  <Mail className="size-3.5 text-muted" /> {contact.email || "—"}
                </p>
              </div>
              {contact.notes && <p className="mt-3 rounded-lg bg-slate-50 p-3 text-sm text-muted">{contact.notes}</p>}
            </div>

            <div>
              <h4 className="mb-2 text-sm font-semibold text-text">תיעוד פעילות</h4>
              <LogActivityForm contactId={contact.id} />
            </div>

            <div>
              <h4 className="mb-2 text-sm font-semibold text-text">לידים משויכים ({leads?.pagination?.total ?? 0})</h4>
              {leadsLoading ? (
                <p className="text-xs text-muted">טוען...</p>
              ) : leads?.data?.length ? (
                <ul className="space-y-2">
                  {leads.data.map((lead) => (
                    <li
                      key={lead.id}
                      onClick={() => navigate(`/leads?open=${lead.id}`)}
                      className="flex cursor-pointer items-center justify-between rounded-xl border border-border bg-white p-3 hover:shadow-sm"
                    >
                      <div>
                        <p className="text-sm font-medium text-text">{LEAD_STATUS_LABELS[lead.status]}</p>
                        <p className="text-xs text-muted">{formatDate(lead.receivedAt)}</p>
                      </div>
                      <div className="flex items-center gap-2">
                        <StatusBadge tone={RESPONSE_STATUS_TONE[lead.responseStatus]}>
                          {RESPONSE_STATUS_LABELS[lead.responseStatus]}
                        </StatusBadge>
                        <ExternalLink className="size-3.5 text-muted" />
                      </div>
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="text-xs text-muted">אין לידים משויכים</p>
              )}
            </div>

            {deals?.data?.length > 0 && (
              <div>
                <h4 className="mb-2 text-sm font-semibold text-text">עסקאות ({deals.pagination.total})</h4>
                <div className="space-y-2">
                  {deals.data.map((deal) => (
                    <DealCard key={deal.id} deal={deal} onClick={() => navigate(`/deals?open=${deal.id}`)} compact />
                  ))}
                </div>
              </div>
            )}
            {dealsLoading && <p className="text-xs text-muted">טוען עסקאות...</p>}

            {tasks?.data?.length > 0 && (
              <div>
                <h4 className="mb-2 text-sm font-semibold text-text">משימות ({tasks.pagination.total})</h4>
                <div className="space-y-2">
                  {tasks.data.map((task) => (
                    <TaskCard key={task.id} task={task} compact />
                  ))}
                </div>
              </div>
            )}
            {tasksLoading && <p className="text-xs text-muted">טוען משימות...</p>}

            <div>
              <h4 className="mb-2 text-sm font-semibold text-text">ציר זמן פעילות</h4>
              <ActivityTimeline activities={activities?.data} isLoading={activitiesLoading} />
            </div>
          </div>
        )}
      </SidePanel>

      <ContactFormModal open={editOpen} onClose={() => setEditOpen(false)} contact={contact} onSaved={() => setEditOpen(false)} />
    </>
  )
}
