import type { Plan } from "@/lib/plans";

/**
 * Application-level domain types mirroring the database schema.
 * These are the shapes the app code works with (camelCase where convenient
 * at the boundary is avoided — we keep snake_case to match Postgres rows).
 */

export type EventType =
  | "profile_view"
  | "contact_save"
  | "whatsapp_click"
  | "linkedin_click"
  | "email_click"
  | "website_click"
  | "lead_submit"
  | "ai_chat_start";

export type LeadStatus = "new" | "contacted" | "archived";
export type MemberRole = "owner" | "admin" | "member";
export type LinkType =
  | "instagram"
  | "x"
  | "facebook"
  | "tiktok"
  | "youtube"
  | "github"
  | "calendar"
  | "custom";

export interface OrganizationBranding {
  logo_url?: string | null;
  primary_color?: string | null;
}

export interface Organization {
  id: string;
  name: string;
  slug: string;
  plan: Plan;
  branding: OrganizationBranding;
  created_at: string;
}

export interface ProfileTheme {
  primary_color?: string | null;
  background?: string | null;
}

export interface Profile {
  id: string;
  organization_id: string;
  slug: string;
  published: boolean;
  full_name: string;
  title: string | null;
  company: string | null;
  bio: string | null;
  avatar_url: string | null;
  logo_url: string | null;
  phone: string | null;
  email: string | null;
  website: string | null;
  whatsapp: string | null;
  linkedin: string | null;
  theme: ProfileTheme;
  created_at: string;
  updated_at: string;
}

export interface ProfileLink {
  id: string;
  profile_id: string;
  type: LinkType;
  label: string;
  url: string;
  icon: string | null;
  sort_order: number;
}

export interface Lead {
  id: string;
  organization_id: string;
  profile_id: string;
  full_name: string;
  company: string | null;
  email: string | null;
  phone: string | null;
  message: string | null;
  source: string | null;
  campaign: string | null;
  user_agent: string | null;
  referrer: string | null;
  status: LeadStatus;
  created_at: string;
}

export interface AnalyticsEvent {
  id: string;
  organization_id: string;
  profile_id: string;
  type: EventType;
  source: string | null;
  campaign: string | null;
  user_agent: string | null;
  referrer: string | null;
  created_at: string;
}

/** Public profile bundle used to render `/c/[slug]`. */
export interface PublicProfile extends Profile {
  organization: Pick<Organization, "id" | "name" | "plan" | "branding">;
  links: ProfileLink[];
}
