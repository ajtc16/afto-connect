import { NextResponse } from "next/server";
import { aiMessageSchema } from "@/lib/validation";
import { resolvePublishedProfile } from "@/lib/data/resolve";
import { planFeatures, type Plan } from "@/lib/plans";
import { createAdminClient } from "@/lib/supabase/admin";
import { getAiProvider } from "@/lib/ai";
import { rateLimit, clientIp } from "@/lib/rate-limit";

/**
 * Ask AFTO AI. Validates, gates on the AI plan, persists the conversation,
 * and delegates generation to the configured AiProvider (mock in the MVP).
 */
export async function POST(req: Request) {
  const { ok } = rateLimit(`ai:${clientIp(req)}`, { limit: 15, windowMs: 60_000 });
  if (!ok) {
    return NextResponse.json({ error: "Demasiados mensajes." }, { status: 429 });
  }

  let json: unknown;
  try {
    json = await req.json();
  } catch {
    return NextResponse.json({ error: "Bad request" }, { status: 400 });
  }

  const parsed = aiMessageSchema.safeParse(json);
  if (!parsed.success) {
    return NextResponse.json({ error: "Mensaje inválido" }, { status: 400 });
  }

  const resolved = await resolvePublishedProfile(parsed.data.slug);
  if (!resolved) return NextResponse.json({ error: "Not found" }, { status: 404 });
  if (!planFeatures(resolved.plan as Plan).ai) {
    return NextResponse.json({ error: "No disponible" }, { status: 403 });
  }

  const db = createAdminClient();

  // Fetch profile context for the provider.
  const { data: profileRow } = await db
    .from("profiles")
    .select("full_name, company, bio")
    .eq("id", resolved.id)
    .single();

  // Find or create the conversation.
  let conversationId = parsed.data.conversationId ?? null;
  if (!conversationId) {
    const { data: conv } = await db
      .from("ai_conversations")
      .insert({
        organization_id: resolved.organization_id,
        profile_id: resolved.id,
        source: parsed.data.source ?? null,
        campaign: parsed.data.campaign ?? null,
      })
      .select("id")
      .single();
    conversationId = conv?.id ?? null;
  }

  // Load short history for context.
  const { data: historyRows } = conversationId
    ? await db
        .from("ai_messages")
        .select("role, content")
        .eq("conversation_id", conversationId)
        .order("created_at", { ascending: true })
        .limit(20)
    : { data: [] as { role: "user" | "assistant"; content: string }[] };

  // Persist the user's message.
  if (conversationId) {
    await db.from("ai_messages").insert({
      conversation_id: conversationId,
      role: "user",
      content: parsed.data.message,
    });
  }

  // Generate the reply.
  const provider = getAiProvider();
  const reply = await provider.reply({
    profile: {
      full_name: profileRow?.full_name ?? "",
      company: profileRow?.company ?? null,
      bio: profileRow?.bio ?? null,
    },
    history: (historyRows ?? []) as { role: "user" | "assistant"; content: string }[],
    message: parsed.data.message,
  });

  // Persist the assistant's reply.
  if (conversationId) {
    await db.from("ai_messages").insert({
      conversation_id: conversationId,
      role: "assistant",
      content: reply,
    });
  }

  return NextResponse.json({ reply, conversationId, mocked: provider.mocked });
}
