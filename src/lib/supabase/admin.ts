import "server-only";
import { createClient } from "@supabase/supabase-js";
import { publicEnv, serverEnv } from "@/lib/env";

/**
 * Service-role Supabase client. BYPASSES RLS — server-only, never import into
 * a Client Component. Used exclusively by trusted server routes for public
 * writes (leads / events / AI) and by controlled reads we fully constrain.
 */
export function createAdminClient() {
  return createClient(publicEnv.supabaseUrl, serverEnv.supabaseServiceRoleKey, {
    auth: { autoRefreshToken: false, persistSession: false },
  });
}
