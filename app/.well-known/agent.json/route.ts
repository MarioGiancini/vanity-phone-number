import { siteUrl } from "@/lib/site";

export const dynamic = "force-static";

/** A2A (Agent-to-Agent) agent card. https://a2a-protocol.org */
export function GET() {
  const base = siteUrl();
  const card = {
    protocolVersion: "0.3.0",
    name: "Vanity Phone Number Studio",
    description:
      "Generate memorable vanity phone numbers from a brief, decode numbers into words, and verify availability.",
    url: `${base}/api/agent`,
    preferredTransport: "JSONRPC",
    version: "0.1.0",
    capabilities: { streaming: false, pushNotifications: false },
    defaultInputModes: ["application/json"],
    defaultOutputModes: ["application/json"],
    securitySchemes: {
      bearer: { type: "http", scheme: "bearer", bearerFormat: "API key" },
    },
    security: [{ bearer: [] }],
    skills: [
      {
        id: "find-vanity-numbers",
        name: "Find vanity numbers",
        description:
          "Turn a brief (city, industry, keywords) into ranked vanity phone numbers, optionally verified against carrier inventory.",
        tags: ["phone", "vanity", "search"],
        examples: ["find a cool available vanity number in Las Vegas for a tech business"],
      },
      {
        id: "decode-number",
        name: "Decode a number",
        description: "Map a phone number's digits back to the words it can spell.",
        tags: ["phone", "decode"],
      },
    ],
  };

  return Response.json(card, {
    headers: { "Content-Type": "application/json; charset=utf-8" },
  });
}
