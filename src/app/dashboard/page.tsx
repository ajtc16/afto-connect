import Link from "next/link";
import { Eye, Users, UserPlus, Sparkles, QrCode, ExternalLink } from "lucide-react";
import { getOwnerContext, getDashboardMetrics } from "@/lib/data/dashboard";
import { planFeatures } from "@/lib/plans";
import { MetricTile } from "@/components/dashboard/MetricTile";
import { Card } from "@/components/ui/Card";

export default async function DashboardOverview() {
  const ctx = await getOwnerContext();
  if (!ctx) return null; // layout already guards/redirects
  const metrics = await getDashboardMetrics(ctx.organization.id);
  const features = planFeatures(ctx.organization.plan);
  const slug = ctx.profiles[0]?.slug;

  return (
    <div className="mx-auto max-w-4xl space-y-6">
      <div>
        <h1 className="font-display text-2xl font-semibold">Resumen</h1>
        <p className="text-sm text-muted">
          El impacto de tu tarjeta en tiempo real.
        </p>
      </div>

      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        <MetricTile label="Vistas" value={metrics.views} icon={Eye} />
        {features.leadCapture && (
          <MetricTile label="Leads" value={metrics.leads} icon={Users} />
        )}
        <MetricTile
          label="Contactos guardados"
          value={metrics.contactSaves}
          icon={UserPlus}
        />
        {features.ai && (
          <MetricTile label="AI Chats" value={metrics.aiChats} icon={Sparkles} />
        )}
      </div>

      {slug && (
        <Card className="p-5">
          <h2 className="mb-3 font-medium">Comparte tu perfil</h2>
          <div className="flex flex-col items-start gap-5 sm:flex-row sm:items-center">
            {/* QR served by the API; encodes the permanent /c/[slug] URL. */}
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={`/api/qr/${slug}`}
              alt="QR del perfil"
              width={128}
              height={128}
              className="rounded-lg bg-white p-2"
            />
            <div className="space-y-2 text-sm">
              <p className="text-muted">
                Tu enlace permanente para QR y NFC:
              </p>
              <code className="block rounded-btn border border-border bg-surface-2 px-3 py-2 text-primary">
                /c/{slug}
              </code>
              <div className="flex gap-3 pt-1">
                <Link
                  href={`/c/${slug}`}
                  target="_blank"
                  className="afto-focus inline-flex items-center gap-1.5 text-muted hover:text-foreground"
                >
                  <ExternalLink className="h-4 w-4" /> Abrir
                </Link>
                <a
                  href={`/api/qr/${slug}?format=png`}
                  download={`afto-${slug}-qr.png`}
                  className="afto-focus inline-flex items-center gap-1.5 text-muted hover:text-foreground"
                >
                  <QrCode className="h-4 w-4" /> Descargar QR
                </a>
              </div>
            </div>
          </div>
        </Card>
      )}
    </div>
  );
}
