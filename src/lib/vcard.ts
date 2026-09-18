import type { Profile } from "@/types/db";

/** Escape per vCard 3.0 (RFC 6350-ish) text rules. */
function esc(value: string): string {
  return value
    .replace(/\\/g, "\\\\")
    .replace(/\n/g, "\\n")
    .replace(/,/g, "\\,")
    .replace(/;/g, "\\;");
}

/** Split a full name into (family; given) for the structured N field. */
function structuredName(fullName: string): string {
  const parts = fullName.trim().split(/\s+/);
  if (parts.length === 1) return `${esc(parts[0])};;;;`;
  const family = parts.pop() as string;
  const given = parts.join(" ");
  return `${esc(family)};${esc(given)};;;`;
}

/**
 * Build a vCard 3.0 string for a profile. Broadly compatible with the iOS and
 * Android native contact importers.
 */
export function buildVCard(profile: Profile): string {
  const lines: string[] = [
    "BEGIN:VCARD",
    "VERSION:3.0",
    `N:${structuredName(profile.full_name)}`,
    `FN:${esc(profile.full_name)}`,
  ];

  if (profile.company) lines.push(`ORG:${esc(profile.company)}`);
  if (profile.title) lines.push(`TITLE:${esc(profile.title)}`);
  if (profile.phone) lines.push(`TEL;TYPE=CELL:${esc(profile.phone)}`);
  if (profile.email) lines.push(`EMAIL;TYPE=INTERNET:${esc(profile.email)}`);
  if (profile.website) lines.push(`URL:${esc(profile.website)}`);
  if (profile.linkedin) {
    lines.push(`X-SOCIALPROFILE;TYPE=linkedin:${esc(profile.linkedin)}`);
  }
  if (profile.bio) lines.push(`NOTE:${esc(profile.bio)}`);

  lines.push("END:VCARD");
  return lines.join("\r\n");
}

/** Suggested download filename, e.g. "antonio-teran.vcf". */
export function vcardFilename(profile: Profile): string {
  const base = profile.full_name
    .toLowerCase()
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
  return `${base || "contact"}.vcf`;
}
