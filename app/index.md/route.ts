import { siteUrl } from "@/lib/site";
import { REPO_URL } from "@/lib/seo";

export const dynamic = "force-static";

/** Markdown rendering of the home page (served via Accept: text/markdown). */
export function GET() {
  const base = siteUrl();
  const body = `# Vanity Phone Number Studio

> Open-source, agent-native vanity phone number tool. Find, decode, and verify memorable phone numbers.

Turns a brief or explicit words into vanity phone numbers (e.g. 702-PROGRAM = 702-776-4726), decodes numbers back into words, generates combos from themed word packs, and verifies availability against Twilio/Telnyx inventory.

## Use it as an agent

- Capability document (no auth): ${base}/api/agent
- Agent guide (when to use, tools): ${base}/agents.md
- OpenAPI 3.1: ${base}/openapi.json
- Authentication: ${base}/auth.md — Bearer $VANITY_AGENT_API_KEY
- Remote MCP (Streamable HTTP): ${base}/api/mcp
- API catalog: ${base}/.well-known/api-catalog

## Endpoints

- POST /api/agent/find — brief or words to ranked numbers (optional availability)
- POST /api/agent/discover — scan an area code for available word-spelling numbers
- POST /api/agent/decode — number to dictionary readings
- POST /api/agent/verify — batch word verification (Twilio Contains)
- POST /api/availability — single-number availability check

## MCP tools

find_vanity_numbers, find_available_numbers, decode_number, check_availability, verify_words.

## Human UI

The studio at ${base}/ has a dial pad, word combos, decoding, a Discover scanner, and saved numbers (stored in your browser). Visitors can supply their own carrier keys in the "Carrier keys" dialog.

## License

MIT — ${REPO_URL}
`;
  return new Response(body, {
    headers: { "Content-Type": "text/markdown; charset=utf-8" },
  });
}
