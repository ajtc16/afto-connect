import { NextResponse } from "next/server";
import { z } from "zod";
import { resolvePublishedProfile } from "@/lib/data/resolve";
import { createAdminClient } from "@/lib/supabase/admin";
import { rateLimit, clientIp } from "@/lib/rate-limit";

/**
 * Product-interest / waitlist capture from the marketing landing ("Quiero una
 * tarjeta como esta"). Stored as a lead on AFTO's own house profile so it lands
 * in the same dashboard, tagged with a distinct source.
 */
const HOUSE_PROFILE_SLUG = "antonio";

const schema = z.object({
  full_name: z.string().trim().min(2).max(120),
  email: z.string().trim().email().max(200),
  company: z.string().trim().max(120).optional().or(z.literal("")),
  message: z.string().trim().max(1000).optional().or(z.literal("")),
  website_hp: z.string().optional(), // honeypot
});

export async function POST(req: Request) {
  const { ok } = rateLimit(`interest:${clientIp(req)}`, { limit: 5, windowMs: 60_000 });
  if (!ok) return NextResponse.json({ ok: false }, { status: 429 });

  let json: unknown;
  try {
    json = await req.json();
  } catch {
    return NextResponse.json({ ok: false }, { status: 400 });
  }

  const parsed = schema.safeParse(json);
  if (!parsed.success) {
    return NextResponse.json(
      { ok: false, error: parsed.error.issues[0]?.message ?? "Datos inválidos" },
      { status: 400 }
    );
  }
  if (parsed.data.website_hp) return NextResponse.json({ ok: true });

  const house = await resolvePublishedProfile(HOUSE_PROFILE_SLUG);
  if (!house) return NextResponse.json({ ok: false }, { status: 503 });

  const db = createAdminClient();
  const { error } = await db.from("leads").insert({
    organization_id: house.organization_id,
    profile_id: house.id,
    full_name: parsed.data.full_name,
    company: parsed.data.company || null,
    email: parsed.data.email,
    message: parsed.data.message || null,
    source: "afto-connect-interest",
    campaign: "landing",
  });

  if (error) return NextResponse.json({ ok: false }, { status: 500 });
  return NextResponse.json({ ok: true });
}
