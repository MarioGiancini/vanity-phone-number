export const dynamic = "force-static";

/**
 * auth.md — machine-readable authentication instructions for agents.
 * https://workos.com/auth-md
 */
export function GET() {
  const body = `# Authentication

The Vanity Phone Number Studio agent API uses a static bearer token. There is
no OAuth flow and no browser login.

## Scheme

- Type: HTTP Bearer (API key)
- Header: \`Authorization: Bearer <VANITY_AGENT_API_KEY>\`
- Alternative header: \`x-api-key: <VANITY_AGENT_API_KEY>\`

## How agents get a key

This project is open source and self-hostable. There is no public key issuer.

- **Self-hosting:** set \`VANITY_AGENT_API_KEY\` in \`.env.local\` and give the
  same value to your agent / MCP server. Generate one with \`openssl rand -hex 32\`.
- **Hosted instance:** when a hosted deployment is available, request a key from
  the operator. Until then, the routes return \`503\` if no key is configured on
  the server.

## Endpoints requiring auth

- \`POST /api/agent/find\`
- \`POST /api/agent/decode\`
- \`POST /api/mcp\` (remote MCP over Streamable HTTP)

## Endpoints that do not require auth

- \`GET /api/agent\` (capability document)
- \`POST /api/availability\` (rate-limited)

## Errors

- \`401 Unauthorized\` — missing or incorrect key.
- \`503 Service Unavailable\` — the server has no agent key configured.

Machine-readable description: /openapi.json
`;
  return new Response(body, {
    headers: { "Content-Type": "text/markdown; charset=utf-8" },
  });
}
