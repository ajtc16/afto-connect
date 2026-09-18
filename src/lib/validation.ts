import { z } from "zod";

/** Event ingestion (public). */
export const eventSchema = z.object({
  slug: z.string().min(1).max(80),
  type: z.enum([
    "profile_view",
    "contact_save",
    "whatsapp_click",
    "linkedin_click",
    "email_click",
    "website_click",
    "lead_submit",
    "ai_chat_start",
  ]),
  source: z.string().max(120).nullish(),
  campaign: z.string().max(120).nullish(),
  referrer: z.string().max(500).nullish(),
});
export type EventInput = z.infer<typeof eventSchema>;

/** Lead capture (public). At least one contact channel required. */
export const leadSchema = z
  .object({
    slug: z.string().min(1).max(80),
    full_name: z.string().trim().min(2, "Ingresa tu nombre").max(120),
    company: z.string().trim().max(120).optional().or(z.literal("")),
    email: z
      .string()
      .trim()
      .email("Email inválido")
      .max(200)
      .optional()
      .or(z.literal("")),
    phone: z.string().trim().max(40).optional().or(z.literal("")),
    message: z.string().trim().max(1000).optional().or(z.literal("")),
    source: z.string().max(120).nullish(),
    campaign: z.string().max(120).nullish(),
    // Honeypot: real users never fill this hidden field. Kept permissive so a
    // bot that fills it still passes validation and is dropped silently in the
    // route (returning a friendly ok) rather than getting a revealing error.
    website_hp: z.string().optional(),
  })
  .refine((d) => Boolean(d.email) || Boolean(d.phone), {
    message: "Deja un email o teléfono para poder contactarte",
    path: ["email"],
  });
export type LeadInput = z.infer<typeof leadSchema>;

/** Ask AFTO AI message (public). */
export const aiMessageSchema = z.object({
  slug: z.string().min(1).max(80),
  message: z.string().trim().min(1).max(1000),
  conversationId: z.string().uuid().nullish(),
  source: z.string().max(120).nullish(),
  campaign: z.string().max(120).nullish(),
});
export type AiMessageInput = z.infer<typeof aiMessageSchema>;
