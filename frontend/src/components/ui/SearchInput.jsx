import { Search, X } from "lucide-react"

export default function SearchInput({ value, onChange, placeholder = "חיפוש...", className }) {
  return (
    <div className={`relative ${className || ""}`}>
      <Search className="absolute right-3 top-1/2 size-4 -translate-y-1/2 text-muted" />
      <input
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="focus-ring h-10 w-full rounded-lg border border-border bg-white pr-9 pl-9 text-sm text-text placeholder:text-muted"
      />
      {value && (
        <button
          onClick={() => onChange("")}
          className="absolute left-3 top-1/2 -translate-y-1/2 text-muted hover:text-text"
          aria-label="נקה חיפוש"
        >
          <X className="size-4" />
        </button>
      )}
    </div>
  )
}
