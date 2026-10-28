import { useMemo, useState } from "react"
import { Plus, Building2, LayoutGrid, List, Pencil, Trash2 } from "lucide-react"
import PageHeader from "../components/ui/PageHeader"
import Button from "../components/ui/Button"
import SearchInput from "../components/ui/SearchInput"
import FilterBar from "../components/ui/FilterBar"
import DataTable from "../components/ui/DataTable"
import Pagination from "../components/ui/Pagination"
import EmptyState from "../components/ui/EmptyState"
import ErrorState from "../components/ui/ErrorState"
import ConfirmDialog from "../components/ui/ConfirmDialog"
import StatusBadge from "../components/ui/StatusBadge"
import { CardsSkeleton } from "../components/ui/LoadingSkeleton"
import PropertyCard from "../components/properties/PropertyCard"
import PropertyFormModal from "../components/properties/PropertyFormModal"
import { useProperties, useDeleteProperty } from "../hooks/useProperties"
import { useAuth } from "../context/AuthContext"
import { formatCurrency } from "../lib/format"
import {
  PROPERTY_KIND,
  PROPERTY_KIND_LABELS,
  TRANSACTION_TYPE,
  TRANSACTION_TYPE_LABELS,
  PROPERTY_STATUS,
  PROPERTY_STATUS_LABELS,
} from "../lib/enums"
import { PROPERTY_STATUS_TONE } from "../lib/statusTones"
import clsx from "clsx"

const selectBase = "focus-ring h-10 rounded-lg border border-border bg-white px-3 text-sm text-text"

export default function PropertiesPage() {
  const { user } = useAuth()
  const canDelete = user?.role === "ADMIN" || user?.role === "MANAGER"

  const [view, setView] = useState("grid")
  const [search, setSearch] = useState("")
  const [filters, setFilters] = useState({ city: "", transactionType: "", propertyType: "", status: "" })
  const [page, setPage] = useState(1)
  const [formState, setFormState] = useState({ open: false, property: null })
  const [deleteTarget, setDeleteTarget] = useState(null)

  const query = useMemo(() => {
    const q = { page, limit: view === "grid" ? 12 : 20 }
    if (search) q.city = search
    Object.entries(filters).forEach(([k, v]) => { if (v) q[k] = v })
    return q
  }, [page, search, filters, view])

  const { data, isLoading, isError, error, refetch } = useProperties(query)
  const deleteProperty = useDeleteProperty()

  const setFilter = (key, value) => {
    setPage(1)
    setFilters((prev) => ({ ...prev, [key]: value }))
  }

  const columns = [
    { key: "title", header: "כותרת", render: (p) => <span className="font-medium text-text">{p.title}</span> },
    { key: "city", header: "עיר", render: (p) => p.city },
    { key: "type", header: "סוג", render: (p) => `${PROPERTY_KIND_LABELS[p.propertyType]} · ${TRANSACTION_TYPE_LABELS[p.transactionType]}` },
    { key: "price", header: "מחיר", render: (p) => formatCurrency(p.price) },
    {
      key: "status",
      header: "סטטוס",
      render: (p) => <StatusBadge tone={PROPERTY_STATUS_TONE[p.status]}>{PROPERTY_STATUS_LABELS[p.status]}</StatusBadge>,
    },
    {
      key: "actions",
      header: "",
      render: (p) => (
        <div className="flex items-center justify-end gap-1">
          <Button size="sm" variant="ghost" icon={Pencil} onClick={() => setFormState({ open: true, property: p })} />
          {canDelete && (
            <Button size="sm" variant="ghost" className="text-danger hover:bg-danger-bg" icon={Trash2} onClick={() => setDeleteTarget(p)} />
          )}
        </div>
      ),
    },
  ]

  return (
    <div>
      <PageHeader
        title="נכסים"
        description="מצאי הנכסים הפעיל של המשרד"
        actions={
          <>
            <div className="flex items-center rounded-lg border border-border bg-white p-0.5">
              <button onClick={() => setView("grid")} className={clsx("rounded-md p-1.5", view === "grid" ? "bg-info-bg text-brand" : "text-muted")}>
                <LayoutGrid className="size-4" />
              </button>
              <button onClick={() => setView("table")} className={clsx("rounded-md p-1.5", view === "table" ? "bg-info-bg text-brand" : "text-muted")}>
                <List className="size-4" />
              </button>
            </div>
            <Button icon={Plus} onClick={() => setFormState({ open: true, property: null })}>
              נכס חדש
            </Button>
          </>
        }
      />

      <FilterBar>
        <SearchInput value={search} onChange={(v) => { setPage(1); setSearch(v) }} placeholder="חיפוש לפי עיר" className="w-60" />
        <select className={selectBase} value={filters.transactionType} onChange={(e) => setFilter("transactionType", e.target.value)}>
          <option value="">מכירה/השכרה</option>
          {TRANSACTION_TYPE.map((v) => <option key={v} value={v}>{TRANSACTION_TYPE_LABELS[v]}</option>)}
        </select>
        <select className={selectBase} value={filters.propertyType} onChange={(e) => setFilter("propertyType", e.target.value)}>
          <option value="">כל סוגי הנכס</option>
          {PROPERTY_KIND.map((v) => <option key={v} value={v}>{PROPERTY_KIND_LABELS[v]}</option>)}
        </select>
        <select className={selectBase} value={filters.status} onChange={(e) => setFilter("status", e.target.value)}>
          <option value="">כל הסטטוסים</option>
          {PROPERTY_STATUS.map((v) => <option key={v} value={v}>{PROPERTY_STATUS_LABELS[v]}</option>)}
        </select>
      </FilterBar>

      {isLoading ? (
        <CardsSkeleton count={8} />
      ) : isError ? (
        <ErrorState description={error.message} onRetry={refetch} />
      ) : !data?.data?.length ? (
        <EmptyState icon={Building2} title="אין עדיין נכסים" description="הוסף את הנכס הראשון כדי להתחיל" actionLabel="הוספת נכס" onAction={() => setFormState({ open: true, property: null })} />
      ) : view === "grid" ? (
        <>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {data.data.map((p) => (
              <PropertyCard key={p.id} property={p} onClick={() => setFormState({ open: true, property: p })} />
            ))}
          </div>
          <div className="mt-4 rounded-xl border border-border bg-white">
            <Pagination {...data.pagination} onPageChange={setPage} />
          </div>
        </>
      ) : (
        <DataTable columns={columns} rows={data.data} footer={<Pagination {...data.pagination} onPageChange={setPage} />} />
      )}

      <PropertyFormModal
        open={formState.open}
        property={formState.property}
        onClose={() => setFormState({ open: false, property: null })}
        onSaved={() => setFormState({ open: false, property: null })}
      />

      <ConfirmDialog
        open={Boolean(deleteTarget)}
        onClose={() => setDeleteTarget(null)}
        title="מחיקת נכס"
        description={`פעולה זו תמחק את "${deleteTarget?.title}" לצמיתות.`}
        confirmLabel="מחיקה"
        isLoading={deleteProperty.isPending}
        onConfirm={async () => {
          await deleteProperty.mutateAsync(deleteTarget.id)
          setDeleteTarget(null)
        }}
      />
    </div>
  )
}
