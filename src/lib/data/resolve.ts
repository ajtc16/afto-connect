import "server-only";
import { createAdminClient } from "@/lib/supabase/admin";

export interface ResolvedProfile {
  id: string;
  organization_id: string;
  plan: string;
}

/**
 * Resolve a published profile's id + org + plan by slug, using the admin
 * client. Server-only; callers are trusted write routes. Returns null for
 * unknown or unpublished slugs (we never write against those).
 */
export async function resolvePublishedProfile(
  slug: string
): Promise<ResolvedProfile | null> {
  const db = createAdminClient();
  const { data, error } = await db
    .from("profiles")
    .select("id, organization_id, published, organizations!inner(plan)")
    .eq("slug", slug)
    .maybeSingle();

  if (error || !data || !data.published) return null;

  // organizations is embedded; normalize its shape.
  const org = data.organizations as unknown as { plan: string };
  return {
    id: data.id,
    organization_id: data.organization_id,
    plan: org.plan,
  };
}
