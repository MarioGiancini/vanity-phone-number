import { siteUrl } from "@/lib/site";
import { REPO_URL } from "@/lib/seo";

export const dynamic = "force-static";

/** Markdown rendering of /docs (served via Accept: text/markdown). */
export function GET() {
  const base = siteUrl();
  const body = `# Agent API — Vanity Phone Number Studio

Turn a brief into ranked vanity phone numbers, decode numbers into words, and verify availability. Open source under MIT.

## Authentication

The \`/api/agent/*\` routes and \`/api/mcp\` require a bearer key: \`Authorization: Bearer $VANITY_AGENT_API_KEY\` (or \`x-api-key\`). If the server has no key configured, they return 503. See ${base}/auth.md.

## Find vanity numbers

POST ${base}/api/agent/find

\`\`\`bash
curl -s -X POST ${base}/api/agent/find \\
  -H "Authorization: Bearer $VANITY_AGENT_API_KEY" \\
  -H "Content-Type: application/json" \\
  -d '{"prompt":"cool vanity number in Las Vegas for a tech business that is available","onlyAvailable":true,"limit":5}'
\`\`\`

Body: prompt, areaCode, theme, words[], limit, checkAvailability, onlyAvailable, availabilityLimit.

## Discover available numbers

POST ${base}/api/agent/discover — body: { areaCode, pages, limit }.

## Decode a number

POST ${base}/api/agent/decode — body: { number }.

## Check availability

POST ${base}/api/availability — body: { number } (rate-limited).

## Batch verify words

POST ${base}/api/agent/verify — body: { areaCode, words[] } (Twilio Contains).

## MCP

Remote (no install): POST ${base}/api/mcp (Streamable HTTP, bearer auth).

## Machine-readable

- ${base}/openapi.json — OpenAPI 3.1
- ${base}/.well-known/api-catalog — RFC 9727
- ${base}/.well-known/mcp/server-card — MCP server card
- ${base}/.well-known/agent.json — A2A agent card
- ${base}/llms.txt

## Errors

All API errors are JSON: \`{ "error": string, "message"?: string }\` with appropriate HTTP status. Rate-limited responses include RateLimit-* and Retry-After headers.

## Versioning

The API is unversioned and additive; breaking changes would be introduced under a new path (e.g. /api/v2) with the previous path kept for at least 90 days.

## License

MIT — ${REPO_URL}
`;
  return new Response(body, {
    headers: { "Content-Type": "text/markdown; charset=utf-8" },
  });
}
