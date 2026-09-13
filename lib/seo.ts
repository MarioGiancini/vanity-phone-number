import { siteUrl } from "./site";

export const REPO_URL = "https://github.com/MarioGiancini/vanity-phone-number";

export function organizationJsonLd(): Record<string, unknown> {
  const base = siteUrl();
  return {
    "@context": "https://schema.org",
    "@type": "Organization",
    name: "Vanity Phone Number Studio",
    url: base,
    logo: `${base}/icon.svg`,
    description:
      "Open-source, agent-native vanity phone number tool. Find, decode, and verify memorable phone numbers.",
    sameAs: [REPO_URL],
    contactPoint: [{ "@type": "ContactPoint", contactType: "technical support", email: "mario@giancini.com" }],
  };
}

export function softwareApplicationJsonLd(): Record<string, unknown> {
  const base = siteUrl();
  return {
    "@context": "https://schema.org",
    "@type": "SoftwareApplication",
    name: "Vanity Phone Number Studio",
    url: base,
    applicationCategory: "DeveloperApplication",
    operatingSystem: "Web",
    description:
      "Turn words and briefs into ranked vanity phone numbers, decode numbers into words, and verify availability against Twilio/Telnyx inventory. Exposed as a REST API and an MCP server.",
    license: `${REPO_URL}/blob/main/LICENSE`,
    isAccessibleForFree: true,
    offers: { "@type": "Offer", price: "0", priceCurrency: "USD" },
    codeRepository: REPO_URL,
    featureList: [
      "Vanity number generation from words and briefs",
      "Number-to-word decoding",
      "Themed word packs",
      "Carrier availability verification (Twilio, Telnyx)",
      "REST API and remote MCP server",
    ],
  };
}

export function websiteJsonLd(): Record<string, unknown> {
  const base = siteUrl();
  return {
    "@context": "https://schema.org",
    "@type": "WebSite",
    name: "Vanity Phone Number Studio",
    url: base,
    description:
      "Agent-native vanity phone number tool: find, decode, and verify memorable numbers.",
    inLanguage: "en",
  };
}
