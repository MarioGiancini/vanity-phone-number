import { NextResponse } from "next/server";
import { BUILT_IN_LISTS } from "@/data/word-lists";

/**
 * Capability document for the agent API. Point an agent at GET /api/agent and
 * it can discover every endpoint. All /api/agent/* routes require the
 * VANITY_AGENT_API_KEY via `Authorization: Bearer <key>` or `x-api-key`.
 */
export async function GET() {
  return NextResponse.json({
    name: "Vanity Phone Number Studio — Agent API",
    description:
      "Generate memorable vanity phone numbers from a brief, decode numbers into words, and verify availability.",
    auth: "Authorization: Bearer $VANITY_AGENT_API_KEY  (or x-api-key: $VANITY_AGENT_API_KEY)",
    mcp: {
      remote: "POST /api/mcp (Streamable HTTP, bearer auth) — no local install",
      stdio: "scripts/mcp-server.mjs",
    },
    endpoints: {
      "GET /api/agent": "This capability document.",
      "POST /api/agent/find": {
        description:
          "Find ranked vanity numbers for a brief. Availability is checked automatically when the prompt asks for available numbers (or when checkAvailability is true).",
        body: {
          prompt: "string — e.g. \"cool vanity number for a Las Vegas tech business that is available\"",
          areaCode: "optional 3-digit code; overrides the prompt",
          theme: "optional built-in list id",
          words: "optional explicit words, e.g. [\"BIG\", \"CODE\"]",
          limit: "optional number of results (default 40)",
          checkAvailability: "optional boolean",
          onlyAvailable: "optional boolean — filter to numbers Twilio can sell",
          availabilityLimit: "optional number of top candidates to check (default 5)",
        },
      },
      "POST /api/agent/discover": {
        description:
          "Scan an area code's available inventory and return numbers that spell real words. Use when the caller gives an area code/city but no specific words.",
        body: { areaCode: "702", pages: "inventory pages to scan (default 3)", limit: 20, minScore: 80 },
      },
      "POST /api/agent/decode": {
        description: "Decode a number into dictionary word readings.",
        body: { number: "string — 7 or 10 digits" },
      },
      "POST /api/agent/verify": {
        description:
          "Batch-verify words against Twilio inventory using the Contains pattern (one call per word).",
        body: { areaCode: "702", words: ["BIGCODE", "PROGRAM"] },
      },
      "POST /api/availability": {
        description: "Check a single number against Twilio inventory (no agent key required).",
        body: { number: "string" },
      },
    },
    themes: BUILT_IN_LISTS.map((list) => ({
      id: list.id,
      name: list.name,
      group: list.group,
      words: list.words.length,
    })),
    examples: [
      {
        method: "POST",
        path: "/api/agent/find",
        body: { prompt: "find a cool available vanity number in Las Vegas for a tech business", onlyAvailable: true, limit: 5 },
      },
    ],
  });
}
