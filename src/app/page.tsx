import Link from "next/link";
import {
  ScanLine,
  Smartphone,
  UserPlus,
  Sparkles,
  ArrowRight,
  Check,
} from "lucide-react";
import { Logo } from "@/components/brand/Logo";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { InterestForm } from "@/components/marketing/InterestForm";

const STEPS = [
  {
    icon: ScanLine,
    title: "Escanea o toca",
    body: "Acerca el teléfono a tu tarjeta AFTO o escanea el QR. Sin apps.",
  },
  {
    icon: Smartphone,
    title: "Se abre tu perfil",
    body: "La persona ve tu tarjeta digital al instante, desde el navegador.",
  },
  {
    icon: UserPlus,
    title: "Guarda el contacto",
    body: "Con un toque guarda tus datos en su teléfono como contacto.",
  },
  {
    icon: Sparkles,
    title: "Interactúa y deja su contacto",
    body: "Pregunta a la IA o déjate sus datos para futuros proyectos.",
  },
];

const PLANS = [
  {
    name: "Personal",
    price: "$49",
    tagline: "Presencia digital elegante y fácil de compartir.",
    features: ["Perfil + QR + vCard", "WhatsApp, LinkedIn, email y web", "Diseño profesional"],
    highlight: false,
  },
  {
    name: "Pro",
    price: "$99",
    tagline: "Capta y mide oportunidades, no solo compartas datos.",
    features: ["Todo lo de Personal", "Captura de leads", "Analítica", "Branding + NFC"],
    highlight: true,
  },
  {
    name: "AI",
    price: "$149",
    tagline: "Convierte tu perfil en una experiencia asistida por IA.",
    features: ["Todo lo de Pro", "Ask AFTO AI", "Precalificación de intención"],
    highlight: false,
  },
  {
    name: "Business",
    price: "$399+",
    tagline: "Networking para equipos con administración central.",
    features: ["Múltiples perfiles", "Branding corporativo", "Panel unificado"],
    highlight: false,
  },
];

export default function HomePage() {
  return (
    <main className="afto-aurora min-h-dvh">
      {/* Nav */}
      <nav className="mx-auto flex max-w-5xl items-center justify-between px-4 py-5">
        <Logo />
        <div className="flex items-center gap-2">
          <Link href="/c/antonio">
            <Button variant="ghost" size="sm">Ver demo</Button>
          </Link>
          <Link href="/login">
            <Button variant="secondary" size="sm">Iniciar sesión</Button>
          </Link>
        </div>
      </nav>

      {/* Hero */}
      <section className="mx-auto max-w-3xl px-4 pb-16 pt-12 text-center sm:pt-20">
        <span className="inline-block rounded-full border border-border bg-surface/60 px-3 py-1 text-xs uppercase tracking-widest text-muted">
          AFTO Connect
        </span>
        <h1 className="mx-auto mt-5 max-w-2xl font-display text-4xl font-semibold tracking-tight sm:text-5xl">
          Tu tarjeta inteligente para networking
        </h1>
        <p className="mx-auto mt-4 max-w-xl text-lg text-muted">
          No solo compartes tu contacto. Conviertes cada encuentro en una
          oportunidad — con QR, NFC, captura de leads e IA.
        </p>
        <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
          <Link href="#interest">
            <Button size="lg">
              Quiero una tarjeta como esta <ArrowRight className="h-4 w-4" />
            </Button>
          </Link>
          <Link href="/c/antonio">
            <Button variant="secondary" size="lg">Ver perfil demo</Button>
          </Link>
        </div>
      </section>

      {/* How it works */}
      <section className="mx-auto max-w-5xl px-4 py-12">
        <h2 className="mb-8 text-center font-display text-2xl font-semibold">
          Cómo funciona
        </h2>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {STEPS.map((s, i) => {
            const Icon = s.icon;
            return (
              <Card key={s.title} className="p-5">
                <div className="mb-3 flex items-center justify-between">
                  <span className="flex h-9 w-9 items-center justify-center rounded-full bg-primary-soft text-primary">
                    <Icon className="h-5 w-5" />
                  </span>
                  <span className="font-display text-sm text-muted-2">0{i + 1}</span>
                </div>
                <h3 className="font-medium">{s.title}</h3>
                <p className="mt-1 text-sm text-muted">{s.body}</p>
              </Card>
            );
          })}
        </div>
      </section>

      {/* Pricing */}
      <section className="mx-auto max-w-5xl px-4 py-12">
        <div className="mb-8 text-center">
          <h2 className="font-display text-2xl font-semibold">Planes</h2>
          <p className="mt-1 text-sm text-muted">
            Suscripción anual por perfil. Tarjeta NFC física opcional desde $29.
          </p>
        </div>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {PLANS.map((p) => (
            <Card
              key={p.name}
              className={
                p.highlight
                  ? "relative p-5 ring-1 ring-primary"
                  : "relative p-5"
              }
            >
              {p.highlight && (
                <span className="absolute -top-2.5 left-5 rounded-full bg-primary px-2.5 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-white">
                  Recomendado
                </span>
              )}
              <h3 className="font-display text-lg font-semibold">{p.name}</h3>
              <p className="mt-1 font-display text-3xl font-semibold text-primary">
                {p.price}
                <span className="text-sm font-normal text-muted-2"> /año</span>
              </p>
              <p className="mt-2 text-sm text-muted">{p.tagline}</p>
              <ul className="mt-4 space-y-2">
                {p.features.map((f) => (
                  <li key={f} className="flex items-start gap-2 text-sm">
                    <Check className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
                    <span className="text-muted">{f}</span>
                  </li>
                ))}
              </ul>
            </Card>
          ))}
        </div>
      </section>

      {/* Interest / CTA */}
      <section id="interest" className="mx-auto max-w-xl scroll-mt-8 px-4 py-16">
        <Card className="p-6 sm:p-8">
          <div className="mb-6 text-center">
            <h2 className="font-display text-2xl font-semibold">
              Quiero una tarjeta como esta
            </h2>
            <p className="mt-1 text-sm text-muted">
              Déjanos tus datos y te ayudamos a lanzar tu AFTO Connect.
            </p>
          </div>
          <InterestForm />
        </Card>
      </section>

      <footer className="border-t border-border py-8 text-center text-sm text-muted-2">
        <div className="mx-auto flex max-w-5xl flex-col items-center gap-2 px-4">
          <Logo />
          <p>Ideas en acción · Networking para un futuro real.</p>
        </div>
      </footer>
    </main>
  );
}
