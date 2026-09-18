"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { CheckCircle2, Send } from "lucide-react";
import { Field, Input, Textarea } from "@/components/ui/Field";
import { Button } from "@/components/ui/Button";
import { leadSchema, type LeadInput } from "@/lib/validation";
import { trackEvent } from "@/lib/tracking";

export function LeadForm({ slug }: { slug: string }) {
  const [done, setDone] = useState(false);
  const [serverError, setServerError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<LeadInput>({
    resolver: zodResolver(leadSchema),
    defaultValues: { slug },
  });

  async function onSubmit(values: LeadInput) {
    setServerError(null);
    const params = new URLSearchParams(window.location.search);
    const res = await fetch("/api/leads", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        ...values,
        source: params.get("src") ?? params.get("source"),
        campaign: params.get("campaign"),
      }),
    });
    if (!res.ok) {
      setServerError("No pudimos enviar tus datos. Intenta de nuevo.");
      return;
    }
    trackEvent(slug, "lead_submit");
    setDone(true);
  }

  if (done) {
    return (
      <div className="flex flex-col items-center gap-2 py-6 text-center">
        <CheckCircle2 className="h-10 w-10 text-success" />
        <p className="font-medium">¡Gracias! Conversamos pronto.</p>
        <p className="text-sm text-muted">Tus datos fueron enviados.</p>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4" noValidate>
      <Field label="Nombre completo" htmlFor="lead-name" required error={errors.full_name?.message}>
        <Input id="lead-name" placeholder="Tu nombre" autoComplete="name" {...register("full_name")} />
      </Field>
      <Field label="Empresa" htmlFor="lead-company" error={errors.company?.message}>
        <Input id="lead-company" placeholder="Tu empresa" autoComplete="organization" {...register("company")} />
      </Field>
      <Field label="Email" htmlFor="lead-email" error={errors.email?.message}>
        <Input id="lead-email" type="email" placeholder="tu@email.com" autoComplete="email" {...register("email")} />
      </Field>
      <Field label="Teléfono / WhatsApp" htmlFor="lead-phone" error={errors.phone?.message}>
        <Input id="lead-phone" type="tel" placeholder="+593 ..." autoComplete="tel" {...register("phone")} />
      </Field>
      <Field label="¿En qué podemos ayudarte?" htmlFor="lead-msg" error={errors.message?.message}>
        <Textarea id="lead-msg" placeholder="Cuéntanos brevemente..." {...register("message")} />
      </Field>

      {/* Honeypot — hidden from users, catches naive bots. */}
      <input
        type="text"
        tabIndex={-1}
        autoComplete="off"
        aria-hidden="true"
        className="absolute left-[-9999px] h-0 w-0 opacity-0"
        {...register("website_hp")}
      />

      {serverError && <p className="text-sm text-danger">{serverError}</p>}

      <Button type="submit" size="lg" disabled={isSubmitting}>
        <Send className="h-4 w-4" />
        {isSubmitting ? "Enviando..." : "Compartir mi contacto"}
      </Button>
    </form>
  );
}
