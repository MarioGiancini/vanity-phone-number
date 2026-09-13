import { siteUrl } from "@/lib/site";

export const dynamic = "force-static";

const REPO = "https://github.com/MarioGiancini/vanity-phone-number";

/** MCP server card for the bundled stdio server (scripts/mcp-server.mjs). */
export function GET() {
  const base = siteUrl();
  const card = {
    name: "vanity-phone-number",
    description:
      "Find, decode, and verify vanity phone numbers. Turns a brief like 'cool available vanity number in Las Vegas for a tech business' into ranked, verifiable numbers.",
    version: "0.1.0",
    protocolVersion: "2025-06-18",
    // Remote endpoint — no local install required.
    transport: { type: "streamable-http" },
    url: `${base}/api/mcp`,
    authentication: {
      type: "http",
      scheme: "bearer",
      description: "Authorization: Bearer <VANITY_AGENT_API_KEY>",
    },
    // Local stdio fallback for self-hosting.
    command: "node",
    args: ["scripts/mcp-server.mjs"],
    env: {
      VANITY_API_URL: base,
      VANITY_AGENT_API_KEY: "<your agent key>",
    },
    homepage: REPO,
    repository: { type: "git", url: REPO },
    license: "MIT",
    tools: [
      {
        name: "find_available_numbers",
        description:
          "Scan available inventory for an area code and return the numbers that spell real words.",
      },
      {
        name: "find_vanity_numbers",
        description:
          "Find ranked vanity phone numbers from a brief. Set onlyAvailable to filter to numbers Twilio can sell.",
      },
      {
        name: "decode_number",
        description: "Decode a phone number into the words it can spell.",
      },
      {
        name: "check_availability",
        description: "Check whether a number is in Twilio's purchasable inventory.",
      },
    ],
    documentation: `${base}/docs`,
  };

  return Response.json(card, {
    headers: { "Content-Type": "application/json; charset=utf-8" },
  });
}
