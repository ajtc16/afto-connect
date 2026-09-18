"use client";

import { useActionState } from "react";
import { CheckCircle2 } from "lucide-react";
import { updateProfile, type UpdateProfileState } from "@/app/dashboard/profile/actions";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Field, Input, Textarea } from "@/components/ui/Field";
import type { Profile } from "@/types/db";

const initial: UpdateProfileState = { ok: false };

export function ProfileEditor({ profile }: { profile: Profile }) {
  const [state, formAction, pending] = useActionState(updateProfile, initial);

  return (
    <form action={formAction} className="space-y-6">
      <input type="hidden" name="id" value={profile.id} />
      <input type="hidden" name="slug" value={profile.slug} />

      <Card className="space-y-4 p-5">
        <h2 className="font-medium">Identidad</h2>
        <Field label="Nombre completo" htmlFor="full_name" required>
          <Input id="full_name" name="full_name" defaultValue={profile.full_name} required />
        </Field>
        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="Cargo" htmlFor="title">
            <Input id="title" name="title" defaultValue={profile.title ?? ""} />
          </Field>
          <Field label="Empresa" htmlFor="company">
            <Input id="company" name="company" defaultValue={profile.company ?? ""} />
          </Field>
        </div>
        <Field label="Bio" htmlFor="bio">
          <Textarea id="bio" name="bio" defaultValue={profile.bio ?? ""} />
        </Field>
      </Card>

      <Card className="space-y-4 p-5">
        <h2 className="font-medium">Contacto y enlaces</h2>
        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="Teléfono" htmlFor="phone">
            <Input id="phone" name="phone" defaultValue={profile.phone ?? ""} />
          </Field>
          <Field label="WhatsApp" htmlFor="whatsapp">
            <Input id="whatsapp" name="whatsapp" defaultValue={profile.whatsapp ?? ""} />
          </Field>
          <Field label="Email" htmlFor="email">
            <Input id="email" name="email" type="email" defaultValue={profile.email ?? ""} />
          </Field>
          <Field label="Sitio web" htmlFor="website">
            <Input id="website" name="website" defaultValue={profile.website ?? ""} />
          </Field>
        </div>
        <Field label="LinkedIn (URL)" htmlFor="linkedin">
          <Input id="linkedin" name="linkedin" defaultValue={profile.linkedin ?? ""} />
        </Field>
      </Card>

      <Card className="flex items-center justify-between p-5">
        <div>
          <p className="font-medium">Perfil publicado</p>
          <p className="text-sm text-muted">Visible en /c/{profile.slug}</p>
        </div>
        <label className="inline-flex cursor-pointer items-center">
          <input
            type="checkbox"
            name="published"
            defaultChecked={profile.published}
            className="peer sr-only"
          />
          <span className="relative h-6 w-11 rounded-full bg-surface-2 transition-colors peer-checked:bg-primary after:absolute after:left-0.5 after:top-0.5 after:h-5 after:w-5 after:rounded-full after:bg-white after:transition-transform peer-checked:after:translate-x-5" />
        </label>
      </Card>

      <div className="flex items-center gap-3">
        <Button type="submit" size="lg" disabled={pending}>
          {pending ? "Guardando..." : "Guardar cambios"}
        </Button>
        {state.ok && (
          <span className="flex items-center gap-1.5 text-sm text-success">
            <CheckCircle2 className="h-4 w-4" /> Guardado
          </span>
        )}
        {state.error && <span className="text-sm text-danger">{state.error}</span>}
      </div>
    </form>
  );
}
