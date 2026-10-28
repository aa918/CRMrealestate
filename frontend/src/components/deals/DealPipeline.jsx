import { useEffect, useState } from "react"
import clsx from "clsx"
import DealCard from "./DealCard"
import { DEAL_STAGE, DEAL_STAGE_LABELS } from "../../lib/enums"
import { formatCurrency } from "../../lib/format"
import { useUpdateDeal } from "../../hooks/useDeals"

const COLUMN_ACCENT = {
  OPEN: "border-t-brand",
  MEETING: "border-t-warning",
  OFFER: "border-t-warning",
  NEGOTIATION: "border-t-warning",
  WON: "border-t-success",
  LOST: "border-t-slate-300",
}

export default function DealPipeline({ deals, onCardClick }) {
  const [board, setBoard] = useState(() => groupByStage(deals))
  const [dragError, setDragError] = useState(null)
  const updateDeal = useUpdateDeal()

  useEffect(() => {
    setBoard(groupByStage(deals))
  }, [deals])

  const handleDrop = async (stage, dealId) => {
    const sourceStage = Object.keys(board).find((s) => board[s].some((d) => d.id === dealId))
    if (!sourceStage || sourceStage === stage) return

    const deal = board[sourceStage].find((d) => d.id === dealId)
    const previousBoard = board

    // Optimistic move so the drag feels instant.
    setBoard((prev) => ({
      ...prev,
      [sourceStage]: prev[sourceStage].filter((d) => d.id !== dealId),
      [stage]: [{ ...deal, stage }, ...prev[stage]],
    }))

    try {
      await updateDeal.mutateAsync({ id: dealId, payload: { stage } })
    } catch (err) {
      setBoard(previousBoard)
      setDragError(err.message || "עדכון השלב נכשל")
      setTimeout(() => setDragError(null), 4000)
    }
  }

  return (
    <div>
      {dragError && <div className="mb-3 rounded-lg bg-danger-bg px-3 py-2 text-sm text-danger">{dragError}</div>}
      <div className="flex gap-3 overflow-x-auto pb-2">
        {DEAL_STAGE.map((stage) => {
          const items = board[stage] || []
          const total = items.reduce((sum, d) => sum + Number(d.value || 0), 0)
          return (
            <div
              key={stage}
              onDragOver={(e) => e.preventDefault()}
              onDrop={(e) => {
                e.preventDefault()
                const dealId = e.dataTransfer.getData("text/deal-id")
                if (dealId) handleDrop(stage, dealId)
              }}
              className={clsx("flex w-72 shrink-0 flex-col rounded-2xl border-t-4 bg-slate-50/60 p-3", COLUMN_ACCENT[stage])}
            >
              <div className="mb-3 flex items-center justify-between px-1">
                <h3 className="text-sm font-semibold text-text">{DEAL_STAGE_LABELS[stage]}</h3>
                <span className="text-xs text-muted">{items.length}</span>
              </div>
              <p className="mb-3 px-1 text-xs font-medium text-muted">{formatCurrency(total)}</p>
              <div className="flex-1 space-y-2">
                {items.map((deal) => (
                  <div
                    key={deal.id}
                    draggable
                    onDragStart={(e) => e.dataTransfer.setData("text/deal-id", deal.id)}
                  >
                    <DealCard deal={deal} onClick={() => onCardClick(deal)} compact />
                  </div>
                ))}
                {items.length === 0 && (
                  <p className="rounded-lg border border-dashed border-border p-4 text-center text-xs text-muted">
                    גררו עסקה לכאן
                  </p>
                )}
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}

function groupByStage(deals) {
  const map = Object.fromEntries(DEAL_STAGE.map((s) => [s, []]))
  for (const deal of deals || []) {
    if (map[deal.stage]) map[deal.stage].push(deal)
  }
  return map
}
