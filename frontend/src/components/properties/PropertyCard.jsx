import { Building2, BedDouble, Bath, Ruler, MapPin } from "lucide-react"
import StatusBadge from "../ui/StatusBadge"
import { formatCurrency } from "../../lib/format"
import { PROPERTY_KIND_LABELS, TRANSACTION_TYPE_LABELS, PROPERTY_STATUS_LABELS } from "../../lib/enums"
import { PROPERTY_STATUS_TONE } from "../../lib/statusTones"

export default function PropertyCard({ property, onClick }) {
  return (
    <div
      onClick={onClick}
      className="cursor-pointer overflow-hidden rounded-2xl border border-border bg-white transition-shadow hover:shadow-md"
    >
      {/* No image field exists on the backend Property model yet - a
          neutral placeholder is shown rather than any invented photo. */}
      <div className="flex h-32 items-center justify-center bg-gradient-to-br from-slate-100 to-slate-50 text-slate-300">
        <Building2 className="size-10" />
      </div>
      <div className="p-4">
        <div className="flex items-center justify-between gap-2">
          <p className="truncate text-sm font-semibold text-text">{property.title}</p>
          <StatusBadge tone={PROPERTY_STATUS_TONE[property.status]}>{PROPERTY_STATUS_LABELS[property.status]}</StatusBadge>
        </div>
        <p className="mt-1 flex items-center gap-1 text-xs text-muted">
          <MapPin className="size-3" />
          {property.city}
          {property.address ? `, ${property.address}` : ""}
        </p>
        <p className="mt-2 text-lg font-bold text-brand">{formatCurrency(property.price)}</p>
        <p className="text-xs text-muted">
          {PROPERTY_KIND_LABELS[property.propertyType]} · {TRANSACTION_TYPE_LABELS[property.transactionType]}
        </p>
        <div className="mt-3 flex items-center gap-3 border-t border-border pt-3 text-xs text-muted">
          <span className="flex items-center gap-1">
            <BedDouble className="size-3.5" /> {property.bedrooms ?? "—"}
          </span>
          <span className="flex items-center gap-1">
            <Bath className="size-3.5" /> {property.bathrooms ?? "—"}
          </span>
          <span className="flex items-center gap-1">
            <Ruler className="size-3.5" /> {property.sizeSqm ? `${property.sizeSqm} מ"ר` : "—"}
          </span>
        </div>
      </div>
    </div>
  )
}
