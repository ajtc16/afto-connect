/** Tiny className combiner (avoids extra deps; keeps class strings tidy). */
export function cn(...parts: Array<string | false | null | undefined>): string {
  return parts.filter(Boolean).join(" ");
}

/** Digits-only phone for WhatsApp / tel: links, e.g. "+593 99 873 2486" → "593998732486". */
export function phoneDigits(phone: string): string {
  return phone.replace(/[^\d]/g, "");
}
