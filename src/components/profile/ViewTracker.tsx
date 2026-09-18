"use client";

import { useEffect, useRef } from "react";
import { trackEvent } from "@/lib/tracking";

/**
 * Fires a single `profile_view` event on mount. A ref guard prevents double
 * counting under React Strict Mode / re-renders.
 */
export function ViewTracker({ slug }: { slug: string }) {
  const fired = useRef(false);
  useEffect(() => {
    if (fired.current) return;
    fired.current = true;
    trackEvent(slug, "profile_view");
  }, [slug]);
  return null;
}
