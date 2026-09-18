import { createAdminClient } from "@/lib/supabase/admin";
import { buildVCard, vcardFilename } from "@/lib/vcard";
import type { Profile } from "@/types/db";

/** Serve a downloadable .vcf for a published profile. */
export async function GET(
  _req: Request,
  { params }: { params: Promise<{ slug: string }> }
) {
  const { slug } = await params;
  const db = createAdminClient();
  const { data, error } = await db
    .from("profiles")
    .select("*")
    .eq("slug", slug)
    .eq("published", true)
    .maybeSingle();

  if (error || !data) {
    return new Response("Not found", { status: 404 });
  }

  const profile = data as Profile;
  const vcard = buildVCard(profile);

  return new Response(vcard, {
    status: 200,
    headers: {
      "Content-Type": "text/vcard; charset=utf-8",
      "Content-Disposition": `attachment; filename="${vcardFilename(profile)}"`,
      "Cache-Control": "public, max-age=300",
    },
  });
}
