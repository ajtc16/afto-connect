import { createClient } from "@/lib/supabase/server";
import type { Organization, Profile, Lead, EventType } from "@/types/db";

/** The signed-in owner's org context. Null when unauthenticated / no org. */
export interface OwnerContext {
  userId: string;
  email: string;
  organization: Organization;
  profiles: Profile[];
}

export async function getOwnerContext(): Promise<OwnerContext | null> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return null;

  // RLS scopes memberships → organizations to this user automatically.
  const { data: membership } = await supabase
    .from("memberships")
    .select("organization:organizations(*)")
    .limit(1)
    .maybeSingle();

  const organization = membership?.organization as Organization | undefined;
  if (!organization) return null;

  const { data: profiles } = await supabase
    .from("profiles")
    .select("*")
    .eq("organization_id", organization.id)
    .order("created_at", { ascending: true });

  return {
    userId: user.id,
    email: user.email ?? "",
    organization,
    profiles: (profiles ?? []) as Profile[],
  };
}

export interface DashboardMetrics {
  views: number;
  leads: number;
  contactSaves: number;
  aiChats: number;
  byType: Record<EventType, number>;
}

const EMPTY_BY_TYPE: Record<EventType, number> = {
  profile_view: 0,
  contact_save: 0,
  whatsapp_click: 0,
  linkedin_click: 0,
  email_click: 0,
  website_click: 0,
  lead_submit: 0,
  ai_chat_start: 0,
};

/** Aggregate event + lead counts for an organization. */
export async function getDashboardMetrics(
  organizationId: string
): Promise<DashboardMetrics> {
  const supabase = await createClient();

  const [{ data: events }, { count: leadCount }] = await Promise.all([
    supabase.from("events").select("type").eq("organization_id", organizationId),
    supabase
      .from("leads")
      .select("id", { count: "exact", head: true })
      .eq("organization_id", organizationId),
  ]);

  const byType = { ...EMPTY_BY_TYPE };
  for (const e of events ?? []) {
    const t = e.type as EventType;
    byType[t] = (byType[t] ?? 0) + 1;
  }

  return {
    views: byType.profile_view,
    leads: leadCount ?? 0,
    contactSaves: byType.contact_save,
    aiChats: byType.ai_chat_start,
    byType,
  };
}

/** Recent leads for the org, newest first. */
export async function getLeads(organizationId: string): Promise<Lead[]> {
  const supabase = await createClient();
  const { data } = await supabase
    .from("leads")
    .select("*")
    .eq("organization_id", organizationId)
    .order("created_at", { ascending: false })
    .limit(200);
  return (data ?? []) as Lead[];
}
