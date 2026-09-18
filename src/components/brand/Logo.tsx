import { cn } from "@/lib/utils";

/**
 * AFTO wordmark + triangle "A" mark, rebuilt as inline SVG so it stays crisp
 * and theme-aware. Electric-blue accent on the ascending stroke.
 */
export function Logo({
  className,
  showWordmark = true,
}: {
  className?: string;
  showWordmark?: boolean;
}) {
  return (
    <span className={cn("inline-flex items-center gap-2.5", className)}>
      <svg
        viewBox="0 0 32 28"
        className="h-6 w-auto"
        aria-hidden="true"
        fill="none"
      >
        {/* Outer A silhouette */}
        <path d="M16 2 L30 26 H22.5 L16 12.5 L9.5 26 H2 Z" fill="currentColor" />
        {/* Electric-blue accent notch */}
        <path d="M16 2 L23 14 L19 14 L16 8.5 Z" fill="var(--color-primary)" />
      </svg>
      {showWordmark && (
        <span className="text-lg font-semibold tracking-tight text-foreground">
          AFTO
        </span>
      )}
    </span>
  );
}
