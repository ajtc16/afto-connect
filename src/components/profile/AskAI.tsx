"use client";

import { useRef, useState } from "react";
import { Sparkles, Send } from "lucide-react";
import { cn } from "@/lib/utils";
import { trackEvent } from "@/lib/tracking";

interface Msg {
  role: "user" | "assistant";
  content: string;
}

const SUGGESTION =
  "Tengo una clínica dental y quiero automatizar las citas.";

export function AskAI({ slug }: { slug: string }) {
  const [messages, setMessages] = useState<Msg[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [mocked, setMocked] = useState(true);
  const conversationId = useRef<string | null>(null);
  const started = useRef(false);

  async function send(text: string) {
    const content = text.trim();
    if (!content || loading) return;

    if (!started.current) {
      started.current = true;
      trackEvent(slug, "ai_chat_start");
    }

    setMessages((m) => [...m, { role: "user", content }]);
    setInput("");
    setLoading(true);

    try {
      const params = new URLSearchParams(window.location.search);
      const res = await fetch("/api/ai/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          slug,
          message: content,
          conversationId: conversationId.current,
          source: params.get("src") ?? params.get("source"),
          campaign: params.get("campaign"),
        }),
      });
      const data = await res.json();
      conversationId.current = data.conversationId ?? conversationId.current;
      setMocked(Boolean(data.mocked));
      setMessages((m) => [
        ...m,
        {
          role: "assistant",
          content: data.reply ?? "Ocurrió un error. Intenta de nuevo.",
        },
      ]);
    } catch {
      setMessages((m) => [
        ...m,
        { role: "assistant", content: "Ocurrió un error. Intenta de nuevo." },
      ]);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="flex flex-col gap-3">
      <div className="flex items-center gap-2">
        <Sparkles className="h-5 w-5 text-primary" />
        <h3 className="font-display text-lg font-semibold">Ask AFTO AI</h3>
        {mocked && (
          <span className="ml-auto rounded-full border border-border bg-surface-2 px-2 py-0.5 text-[10px] uppercase tracking-wide text-muted-2">
            Respuesta simulada
          </span>
        )}
      </div>
      <p className="text-sm text-muted">
        Cuéntanos tu idea y descubre cómo podemos hacerla realidad.
      </p>

      {messages.length === 0 ? (
        <button
          type="button"
          onClick={() => send(SUGGESTION)}
          className="afto-focus rounded-btn border border-border bg-surface-2 px-3.5 py-2.5 text-left text-sm text-muted hover:border-border-strong"
        >
          {SUGGESTION}
        </button>
      ) : (
        <div className="flex max-h-72 flex-col gap-2 overflow-y-auto pr-1">
          {messages.map((m, i) => (
            <div
              key={i}
              className={cn(
                "max-w-[85%] whitespace-pre-line rounded-2xl px-3.5 py-2.5 text-sm",
                m.role === "user"
                  ? "self-end bg-primary text-white"
                  : "self-start border border-border bg-surface-2 text-foreground"
              )}
            >
              {m.content}
            </div>
          ))}
          {loading && (
            <div className="self-start rounded-2xl border border-border bg-surface-2 px-3.5 py-2.5 text-sm text-muted-2">
              Escribiendo…
            </div>
          )}
        </div>
      )}

      <form
        onSubmit={(e) => {
          e.preventDefault();
          send(input);
        }}
        className="flex items-center gap-2"
      >
        <input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Escribe tu idea…"
          className="afto-focus h-11 w-full rounded-btn border border-border bg-surface-2 px-3.5 text-sm placeholder:text-muted-2 focus:border-primary"
        />
        <button
          type="submit"
          disabled={loading || !input.trim()}
          aria-label="Enviar"
          className="afto-focus flex h-11 w-11 shrink-0 items-center justify-center rounded-btn bg-primary text-white transition-colors hover:bg-primary-hover disabled:opacity-50"
        >
          <Send className="h-4 w-4" />
        </button>
      </form>
    </div>
  );
}
