import { useState } from "react"
import { Workflow, MessageCircle, Megaphone, Users2, ListChecks, Send } from "lucide-react"
import PageHeader from "../components/ui/PageHeader"
import Card from "../components/ui/Card"
import Button from "../components/ui/Button"
import { Input } from "../components/ui/FormField"
import StatusBadge from "../components/ui/StatusBadge"
import LoadingSkeleton, { CardsSkeleton } from "../components/ui/LoadingSkeleton"
import AutomationCard from "../components/automations/AutomationCard"
import { useIntegrationsStatus, useIntegrationLogs, useTestWhatsApp } from "../hooks/useIntegrations"
import { useAutomationStats } from "../hooks/useAutomationStats"
import { useAuth } from "../context/AuthContext"
import { formatDateTime } from "../lib/format"

function WhatsAppTestForm({ configured }) {
  const [phone, setPhone] = useState("")
  const [message, setMessage] = useState("בדיקת חיבור מ-ESTATEFLOW")
  const testWhatsApp = useTestWhatsApp()

  const submit = async (e) => {
    e.preventDefault()
    await testWhatsApp.mutateAsync({ phone, message })
  }

  return (
    <form onSubmit={submit} className="space-y-2 border-t border-border pt-3">
      <p className="text-xs font-medium text-muted">שליחת הודעת בדיקה {!configured && "(מצב דמה - ללא שליחה אמיתית)"}</p>
      <div className="flex gap-2">
        <Input placeholder="מספר טלפון" dir="ltr" className="text-left" value={phone} onChange={(e) => setPhone(e.target.value)} />
        <Button size="sm" type="submit" icon={Send} isLoading={testWhatsApp.isPending} disabled={!phone}>
          שליחה
        </Button>
      </div>
      <Input value={message} onChange={(e) => setMessage(e.target.value)} />
      {testWhatsApp.data && (
        <p className={`text-xs ${testWhatsApp.data.success ? "text-success" : "text-danger"}`}>
          {testWhatsApp.data.success
            ? `נשלח בהצלחה (${testWhatsApp.data.provider === "mock" ? "מצב דמה" : "Meta Cloud API"})`
            : `השליחה נכשלה: ${testWhatsApp.data.error}`}
        </p>
      )}
      {testWhatsApp.isError && <p className="text-xs text-danger">{testWhatsApp.error.message}</p>}
    </form>
  )
}

export default function AutomationsPage() {
  const { user } = useAuth()
  const canTest = user?.role === "ADMIN" || user?.role === "MANAGER"
  const { data: status, isLoading: statusLoading } = useIntegrationsStatus()
  const { data: logs, isLoading: logsLoading } = useIntegrationLogs({ limit: 10 })
  const { data: stats, isLoading: statsLoading } = useAutomationStats()

  return (
    <div>
      <PageHeader title="אוטומציות" description="מצב אמיתי של האינטגרציות - לא מוצגת הצלחה שלא אומתה בפועל" />

      <h3 className="mb-3 text-sm font-semibold text-text">אוטומציות מובנות (פעילות תמיד)</h3>
      {statsLoading ? (
        <CardsSkeleton count={2} />
      ) : (
        <div className="mb-6 grid grid-cols-1 gap-4 sm:grid-cols-2">
          <Card>
            <div className="flex items-center gap-3">
              <span className="flex size-10 items-center justify-center rounded-xl bg-info-bg text-brand">
                <Users2 className="size-5" />
              </span>
              <div>
                <h4 className="text-sm font-semibold text-text">הקצאת סוכן אוטומטית (Round-Robin)</h4>
                <p className="text-xs text-muted">מופעלת על כל ליד חדש</p>
              </div>
            </div>
            <p className="mt-3 text-xs text-muted">
              מתוך {stats.leadsReceived} לידים ב-7 הימים האחרונים:{" "}
              <span className="font-medium text-success">{stats.leadsAssigned} הוקצו</span>
              {stats.leadsUnassigned > 0 && (
                <>
                  {" "}· <span className="font-medium text-warning">{stats.leadsUnassigned} ללא סוכן פעיל</span>
                </>
              )}
            </p>
          </Card>
          <Card>
            <div className="flex items-center gap-3">
              <span className="flex size-10 items-center justify-center rounded-xl bg-info-bg text-brand">
                <ListChecks className="size-5" />
              </span>
              <div>
                <h4 className="text-sm font-semibold text-text">יצירת משימת פולו-אפ</h4>
                <p className="text-xs text-muted">נוצרת אוטומטית עבור כל ליד עם סוכן מוקצה</p>
              </div>
            </div>
            <p className="mt-3 text-xs text-muted">
              <span className="font-medium text-text">{stats.followUpTasksCreated}</span> משימות פולו-אפ נוצרו ב-7 הימים האחרונים
            </p>
          </Card>
        </div>
      )}

      <h3 className="mb-3 text-sm font-semibold text-text">אינטגרציות חיצוניות</h3>
      {statusLoading ? (
        <CardsSkeleton count={3} />
      ) : (
        <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
          <AutomationCard
            icon={Workflow}
            title="n8n"
            description="שליחת אירועי ליד לאוטומציות חיצוניות"
            configured={status.n8n.configured}
            lastEvent={status.n8n.lastEvent}
            lastResult={status.n8n.lastResult}
            lastExecutedAt={status.n8n.lastExecutedAt}
            lastError={status.n8n.lastError}
          />
          <AutomationCard
            icon={MessageCircle}
            title="WhatsApp Cloud API"
            description="הודעות אוטומטיות ללקוחות"
            configured={status.whatsapp.configured}
            configuredLabel={status.whatsapp.mode === "MOCK" ? "מצב דמה (Mock)" : "טרם חובר"}
            lastEvent={status.whatsapp.lastEvent}
            lastResult={status.whatsapp.lastResult}
            lastExecutedAt={status.whatsapp.lastExecutedAt}
            lastError={status.whatsapp.lastError}
          >
            {canTest && <WhatsAppTestForm configured={status.whatsapp.configured} />}
          </AutomationCard>
          <AutomationCard
            icon={Megaphone}
            title="Facebook Lead Ads"
            description="קליטת לידים מקמפיינים בפייסבוק"
            configured={status.facebook.configured}
            configuredLabel={status.facebook.pageConnected ? "עמוד מחובר (דמה)" : "טרם חובר"}
            lastEvent={status.facebook.lastEvent}
            lastResult={status.facebook.lastResult}
            lastExecutedAt={status.facebook.lastExecutedAt}
            lastError={status.facebook.lastError}
          />
        </div>
      )}

      <h3 className="mb-3 mt-6 text-sm font-semibold text-text">יומן הרצות אחרון</h3>
      {logsLoading ? (
        <LoadingSkeleton className="h-40" />
      ) : !logs?.data?.length ? (
        <p className="text-sm text-muted">אין עדיין הרצות מתועדות</p>
      ) : (
        <div className="overflow-hidden rounded-2xl border border-border bg-white">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border bg-slate-50/70 text-right text-xs font-semibold text-muted">
                <th className="px-4 py-2">אינטגרציה</th>
                <th className="px-4 py-2">אירוע</th>
                <th className="px-4 py-2">תוצאה</th>
                <th className="px-4 py-2">זמן</th>
              </tr>
            </thead>
            <tbody>
              {logs.data.map((log) => (
                <tr key={log.id} className="border-b border-border last:border-0">
                  <td className="px-4 py-2">{log.integration}</td>
                  <td className="px-4 py-2 text-muted">{log.event}</td>
                  <td className="px-4 py-2">
                    <StatusBadge tone={log.success ? "success" : "danger"}>{log.success ? "הצלחה" : "נכשל"}</StatusBadge>
                  </td>
                  <td className="px-4 py-2 text-muted">{formatDateTime(log.createdAt)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}
