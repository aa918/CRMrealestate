import { useState } from "react"
import { Check, Search } from "lucide-react"
import clsx from "clsx"
import { useContacts } from "../../hooks/useContacts"
import { fullName } from "../../lib/format"

/** Minimal search-and-pick control for selecting an existing Contact. */
export default function ContactPickerField({ value, onChange, selectedContact }) {
  const [term, setTerm] = useState("")
  const { data, isLoading } = useContacts({ search: term, limit: 6 })

  return (
    <div>
      {selectedContact && !term && (
        <div className="mb-2 flex items-center justify-between rounded-lg bg-info-bg px-3 py-2 text-sm text-brand">
          <span>{fullName(selectedContact)} · <span dir="ltr">{selectedContact.phone}</span></span>
          <button type="button" onClick={() => onChange(null)} className="text-xs underline">
            החלפה
          </button>
        </div>
      )}
      {(!selectedContact || term) && (
        <div className="relative">
          <Search className="absolute right-3 top-1/2 size-4 -translate-y-1/2 text-muted" />
          <input
            value={term}
            onChange={(e) => setTerm(e.target.value)}
            placeholder="חיפוש איש קשר לפי שם או טלפון..."
            className="focus-ring h-10 w-full rounded-lg border border-border bg-white pr-9 text-sm"
          />
          {term && (
            <div className="absolute z-10 mt-1 w-full rounded-lg border border-border bg-white shadow-md">
              {isLoading ? (
                <p className="p-3 text-xs text-muted">מחפש...</p>
              ) : data?.data?.length ? (
                data.data.map((c) => (
                  <button
                    key={c.id}
                    type="button"
                    onClick={() => {
                      onChange(c)
                      setTerm("")
                    }}
                    className={clsx(
                      "flex w-full items-center justify-between px-3 py-2 text-right text-sm hover:bg-slate-50",
                      value === c.id && "bg-info-bg"
                    )}
                  >
                    <span>
                      {fullName(c)} · <span dir="ltr">{c.phone}</span>
                    </span>
                    {value === c.id && <Check className="size-4 text-brand" />}
                  </button>
                ))
              ) : (
                <p className="p-3 text-xs text-muted">לא נמצאו אנשי קשר</p>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  )
}
