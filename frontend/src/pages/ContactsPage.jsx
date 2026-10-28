import { useMemo, useState } from "react"
import { useSearchParams } from "react-router-dom"
import { Plus, BookUser, Trash2 } from "lucide-react"
import PageHeader from "../components/ui/PageHeader"
import Button from "../components/ui/Button"
import SearchInput from "../components/ui/SearchInput"
import FilterBar from "../components/ui/FilterBar"
import DataTable from "../components/ui/DataTable"
import Pagination from "../components/ui/Pagination"
import EmptyState from "../components/ui/EmptyState"
import ConfirmDialog from "../components/ui/ConfirmDialog"
import ContactFormModal from "../components/contacts/ContactFormModal"
import ContactDetailsPanel from "../components/contacts/ContactDetailsPanel"
import { useContacts, useDeleteContact } from "../hooks/useContacts"
import { useAuth } from "../context/AuthContext"
import { fullName, formatDate } from "../lib/format"

export default function ContactsPage() {
  const [params, setParams] = useSearchParams()
  const { user } = useAuth()
  const canDelete = user?.role === "ADMIN" || user?.role === "MANAGER"

  const [search, setSearch] = useState("")
  const [page, setPage] = useState(1)
  const [createOpen, setCreateOpen] = useState(false)
  const [deleteTarget, setDeleteTarget] = useState(null)

  const query = useMemo(() => {
    const q = { page, limit: 20 }
    if (search) q.search = search
    return q
  }, [page, search])

  const { data, isLoading, isError, error, refetch } = useContacts(query)
  const deleteContact = useDeleteContact()
  const openContactId = params.get("open")

  const openContact = (id) => setParams((prev) => {
    const next = new URLSearchParams(prev)
    next.set("open", id)
    return next
  })
  const closeContact = () => setParams((prev) => {
    const next = new URLSearchParams(prev)
    next.delete("open")
    return next
  })

  const columns = [
    { key: "name", header: "שם", render: (c) => <span className="font-medium text-text">{fullName(c)}</span> },
    { key: "phone", header: "טלפון", render: (c) => <span dir="ltr">{c.phone}</span> },
    { key: "email", header: "אימייל", render: (c) => c.email || "—" },
    { key: "createdAt", header: "נוצר בתאריך", render: (c) => formatDate(c.createdAt) },
    {
      key: "actions",
      header: "",
      render: (c) => (
        <div className="flex items-center justify-end gap-1">
          <Button size="sm" variant="ghost" onClick={() => openContact(c.id)}>
            פתיחה
          </Button>
          {canDelete && (
            <Button
              size="sm"
              variant="ghost"
              className="text-danger hover:bg-danger-bg"
              onClick={(e) => {
                e.stopPropagation()
                setDeleteTarget(c)
              }}
            >
              <Trash2 className="size-4" />
            </Button>
          )}
        </div>
      ),
    },
  ]

  return (
    <div>
      <PageHeader
        title="אנשי קשר"
        description="כל הלקוחות במערכת, ללא כפילויות - גם אם יש להם כמה לידים"
        actions={
          <Button icon={Plus} onClick={() => setCreateOpen(true)}>
            איש קשר חדש
          </Button>
        }
      />

      <FilterBar>
        <SearchInput value={search} onChange={(v) => { setPage(1); setSearch(v) }} placeholder="חיפוש לפי שם, טלפון או אימייל" className="w-72" />
      </FilterBar>

      <DataTable
        columns={columns}
        rows={data?.data}
        isLoading={isLoading}
        error={isError ? error : null}
        onRetry={refetch}
        onRowClick={(c) => openContact(c.id)}
        emptyState={
          <EmptyState
            icon={BookUser}
            title="אין עדיין אנשי קשר"
            description="אנשי קשר נוצרים אוטומטית מלידים, או ידנית כאן"
            actionLabel="הוספת איש קשר"
            onAction={() => setCreateOpen(true)}
          />
        }
        footer={data?.pagination && <Pagination {...data.pagination} onPageChange={setPage} />}
      />

      <ContactFormModal open={createOpen} onClose={() => setCreateOpen(false)} onSaved={(c) => { setCreateOpen(false); openContact(c.id) }} />

      {openContactId && <ContactDetailsPanel contactId={openContactId} open={Boolean(openContactId)} onClose={closeContact} />}

      <ConfirmDialog
        open={Boolean(deleteTarget)}
        onClose={() => setDeleteTarget(null)}
        title="מחיקת איש קשר"
        description={`פעולה זו תמחק את ${deleteTarget ? fullName(deleteTarget) : ""} וכל הלידים והעסקאות המשויכים אליו. לא ניתן לשחזר.`}
        confirmLabel="מחיקה"
        isLoading={deleteContact.isPending}
        onConfirm={async () => {
          await deleteContact.mutateAsync(deleteTarget.id)
          setDeleteTarget(null)
        }}
      />
    </div>
  )
}
