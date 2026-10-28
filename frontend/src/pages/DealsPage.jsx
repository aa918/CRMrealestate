import { useMemo, useState } from "react"
import { useSearchParams } from "react-router-dom"
import { Plus, Handshake, Columns3, List } from "lucide-react"
import clsx from "clsx"
import PageHeader from "../components/ui/PageHeader"
import Button from "../components/ui/Button"
import DataTable from "../components/ui/DataTable"
import Pagination from "../components/ui/Pagination"
import EmptyState from "../components/ui/EmptyState"
import ErrorState from "../components/ui/ErrorState"
import StatusBadge from "../components/ui/StatusBadge"
import { CardsSkeleton } from "../components/ui/LoadingSkeleton"
import DealPipeline from "../components/deals/DealPipeline"
import DealFormModal from "../components/deals/DealFormModal"
import DealDetailsPanel from "../components/deals/DealDetailsPanel"
import { useDeals } from "../hooks/useDeals"
import { fullName, formatCurrency, formatDate } from "../lib/format"
import { DEAL_STAGE_LABELS } from "../lib/enums"
import { DEAL_STAGE_TONE } from "../lib/statusTones"

export default function DealsPage() {
  const [params, setParams] = useSearchParams()
  const [view, setView] = useState("kanban")
  const [page, setPage] = useState(1)
  const [createOpen, setCreateOpen] = useState(false)

  const query = useMemo(() => (view === "kanban" ? { limit: 100 } : { page, limit: 20 }), [view, page])
  const { data, isLoading, isError, error, refetch } = useDeals(query)
  const openDealId = params.get("open")

  const openDeal = (id) => setParams((prev) => {
    const next = new URLSearchParams(prev)
    next.set("open", id)
    return next
  })
  const closeDeal = () => setParams((prev) => {
    const next = new URLSearchParams(prev)
    next.delete("open")
    return next
  })

  const columns = [
    { key: "title", header: "עסקה", render: (d) => <span className="font-medium text-text">{d.title}</span> },
    { key: "contact", header: "איש קשר", render: (d) => fullName(d.contact) },
    { key: "value", header: "שווי", render: (d) => formatCurrency(d.value) },
    {
      key: "stage",
      header: "שלב",
      render: (d) => <StatusBadge tone={DEAL_STAGE_TONE[d.stage]}>{DEAL_STAGE_LABELS[d.stage]}</StatusBadge>,
    },
    { key: "owner", header: "בעלים", render: (d) => (d.owner ? fullName(d.owner) : "—") },
    { key: "expected", header: "סגירה משוערת", render: (d) => (d.expectedCloseDate ? formatDate(d.expectedCloseDate) : "—") },
    {
      key: "actions",
      header: "",
      render: (d) => (
        <Button size="sm" variant="ghost" onClick={() => openDeal(d.id)}>
          פתיחה
        </Button>
      ),
    },
  ]

  return (
    <div>
      <PageHeader
        title="עסקאות"
        description="צינור המכירות של המשרד - משיחה ראשונה ועד סגירה"
        actions={
          <>
            <div className="flex items-center rounded-lg border border-border bg-white p-0.5">
              <button onClick={() => setView("kanban")} className={clsx("rounded-md p-1.5", view === "kanban" ? "bg-info-bg text-brand" : "text-muted")}>
                <Columns3 className="size-4" />
              </button>
              <button onClick={() => setView("table")} className={clsx("rounded-md p-1.5", view === "table" ? "bg-info-bg text-brand" : "text-muted")}>
                <List className="size-4" />
              </button>
            </div>
            <Button icon={Plus} onClick={() => setCreateOpen(true)}>
              עסקה חדשה
            </Button>
          </>
        }
      />

      {isLoading ? (
        <CardsSkeleton count={4} />
      ) : isError ? (
        <ErrorState description={error.message} onRetry={refetch} />
      ) : !data?.data?.length ? (
        <EmptyState icon={Handshake} title="אין עדיין עסקאות" description="עסקה נוצרת כשליד מתקדם לכיוון סגירה" actionLabel="יצירת עסקה" onAction={() => setCreateOpen(true)} />
      ) : view === "kanban" ? (
        <DealPipeline deals={data.data} onCardClick={(deal) => openDeal(deal.id)} />
      ) : (
        <DataTable columns={columns} rows={data.data} onRowClick={(d) => openDeal(d.id)} footer={<Pagination {...data.pagination} onPageChange={setPage} />} />
      )}

      <DealFormModal open={createOpen} onClose={() => setCreateOpen(false)} onSaved={(deal) => { setCreateOpen(false); openDeal(deal.id) }} />

      {openDealId && <DealDetailsPanel dealId={openDealId} open={Boolean(openDealId)} onClose={closeDeal} />}
    </div>
  )
}
