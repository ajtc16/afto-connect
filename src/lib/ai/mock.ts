import "server-only";
import type { AiProvider, AiContext } from "./provider";

/**
 * MOCKED AI provider for the MVP. It returns deterministic, on-brand guidance
 * without calling any external model. Clearly flagged `mocked: true` so the UI
 * can label it. Replace by implementing AiProvider against a real model.
 */
export const mockProvider: AiProvider = {
  name: "mock",
  mocked: true,
  async reply({ profile, message }: AiContext): Promise<string> {
    const company = profile.company ?? "AFTO";
    const topic = message.trim().slice(0, 140);

    // Small, believable simulation of latency.
    await new Promise((r) => setTimeout(r, 400));

    return [
      `Gracias por contarnos: "${topic}".`,
      "",
      `En ${company} podríamos abordarlo así:`,
      "• Un asistente con IA que responde preguntas y agenda citas.",
      "• Automatizaciones conectadas a WhatsApp, web y tu CRM.",
      "• Captura y seguimiento de cada oportunidad, con métricas en tiempo real.",
      "",
      "Déjanos tu contacto abajo y lo diseñamos contigo. 🚀",
    ].join("\n");
  },
};
