import "server-only";
import { serverEnv } from "@/lib/env";
import type { AiProvider } from "./provider";
import { mockProvider } from "./mock";

/**
 * Resolve the active AI provider from env. MVP ships `mock`. To add a real
 * provider: implement AiProvider (e.g. ./anthropic) and register it here.
 */
export function getAiProvider(): AiProvider {
  switch (serverEnv.aiProvider) {
    // case "anthropic": return anthropicProvider;
    case "mock":
    default:
      return mockProvider;
  }
}

export type { AiProvider, AiContext } from "./provider";
