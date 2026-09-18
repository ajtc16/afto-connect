"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { createClient } from "@/lib/supabase/server";

const updateSchema = z.object({
  id: z.string().uuid(),
  full_name: z.string().trim().min(2).max(120),
  title: z.string().trim().max(120).optional(),
  company: z.string().trim().max(120).optional(),
  bio: z.string().trim().max(600).optional(),
  phone: z.string().trim().max(40).optional(),
  email: z.string().trim().email().max(200).or(z.literal("")).optional(),
  website: z.string().trim().url().max(300).or(z.literal("")).optional(),
  whatsapp: z.string().trim().max(40).optional(),
  linkedin: z.string().trim().url().max(300).or(z.literal("")).optional(),
  published: z.boolean(),
});

export type UpdateProfileState = { ok: boolean; error?: string };

/**
 * Update a profile the signed-in user owns. RLS enforces that the row belongs
 * to the caller's organization, so a forged id cannot touch another tenant.
 */
export async function updateProfile(
  _prev: UpdateProfileState,
  formData: FormData
): Promise<UpdateProfileState> {
  const raw = {
    id: formData.get("id"),
    full_name: formData.get("full_name"),
    title: formData.get("title"),
    company: formData.get("company"),
    bio: formData.get("bio"),
    phone: formData.get("phone"),
    email: formData.get("email"),
    website: formData.get("website"),
    whatsapp: formData.get("whatsapp"),
    linkedin: formData.get("linkedin"),
    published: formData.get("published") === "on",
  };

  const parsed = updateSchema.safeParse(raw);
  if (!parsed.success) {
    return { ok: false, error: parsed.error.issues[0]?.message ?? "Datos inválidos" };
  }

  const { id, ...fields } = parsed.data;
  const supabase = await createClient();
  const { error } = await supabase
    .from("profiles")
    .update({
      full_name: fields.full_name,
      title: fields.title || null,
      company: fields.company || null,
      bio: fields.bio || null,
      phone: fields.phone || null,
      email: fields.email || null,
      website: fields.website || null,
      whatsapp: fields.whatsapp || null,
      linkedin: fields.linkedin || null,
      published: fields.published,
    })
    .eq("id", id);

  if (error) return { ok: false, error: "No se pudo guardar. Intenta de nuevo." };

  revalidatePath("/dashboard/profile");
  revalidatePath(`/c/${formData.get("slug")}`);
  return { ok: true };
}
