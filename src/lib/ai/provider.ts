import "server-only";
import type { PublicProfile } from "@/types/db";

export interface AiTurn {
  role: "user" | "assistant";
  content: string;
}

export interface AiContext {
  profile: Pick<PublicProfile, "full_name" | "company" | "bio">;
  history: AiTurn[];
  message: string;
}

/**
 * Provider-agnostic AI interface. The public surface never changes when we
 * swap the mock for Anthropic/OpenAI — see ./mock and ./index.
 */
export interface AiProvider {
  readonly name: string;
  /** Whether responses are real or mocked (surfaced to the UI as a label). */
  readonly mocked: boolean;
  reply(ctx: AiContext): Promise<string>;
}
