import { Mail, Phone, Building2, Inbox } from "lucide-react";
import { getOwnerContext, getLeads } from "@/lib/data/dashboard";
import { planFeatures } from "@/lib/plans";
import { Card } from "@/components/ui/Card";

function timeAgo(iso: string): string {
  return new Date(iso).toLocaleDateString("es-EC", {
    day: "2-digit",
    month: "short",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export default async function LeadsPage() {
  const ctx = await getOwnerContext();
  if (!ctx) return null;

  if (!planFeatures(ctx.organization.plan).leadCapture) {
    return (
      <Card className="mx-auto max-w-lg p-8 text-center text-muted">
        La captura de leads está disponible en el plan Pro y superiores.
      </Card>
    );
  }

  const leads = await getLeads(ctx.organization.id);

  return (
    <div className="mx-auto max-w-4xl space-y-6">
      <div>
        <h1 className="font-display text-2xl font-semibold">Leads</h1>
        <p className="text-sm text-muted">
          {leads.length} {leads.length === 1 ? "contacto capturado" : "contactos capturados"}.
        </p>
      </div>

      {leads.length === 0 ? (
        <Card className="flex flex-col items-center gap-3 p-12 text-center">
          <Inbox className="h-10 w-10 text-muted-2" />
          <p className="font-medium">Aún no hay leads</p>
          <p className="max-w-xs text-sm text-muted">
            Cuando alguien deje su contacto en tu perfil, aparecerá aquí.
          </p>
        </Card>
      ) : (
        <div className="space-y-3">
          {leads.map((lead) => (
            <Card key={lead.id} className="p-4">
              <div className="flex flex-wrap items-start justify-between gap-2">
                <div>
                  <p className="font-medium">{lead.full_name}</p>
                  {lead.company && (
                    <p className="flex items-center gap-1.5 text-sm text-muted">
                      <Building2 className="h-3.5 w-3.5" />
                      {lead.company}
                    </p>
                  )}
                </div>
                <div className="flex items-center gap-2 text-xs text-muted-2">
                  {lead.source && (
                    <span className="rounded-full border border-border px-2 py-0.5 text-primary">
                      {lead.source}
                    </span>
                  )}
                  <span>{timeAgo(lead.created_at)}</span>
                </div>
              </div>

              {lead.message && (
                <p className="mt-2 text-sm text-muted">{lead.message}</p>
              )}

              <div className="mt-3 flex flex-wrap gap-4 text-sm">
                {lead.email && (
                  <a
                    href={`mailto:${lead.email}`}
                    className="afto-focus inline-flex items-center gap-1.5 text-muted hover:text-foreground"
                  >
                    <Mail className="h-3.5 w-3.5" /> {lead.email}
                  </a>
                )}
                {lead.phone && (
                  <a
                    href={`tel:${lead.phone}`}
                    className="afto-focus inline-flex items-center gap-1.5 text-muted hover:text-foreground"
                  >
                    <Phone className="h-3.5 w-3.5" /> {lead.phone}
                  </a>
                )}
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
