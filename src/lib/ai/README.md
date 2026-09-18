# Ask AFTO AI — provider layer

The public UI (`components/profile/AskAI.tsx`) talks to `POST /api/ai/chat`,
which delegates to whatever `AiProvider` `getAiProvider()` returns.

## Current state (MVP)

`mock` provider — deterministic, on-brand responses, **no external model
called**. It reports `mocked: true`, and the chat UI shows a "Respuesta
simulada" label so nothing pretends to be real AI.

## Adding a real provider (V1.1)

1. Create `src/lib/ai/anthropic.ts` implementing `AiProvider`:
   ```ts
   export const anthropicProvider: AiProvider = {
     name: "anthropic",
     mocked: false,
     async reply({ profile, history, message }) { /* call the model */ },
   };
   ```
2. Register it in `getAiProvider()` (`index.ts`).
3. Set `AI_PROVIDER=anthropic` and `ANTHROPIC_API_KEY=...` in the environment.

Nothing else in the app changes — the route, validation, persistence and UI
are all provider-agnostic.
