import { createClient } from "@/lib/supabase/server";
import type { PublicProfile } from "@/types/db";

/**
 * Fetch a published public profile by slug (org subset + ordered links).
 * Uses the RLS-enforced anon server client: only `published` rows are visible,
 * so there is no way to leak an unpublished profile through this path.
 */
export async function getPublicProfile(
  slug: string
): Promise<PublicProfile | null> {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("profiles")
    .select(
      `*,
       organization:organizations!inner ( id, name, plan, branding ),
       links:profile_links ( * )`
    )
    .eq("slug", slug)
    .eq("published", true)
    .maybeSingle();

  if (error || !data) return null;

  const links = (data.links ?? []).sort(
    (a: { sort_order: number }, b: { sort_order: number }) =>
      a.sort_order - b.sort_order
  );

  return { ...data, links } as PublicProfile;
}
