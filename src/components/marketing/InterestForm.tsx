"use client";

import { useState } from "react";
import { CheckCircle2, ArrowRight } from "lucide-react";
import { Field, Input, Textarea } from "@/components/ui/Field";
import { Button } from "@/components/ui/Button";

export function InterestForm() {
  const [done, setDone] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    setError(null);
    const fd = new FormData(e.currentTarget);
    const res = await fetch("/api/interest", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        full_name: fd.get("full_name"),
        email: fd.get("email"),
        company: fd.get("company"),
        message: fd.get("message"),
        website_hp: fd.get("website_hp"),
      }),
    });
    setLoading(false);
    if (res.ok) setDone(true);
    else setError("No pudimos registrar tu interés. Intenta de nuevo.");
  }

  if (done) {
    return (
      <div className="flex flex-col items-center gap-2 py-6 text-center">
        <CheckCircle2 className="h-10 w-10 text-success" />
        <p className="font-medium">¡Gracias por tu interés!</p>
        <p className="text-sm text-muted">Te contactaremos muy pronto.</p>
      </div>
    );
  }

  return (
    <form onSubmit={onSubmit} className="flex flex-col gap-4">
      <div className="grid gap-4 sm:grid-cols-2">
        <Field label="Nombre completo" htmlFor="i-name" required>
          <Input id="i-name" name="full_name" required placeholder="Tu nombre" />
        </Field>
        <Field label="Empresa" htmlFor="i-company">
          <Input id="i-company" name="company" placeholder="Tu empresa" />
        </Field>
      </div>
      <Field label="Email" htmlFor="i-email" required>
        <Input id="i-email" name="email" type="email" required placeholder="tu@email.com" />
      </Field>
      <Field label="¿Qué te gustaría lograr?" htmlFor="i-msg">
        <Textarea id="i-msg" name="message" placeholder="Cuéntanos brevemente..." />
      </Field>
      <input
        type="text"
        name="website_hp"
        tabIndex={-1}
        autoComplete="off"
        aria-hidden="true"
        className="absolute left-[-9999px] h-0 w-0 opacity-0"
      />
      {error && <p className="text-sm text-danger">{error}</p>}
      <Button type="submit" size="lg" disabled={loading}>
        {loading ? "Enviando..." : "Quiero mi AFTO Connect"}
        <ArrowRight className="h-4 w-4" />
      </Button>
    </form>
  );
}
