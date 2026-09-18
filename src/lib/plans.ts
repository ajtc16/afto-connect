/**
 * Plan definitions and feature gating.
 * A single source of truth so Personal/Pro/AI/Business features toggle
 * consistently across the app without scattered conditionals.
 */

export type Plan = "personal" | "pro" | "ai" | "business";

export interface PlanFeatures {
  /** Lead-capture form on the public profile. */
  leadCapture: boolean;
  /** Analytics dashboard + event tracking surfaced to the owner. */
  analytics: boolean;
  /** Ask AFTO AI module. */
  ai: boolean;
  /** Custom branding (logo, primary color, themes). */
  branding: boolean;
  /** Multiple profiles / team members under one organization. */
  multiProfile: boolean;
}

const FEATURES: Record<Plan, PlanFeatures> = {
  personal: {
    leadCapture: false,
    analytics: false,
    ai: false,
    branding: false,
    multiProfile: false,
  },
  pro: {
    leadCapture: true,
    analytics: true,
    ai: false,
    branding: true,
    multiProfile: false,
  },
  ai: {
    leadCapture: true,
    analytics: true,
    ai: true,
    branding: true,
    multiProfile: false,
  },
  business: {
    leadCapture: true,
    analytics: true,
    ai: true,
    branding: true,
    multiProfile: true,
  },
};

export function planFeatures(plan: Plan): PlanFeatures {
  return FEATURES[plan] ?? FEATURES.personal;
}

export const PLAN_LABELS: Record<Plan, string> = {
  personal: "AFTO Connect Personal",
  pro: "AFTO Connect Pro",
  ai: "AFTO Connect AI",
  business: "AFTO Connect Business",
};
