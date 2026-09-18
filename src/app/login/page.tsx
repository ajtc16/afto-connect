"use client";

import { Suspense, useState } from "react";
import { useSearchParams } from "next/navigation";
import { MailCheck } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { absoluteUrl } from "@/lib/env";
import { Logo } from "@/components/brand/Logo";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Field, Input } from "@/components/ui/Field";

function LoginForm() {
  const params = useSearchParams();
  const redirect = params.get("redirect") ?? "/dashboard";
  const [email, setEmail] = useState("");
  const [sent, setSent] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);
    const supabase = createClient();
    const { error } = await supabase.auth.signInWithOtp({
      email,
      options: {
        emailRedirectTo: absoluteUrl(
          `/auth/callback?redirect=${encodeURIComponent(redirect)}`
        ),
      },
    });
    setLoading(false);
    if (error) setError("No pudimos enviar el enlace. Verifica tu email.");
    else setSent(true);
  }

  return (
    <Card className="w-full max-w-sm p-6">
      {sent ? (
        <div className="flex flex-col items-center gap-3 py-4 text-center">
          <MailCheck className="h-10 w-10 text-primary" />
          <h1 className="text-lg font-semibold">Revisa tu correo</h1>
          <p className="text-sm text-muted">
            Te enviamos un enlace mágico a <strong>{email}</strong> para iniciar
            sesión.
          </p>
        </div>
      ) : (
        <form onSubmit={onSubmit} className="flex flex-col gap-4">
          <div className="text-center">
            <h1 className="text-xl font-semibold">Inicia sesión</h1>
            <p className="mt-1 text-sm text-muted">
              Te enviaremos un enlace mágico, sin contraseñas.
            </p>
          </div>
          <Field label="Email" htmlFor="email" required>
            <Input
              id="email"
              type="email"
              autoComplete="email"
              required
              placeholder="tu@email.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </Field>
          {error && <p className="text-sm text-danger">{error}</p>}
          <Button type="submit" size="lg" disabled={loading || !email}>
            {loading ? "Enviando..." : "Enviar enlace mágico"}
          </Button>
        </form>
      )}
    </Card>
  );
}

export default function LoginPage() {
  return (
    <main className="afto-aurora flex min-h-dvh flex-col items-center justify-center gap-8 px-4">
      <Logo className="scale-110" />
      <Suspense>
        <LoginForm />
      </Suspense>
    </main>
  );
}
