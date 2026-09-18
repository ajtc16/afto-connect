import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import { getPublicProfile } from "@/lib/data/profiles";
import { planFeatures } from "@/lib/plans";
import { absoluteUrl } from "@/lib/env";
import { Card } from "@/components/ui/Card";
import { Logo } from "@/components/brand/Logo";
import { ProfileHeader } from "@/components/profile/ProfileHeader";
import { ContactButtons } from "@/components/profile/ContactButtons";
import { LeadForm } from "@/components/profile/LeadForm";
import { AskAI } from "@/components/profile/AskAI";
import { ViewTracker } from "@/components/profile/ViewTracker";

interface Props {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const profile = await getPublicProfile(slug);
  if (!profile) return { title: "Perfil no encontrado" };

  const title = `${profile.full_name}${profile.title ? ` — ${profile.title}` : ""}`;
  const description =
    profile.bio ?? `Conecta con ${profile.full_name} en AFTO Connect.`;
  const url = absoluteUrl(`/c/${profile.slug}`);

  return {
    title,
    description,
    alternates: { canonical: url },
    openGraph: {
      title,
      description,
      url,
      type: "profile",
      images: profile.avatar_url ? [{ url: profile.avatar_url }] : undefined,
    },
    twitter: { card: "summary", title, description },
  };
}

export default async function ProfilePage({ params }: Props) {
  const { slug } = await params;
  const profile = await getPublicProfile(slug);
  if (!profile) notFound();

  const features = planFeatures(profile.organization.plan);

  return (
    <main className="afto-aurora min-h-dvh pb-16">
      <ViewTracker slug={profile.slug} />

      <div className="mx-auto flex w-full max-w-md flex-col gap-6 px-4 pt-8">
        {/* Brand bar */}
        <div className="flex items-center justify-between">
          <Logo />
          <span className="text-xs uppercase tracking-widest text-muted-2">
            Connect
          </span>
        </div>

        {/* Identity card */}
        <Card className="p-6">
          <ProfileHeader profile={profile} />
          <div className="mt-6">
            <ContactButtons profile={profile} />
          </div>
        </Card>

        {/* Ask AFTO AI (AI plan) */}
        {features.ai && (
          <Card className="p-5">
            <AskAI slug={profile.slug} />
          </Card>
        )}

        {/* Lead capture (Pro+) */}
        {features.leadCapture && (
          <Card className="p-5">
            <div className="mb-4">
              <h2 className="font-display text-lg font-semibold">
                Déjanos tu contacto
              </h2>
              <p className="text-sm text-muted">
                Cuéntanos sobre ti y conversamos pronto.
              </p>
            </div>
            <LeadForm slug={profile.slug} />
          </Card>
        )}

        {/* Marketing CTA */}
        <Link
          href="/?interest=1"
          className="afto-focus group flex items-center justify-between rounded-card border border-border bg-surface/60 px-4 py-3.5 transition-colors hover:border-border-strong"
        >
          <span className="text-sm">
            <span className="font-medium">Quiero una tarjeta como esta</span>
            <span className="block text-muted-2">Descubre AFTO Connect</span>
          </span>
          <ArrowUpRight className="h-5 w-5 text-primary transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
        </Link>

        <footer className="pt-2 text-center text-xs text-muted-2">
          Con tecnología de{" "}
          <Link href="/" className="text-muted hover:text-foreground">
            AFTO Connect
          </Link>
        </footer>
      </div>
    </main>
  );
}
