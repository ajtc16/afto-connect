import Image from "next/image";
import { cn } from "@/lib/utils";
import type { PublicProfile } from "@/types/db";

/** Initials fallback when no avatar image is set. */
function initials(name: string): string {
  return name
    .split(/\s+/)
    .slice(0, 2)
    .map((p) => p[0]?.toUpperCase() ?? "")
    .join("");
}

export function ProfileHeader({ profile }: { profile: PublicProfile }) {
  return (
    <header className="flex flex-col items-center text-center">
      <div className="relative">
        <div
          className={cn(
            "flex h-24 w-24 items-center justify-center overflow-hidden rounded-full",
            "ring-2 ring-primary/60 ring-offset-4 ring-offset-bg bg-surface-2"
          )}
        >
          {profile.avatar_url ? (
            <Image
              src={profile.avatar_url}
              alt={profile.full_name}
              width={96}
              height={96}
              className="h-full w-full object-cover"
              priority
            />
          ) : (
            <span className="text-2xl font-semibold text-muted">
              {initials(profile.full_name)}
            </span>
          )}
        </div>
      </div>

      <h1 className="mt-4 font-display text-2xl font-semibold tracking-tight">
        {profile.full_name}
      </h1>
      {profile.title && (
        <p className="mt-0.5 text-sm text-muted">{profile.title}</p>
      )}
      {profile.company && (
        <p className="mt-1 text-sm font-medium text-primary">
          {profile.company}
        </p>
      )}
      {profile.bio && (
        <p className="mt-3 max-w-sm text-[15px] leading-relaxed text-muted">
          {profile.bio}
        </p>
      )}
    </header>
  );
}
