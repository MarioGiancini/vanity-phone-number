"use client";

import { Analytics } from "@vercel/analytics/react";
import { useStudio } from "./studio-context";

/**
 * Anonymous, cookieless analytics (Vercel Web Analytics). Rendered only when
 * the user hasn't opted out. It's a no-op off Vercel.
 */
export function StudioAnalytics() {
  const { preferences } = useStudio();
  if (!preferences.analytics) return null;
  return <Analytics />;
}
