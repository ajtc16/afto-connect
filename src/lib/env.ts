/**
 * Centralized, typed access to environment variables.
 * Public vars (NEXT_PUBLIC_*) are safe in the browser; server-only vars are
 * read lazily so importing this file client-side never touches them.
 */

function required(name: string, value: string | undefined): string {
  if (!value) {
    throw new Error(
      `Missing required environment variable: ${name}. See .env.example.`
    );
  }
  return value;
}

export const publicEnv = {
  siteUrl: process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000",
  supabaseUrl: process.env.NEXT_PUBLIC_SUPABASE_URL ?? "",
  supabaseAnonKey: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? "",
};

/** Server-only secrets. Never import into a Client Component. */
export const serverEnv = {
  get supabaseServiceRoleKey() {
    return required(
      "SUPABASE_SERVICE_ROLE_KEY",
      process.env.SUPABASE_SERVICE_ROLE_KEY
    );
  },
  get aiProvider() {
    return process.env.AI_PROVIDER ?? "mock";
  },
};

/** Absolute URL helper, safe on both server and client. */
export function absoluteUrl(path = ""): string {
  const base = publicEnv.siteUrl.replace(/\/$/, "");
  const suffix = path.startsWith("/") ? path : `/${path}`;
  return path ? `${base}${suffix}` : base;
}
