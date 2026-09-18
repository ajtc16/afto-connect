import { NextResponse } from "next/server";
import { eventSchema } from "@/lib/validation";
import { resolvePublishedProfile } from "@/lib/data/resolve";
import { createAdminClient } from "@/lib/supabase/admin";
import { rateLimit, clientIp } from "@/lib/rate-limit";

/**
 * Public event ingestion. Fire-and-forget from the client (sendBeacon).
 * Writes with the service-role client after validation; RLS denies anon
 * writes so this route is the only ingress.
 */
export async function POST(req: Request) {
  // Generous limit: views + several clicks per visit are normal.
  const { ok } = rateLimit(`ev:${clientIp(req)}`, { limit: 60, windowMs: 60_000 });
  if (!ok) return NextResponse.json({ ok: false }, { status: 429 });

  let json: unknown;
  try {
    json = await req.json();
  } catch {
    return NextResponse.json({ ok: false }, { status: 400 });
  }

  const parsed = eventSchema.safeParse(json);
  if (!parsed.success) return NextResponse.json({ ok: false }, { status: 400 });

  const profile = await resolvePublishedProfile(parsed.data.slug);
  if (!profile) return NextResponse.json({ ok: false }, { status: 404 });

  const db = createAdminClient();
  await db.from("events").insert({
    organization_id: profile.organization_id,
    profile_id: profile.id,
    type: parsed.data.type,
    source: parsed.data.source ?? null,
    campaign: parsed.data.campaign ?? null,
    referrer: parsed.data.referrer ?? null,
    user_agent: req.headers.get("user-agent")?.slice(0, 300) ?? null,
  });

  return NextResponse.json({ ok: true });
}
