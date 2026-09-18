"use client";

import {
  UserPlus,
  MessageCircle,
  Linkedin,
  Mail,
  Globe,
  type LucideIcon,
} from "lucide-react";
import { trackEvent } from "@/lib/tracking";
import { phoneDigits, cn } from "@/lib/utils";
import type { EventType, PublicProfile } from "@/types/db";

interface Action {
  key: string;
  label: string;
  href: string;
  icon: LucideIcon;
  event: EventType;
  variant: "primary" | "whatsapp" | "linkedin" | "neutral";
  download?: boolean;
}

const VARIANT_CLASS: Record<Action["variant"], string> = {
  primary: "bg-primary text-white hover:bg-primary-hover",
  whatsapp: "bg-whatsapp text-white hover:brightness-105",
  linkedin: "bg-linkedin text-white hover:brightness-110",
  neutral:
    "bg-surface-2 text-foreground border border-border hover:border-border-strong",
};

export function ContactButtons({ profile }: { profile: PublicProfile }) {
  const actions: Action[] = [
    {
      key: "save",
      label: "Guardar contacto",
      href: `/api/vcard/${profile.slug}`,
      icon: UserPlus,
      event: "contact_save",
      variant: "primary",
      download: true,
    },
  ];

  if (profile.whatsapp) {
    actions.push({
      key: "whatsapp",
      label: "WhatsApp",
      href: `https://wa.me/${phoneDigits(profile.whatsapp)}`,
      icon: MessageCircle,
      event: "whatsapp_click",
      variant: "whatsapp",
    });
  }
  if (profile.linkedin) {
    actions.push({
      key: "linkedin",
      label: "LinkedIn",
      href: profile.linkedin,
      icon: Linkedin,
      event: "linkedin_click",
      variant: "linkedin",
    });
  }
  if (profile.email) {
    actions.push({
      key: "email",
      label: "Email",
      href: `mailto:${profile.email}`,
      icon: Mail,
      event: "email_click",
      variant: "neutral",
    });
  }
  if (profile.website) {
    actions.push({
      key: "website",
      label: "Sitio web",
      href: profile.website,
      icon: Globe,
      event: "website_click",
      variant: "neutral",
    });
  }

  return (
    <div className="flex flex-col gap-3">
      {actions.map((a) => {
        const Icon = a.icon;
        const external = a.href.startsWith("http");
        return (
          <a
            key={a.key}
            href={a.href}
            download={a.download}
            target={external ? "_blank" : undefined}
            rel={external ? "noopener noreferrer" : undefined}
            onClick={() => trackEvent(profile.slug, a.event)}
            className={cn(
              "afto-focus flex h-[52px] items-center gap-3 rounded-btn px-4 text-[15px] font-medium",
              "transition-all active:scale-[0.99]",
              VARIANT_CLASS[a.variant]
            )}
          >
            <span className="flex h-8 w-8 items-center justify-center rounded-full bg-black/15">
              <Icon className="h-[18px] w-[18px]" strokeWidth={2} />
            </span>
            {a.label}
          </a>
        );
      })}
    </div>
  );
}
