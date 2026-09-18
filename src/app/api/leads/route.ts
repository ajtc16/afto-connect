import { NextResponse } from "next/server";
import { leadSchema } from "@/lib/validation";
import { resolvePublishedProfile } from "@/lib/data/resolve";
import { planFeatures, type Plan } from "@/lib/plans";
import { createAdminClient } from "@/lib/supabase/admin";
import { rateLimit, clientIp } from "@/lib/rate-limit";

/** Public lead capture. Validated, rate-limited, honeypot-protected. */
export async function POST(req: Request) {
  const { ok } = rateLimit(`lead:${clientIp(req)}`, { limit: 5, windowMs: 60_000 });
  if (!ok) {
    return NextResponse.json(
      { ok: false, error: "Demasiados envíos. Intenta en un minuto." },
      { status: 429 }
    );
  }

  let json: unknown;
  try {
    json = await req.json();
  } catch {
    return NextResponse.json({ ok: false }, { status: 400 });
  }

  const parsed = leadSchema.safeParse(json);
  if (!parsed.success) {
    return NextResponse.json(
      { ok: false, error: parsed.error.issues[0]?.message ?? "Datos inválidos" },
      { status: 400 }
    );
  }

  // Honeypot filled → silently accept (don't tip off bots), but drop it.
  if (parsed.data.website_hp) return NextResponse.json({ ok: true });

  const profile = await resolvePublishedProfile(parsed.data.slug);
  if (!profile) return NextResponse.json({ ok: false }, { status: 404 });

  // Lead capture is a Pro+ feature.
  if (!planFeatures(profile.plan as Plan).leadCapture) {
    return NextResponse.json({ ok: false }, { status: 403 });
  }

  const d = parsed.data;
  const db = createAdminClient();
  const { error } = await db.from("leads").insert({
    organization_id: profile.organization_id,
    profile_id: profile.id,
    full_name: d.full_name,
    company: d.company || null,
    email: d.email || null,
    phone: d.phone || null,
    message: d.message || null,
    source: d.source ?? null,
    campaign: d.campaign ?? null,
    referrer: req.headers.get("referer") ?? null,
    user_agent: req.headers.get("user-agent")?.slice(0, 300) ?? null,
  });

  if (error) return NextResponse.json({ ok: false }, { status: 500 });

  // Also record the lead_submit event for analytics parity.
  await db.from("events").insert({
    organization_id: profile.organization_id,
    profile_id: profile.id,
    type: "lead_submit",
    source: d.source ?? null,
    campaign: d.campaign ?? null,
  });

  return NextResponse.json({ ok: true });
}
