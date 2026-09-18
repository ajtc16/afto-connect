/**
 * Seed script — creates the AFTO organization, the owner user, and the
 * `/c/antonio` demo profile. Idempotent: safe to run repeatedly.
 *
 * Usage:
 *   1. `npx supabase start` (or point env at your hosted project)
 *   2. Fill `.env.local` with SUPABASE_SERVICE_ROLE_KEY
 *   3. `npm run db:seed`
 */
import { config } from "dotenv";
import { createClient } from "@supabase/supabase-js";

config({ path: ".env.local" });

const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
const OWNER_EMAIL = "ateran@afto.dev";

if (!url || !serviceKey) {
  console.error("Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY");
  process.exit(1);
}

const db = createClient(url, serviceKey, {
  auth: { autoRefreshToken: false, persistSession: false },
});

async function main() {
  // 1. Owner auth user (magic-link login uses this email).
  const { data: usersList } = await db.auth.admin.listUsers();
  let ownerId = usersList.users.find((u) => u.email === OWNER_EMAIL)?.id;
  if (!ownerId) {
    const { data, error } = await db.auth.admin.createUser({
      email: OWNER_EMAIL,
      email_confirm: true,
    });
    if (error) throw error;
    ownerId = data.user.id;
    console.log("✓ Created owner user", OWNER_EMAIL);
  } else {
    console.log("• Owner user already exists");
  }

  // 2. Organization (AFTO, AI plan so the demo shows every feature).
  const { data: org, error: orgErr } = await db
    .from("organizations")
    .upsert(
      {
        name: "AFTO",
        slug: "afto",
        plan: "ai",
        branding: { primary_color: "#2e90fa" },
      },
      { onConflict: "slug" }
    )
    .select()
    .single();
  if (orgErr) throw orgErr;
  console.log("✓ Organization", org.name);

  // 3. Membership (owner ↔ org).
  await db
    .from("memberships")
    .upsert(
      { user_id: ownerId, organization_id: org.id, role: "owner" },
      { onConflict: "user_id,organization_id" }
    );

  // 4. Demo profile `/c/antonio`.
  const { data: profile, error: profErr } = await db
    .from("profiles")
    .upsert(
      {
        organization_id: org.id,
        slug: "antonio",
        published: true,
        full_name: "Antonio Terán",
        title: "Founder / AI Engineer",
        company: "AFTO",
        bio: "Construimos productos digitales, automatizaciones y experiencias con IA.",
        phone: "+593998732486",
        email: "ateran@afto.dev",
        website: "https://afto.dev",
        whatsapp: "+593998732486",
        linkedin: "https://www.linkedin.com/in/antonio-teran",
        theme: { primary_color: "#2e90fa" },
      },
      { onConflict: "slug" }
    )
    .select()
    .single();
  if (profErr) throw profErr;
  console.log("✓ Profile /c/" + profile.slug);

  console.log("\nSeed complete. Visit http://localhost:3000/c/antonio");
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
