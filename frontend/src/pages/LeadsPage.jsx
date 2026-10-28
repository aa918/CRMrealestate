import { useMemo, useState } from "react"
import { useSearchParams } from "react-router-dom"
import { Plus, UserPlus } from "lucide-react"
import PageHeader from "../components/ui/PageHeader"
import Button from "../components/ui/Button"
import SearchInput from "../components/ui/SearchInput"
import FilterBar from "../components/ui/FilterBar"
import DataTable from "../components/ui/DataTable"
import Pagination from "../components/ui/Pagination"
import StatusBadge from "../components/ui/StatusBadge"
import EmptyState from "../components/ui/EmptyState"
import LeadFormModal from "../components/leads/LeadFormModal"
import LeadDetailsPanel from "../components/leads/LeadDetailsPanel"
import { useLeads } from "../hooks/useLeads"
import { useAgents } from "../hooks/useUsers"
import { fullName, formatCurrency, formatDate } from "../lib/format"
import {
  LEAD_STATUS,
  LEAD_STATUS_LABELS,
  LEAD_SOURCE,
  LEAD_SOURCE_LABELS,
  RESPONSE_STATUS,
  RESPONSE_STATUS_LABELS,
  INTEREST_TYPE_LABELS,
} from "../lib/enums"
import { LEAD_STATUS_TONE, RESPONSE_STATUS_TONE } from "../lib/statusTones"

const selectBase = "focus-ring h-10 rounded-lg border border-border bg-white px-3 text-sm text-text"

export default function LeadsPage() {
  const [params, setParams] = useSearchParams()
  const [search, setSearch] = useState("")
  const [filters, setFilters] = useState({ status: "", source: "", responseStatus: "", assignedUserId: "" })
  const [page, setPage] = useState(1)
  const [createOpen, setCreateOpen] = useState(Boolean(params.get("new")))

  const { data: agents } = useAgents()

  const query = useMemo(() => {
    const q = { page, limit: 20, sortBy: "receivedAt", sortOrder: "desc" }
    if (search) q.search = search
    if (filters.status) q.status = filters.status
    if (filters.source) q.source = filters.source
    if (filters.responseStatus) q.responseStatus = filters.responseStatus
    if (filters.assignedUserId) q.assignedUserId = filters.assignedUserId
    if (params.get("responseStatus") && !filters.responseStatus) q.responseStatus = params.get("responseStatus")
    return q
  }, [page, search, filters, params])

  const { data, isLoading, isError, error, refetch } = useLeads(query)
  const openLeadId = params.get("open")

  const setFilter = (key, value) => {
    setPage(1)
    setFilters((prev) => ({ ...prev, [key]: value }))
  }

  const openLead = (id) => setParams((prev) => {
    const next = new URLSearchParams(prev)
    next.set("open", id)
    return next
  })

  const closeLead = () => setParams((prev) => {
    const next = new URLSearchParams(prev)
    next.delete("open")
    return next
  })

  const columns = [
    {
      key: "contact",
      header: "שם לקוח",
      render: (lead) => <span className="font-medium text-text">{fullName(lead.contact)}</span>,
    },
    { key: "phone", header: "טלפון", render: (lead) => <span dir="ltr">{lead.contact?.phone}</span> },
    { key: "interest", header: "עניין", render: (lead) => INTEREST_TYPE_LABELS[lead.interestType] || "—" },
    { key: "city", header: "עיר", render: (lead) => lead.city || "—" },
    { key: "budget", header: "תקציב", render: (lead) => formatCurrency(lead.budget) },
    { key: "source", header: "מקור", render: (lead) => LEAD_SOURCE_LABELS[lead.source] },
    { key: "agent", header: "סוכן", render: (lead) => (lead.assignedUser ? fullName(lead.assignedUser) : "לא מוקצה") },
    {
      key: "status",
      header: "סטטוס",
      render: (lead) => <StatusBadge tone={LEAD_STATUS_TONE[lead.status]}>{LEAD_STATUS_LABELS[lead.status]}</StatusBadge>,
    },
    {
      key: "response",
      header: "מענה",
      render: (lead) => (
        <StatusBadge tone={RESPONSE_STATUS_TONE[lead.responseStatus]}>
          {RESPONSE_STATUS_LABELS[lead.responseStatus]}
        </StatusBadge>
      ),
    },
    { key: "receivedAt", header: "התקבל", render: (lead) => formatDate(lead.receivedAt) },
    {
      key: "actions",
      header: "",
      render: (lead) => (
        <Button size="sm" variant="ghost" onClick={() => openLead(lead.id)}>
          פתיחה
        </Button>
      ),
    },
  ]

  return (
    <div>
      <PageHeader
        title="לידים"
        description="כל הלידים שהתקבלו במשרד, עם מעקב זמן תגובה חי"
        actions={
          <Button icon={Plus} onClick={() => setCreateOpen(true)}>
            ליד חדש
          </Button>
        }
      />

      <FilterBar>
        <SearchInput value={search} onChange={(v) => { setPage(1); setSearch(v) }} placeholder="חיפוש לפי שם, טלפון או אימייל" className="w-64" />

        <select className={selectBase} value={filters.status} onChange={(e) => setFilter("status", e.target.value)}>
          <option value="">כל הסטטוסים</option>
          {LEAD_STATUS.map((s) => (
            <option key={s} value={s}>{LEAD_STATUS_LABELS[s]}</option>
          ))}
        </select>

        <select className={selectBase} value={filters.responseStatus} onChange={(e) => setFilter("responseStatus", e.target.value)}>
          <option value="">כל סטטוסי המענה</option>
          {RESPONSE_STATUS.map((s) => (
            <option key={s} value={s}>{RESPONSE_STATUS_LABELS[s]}</option>
          ))}
        </select>

        <select className={selectBase} value={filters.source} onChange={(e) => setFilter("source", e.target.value)}>
          <option value="">כל המקורות</option>
          {LEAD_SOURCE.map((s) => (
            <option key={s} value={s}>{LEAD_SOURCE_LABELS[s]}</option>
          ))}
        </select>

        <select className={selectBase} value={filters.assignedUserId} onChange={(e) => setFilter("assignedUserId", e.target.value)}>
          <option value="">כל הסוכנים</option>
          {agents?.data?.map((a) => (
            <option key={a.id} value={a.id}>{fullName(a)}</option>
          ))}
        </select>
      </FilterBar>

      <DataTable
        columns={columns}
        rows={data?.data}
        isLoading={isLoading}
        error={isError ? error : null}
        onRetry={refetch}
        onRowClick={(lead) => openLead(lead.id)}
        emptyState={
          <EmptyState
            icon={UserPlus}
            title="אין עדיין לידים להצגה"
            description="לידים חדשים יופיעו כאן מרגע שיתקבלו מהאתר, פייסבוק או ידנית"
            actionLabel="הוספת ליד"
            onAction={() => setCreateOpen(true)}
          />
        }
        footer={
          data?.pagination && <Pagination {...data.pagination} onPageChange={setPage} />
        }
      />

      <LeadFormModal open={createOpen} onClose={() => setCreateOpen(false)} onCreated={(lead) => { setCreateOpen(false); openLead(lead.id) }} />

      {openLeadId && <LeadDetailsPanel leadId={openLeadId} open={Boolean(openLeadId)} onClose={closeLead} />}
    </div>
  )
}
