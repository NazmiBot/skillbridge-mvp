// Plausible custom event tracking
// Fires only if Plausible is loaded (noop otherwise)

declare global {
  interface Window {
    plausible?: (
      event: string,
      options?: { props?: Record<string, string | number> }
    ) => void;
  }
}

export function trackEvent(
  event: string,
  props?: Record<string, string | number>
) {
  if (typeof window !== "undefined" && window.plausible) {
    window.plausible(event, props ? { props } : undefined);
  }
}

// Pre-defined events for the funnel
export const analytics = {
  /** User submitted the career form */
  generateBlueprint: (targetRole: string) =>
    trackEvent("Generate Blueprint", { targetRole }),

  /** User unlocked Authority phase with email */
  emailUnlock: () => trackEvent("Email Unlock"),

  /** User created a shareable link */
  shareCreated: (targetRole: string) =>
    trackEvent("Share Created", { targetRole }),

  /** User clicked share to X or LinkedIn */
  socialShare: (platform: "x" | "linkedin") =>
    trackEvent("Social Share", { platform }),

  /** User clicked a popular career pill */
  popularCareerClick: (career: string) =>
    trackEvent("Popular Career Click", { career }),

  /** User initiated checkout for mock interview */
  checkoutStarted: () => trackEvent("Checkout Started"),

  /** User copied share link */
  linkCopied: () => trackEvent("Link Copied"),
};
