import { getOwnerContext, getDashboardMetrics } from "@/lib/data/dashboard";
import { planFeatures } from "@/lib/plans";
import { Card } from "@/components/ui/Card";
import type { EventType } from "@/types/db";

const EVENT_LABELS: Record<EventType, string> = {
  profile_view: "Vistas de perfil",
  contact_save: "Contactos guardados",
  whatsapp_click: "Clics WhatsApp",
  linkedin_click: "Clics LinkedIn",
  email_click: "Clics Email",
  website_click: "Clics Sitio web",
  lead_submit: "Leads enviados",
  ai_chat_start: "Conversaciones IA",
};

const ORDER: EventType[] = [
  "profile_view",
  "contact_save",
  "whatsapp_click",
  "linkedin_click",
  "email_click",
  "website_click",
  "lead_submit",
  "ai_chat_start",
];

export default async function AnalyticsPage() {
  const ctx = await getOwnerContext();
  if (!ctx) return null;

  if (!planFeatures(ctx.organization.plan).analytics) {
    return (
      <Card className="mx-auto max-w-lg p-8 text-center text-muted">
        La analítica está disponible en el plan Pro y superiores.
      </Card>
    );
  }

  const metrics = await getDashboardMetrics(ctx.organization.id);
  const max = Math.max(1, ...ORDER.map((t) => metrics.byType[t]));

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <div>
        <h1 className="font-display text-2xl font-semibold">Analítica</h1>
        <p className="text-sm text-muted">Interacciones registradas por tipo.</p>
      </div>

      <Card className="divide-y divide-border p-2">
        {ORDER.map((type) => {
          const value = metrics.byType[type];
          return (
            <div key={type} className="flex items-center gap-4 px-3 py-3">
              <span className="w-40 shrink-0 text-sm text-muted">
                {EVENT_LABELS[type]}
              </span>
              <div className="h-2 flex-1 overflow-hidden rounded-full bg-surface-2">
                <div
                  className="h-full rounded-full bg-primary"
                  style={{ width: `${(value / max) * 100}%` }}
                />
              </div>
              <span className="w-10 shrink-0 text-right text-sm font-medium tabular-nums">
                {value}
              </span>
            </div>
          );
        })}
      </Card>
    </div>
  );
}
