import { siteUrl } from "@/lib/site";

const REPO = "https://github.com/MarioGiancini/vanity-phone-number";

/** Shared MCP server card / manifest. */
export function buildServerCard() {
  const base = siteUrl();
  return {
    name: "vanity-phone-number",
    description:
      "Find, decode, and verify vanity phone numbers. Turns a brief like 'cool available vanity number in Las Vegas for a tech business' into ranked, verifiable numbers.",
    version: "0.1.0",
    protocolVersion: "2025-06-18",
    transport: { type: "streamable-http" },
    url: `${base}/api/mcp`,
    authentication: {
      type: "http",
      scheme: "bearer",
      description: "Authorization: Bearer <VANITY_AGENT_API_KEY>",
    },
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
        name: "find_vanity_numbers",
        description:
          "Find ranked vanity phone numbers from a brief. Set onlyAvailable to filter to numbers Twilio can sell.",
      },
      {
        name: "find_available_numbers",
        description:
          "Scan available inventory for an area code and return the numbers that spell real words.",
      },
      {
        name: "decode_number",
        description: "Decode a phone number into the words it can spell.",
      },
      {
        name: "check_availability",
        description: "Check whether a number is in a carrier's purchasable inventory.",
      },
      {
        name: "verify_words",
        description: "Batch-verify words against Twilio inventory using the Contains pattern.",
      },
    ],
    documentation: `${base}/docs`,
  };
}
