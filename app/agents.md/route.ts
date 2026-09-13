import { siteUrl } from "@/lib/site";
import { REPO_URL } from "@/lib/seo";

export const dynamic = "force-static";

/**
 * Agent guide — explicit "when to use" instructions for AI agents.
 * Served at /agents.md and linked from llms.txt and the docs.
 */
export function GET() {
  const base = siteUrl();
  const body = `# Agent guide — Vanity Phone Number Studio

## When to use this

Use this tool when a user or agent needs a **memorable phone number**, or wants to know what a
number spells:

- "Find me a cool vanity number in <city/area code> for <business/agent>."
- "What words can 702-776-4726 spell?"
- "Is 702-PROGRAM available?"
- "Set up a good number for my support agent to text/call customers."

## When NOT to use this

- Portability/ownership checks for a number you already own (use a carrier).
- Buying/provisioning a number (use Twilio/Telnyx directly).
- Bulk/marketing SMS compliance (10DLC/A2P) — out of scope.

## How to call it

Authenticate with \`Authorization: Bearer $VANITY_AGENT_API_KEY\`.

| Task | Call |
| --- | --- |
| Find from a brief | \`POST ${base}/api/agent/find\` \`{ prompt, onlyAvailable }\` |
| Scan available inventory | \`POST ${base}/api/agent/discover\` \`{ areaCode }\` |
| Decode a number | \`POST ${base}/api/agent/decode\` \`{ number }\` |
| Check one number | \`POST /api/availability\` \`{ number }\` |
| Batch verify words | \`POST /api/agent/verify\` \`{ areaCode, words }\` |

Or connect the **MCP server**: \`POST ${base}/api/mcp\` (Streamable HTTP, bearer auth) with tools
\`find_vanity_numbers\`, \`find_available_numbers\`, \`decode_number\`, \`check_availability\`,
\`verify_words\`.

## Tips

- Prefer \`find_available_numbers\` when you have a city/area code but no words; it scans carrier
  inventory for numbers that spell real words.
- "Available" is provider-scoped (Twilio/Telnyx inventory at query time), not a guarantee.
- Results include a memorability \`score\` (0–100) and the \`words\` used; show those to the user.
- Capability document (no auth): ${base}/api/agent. OpenAPI: ${base}/openapi.json.

## License

MIT — ${REPO_URL}
`;
  return new Response(body, {
    headers: { "Content-Type": "text/markdown; charset=utf-8" },
  });
}
