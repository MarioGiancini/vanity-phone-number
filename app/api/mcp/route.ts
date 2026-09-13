import { WebStandardStreamableHTTPServerTransport } from "@modelcontextprotocol/sdk/server/webStandardStreamableHttp.js";
import { authorizeAgent } from "@/lib/agent/auth";
import { carrierOverride } from "@/lib/agent/credentials";
import { createVanityMcpServer } from "@/lib/mcp/vanity-server";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/**
 * Remote MCP server over Streamable HTTP. Agents connect with the URL and the
 * agent key — no local install.
 *
 *   URL:    https://<host>/api/mcp
 *   Auth:   Authorization: Bearer $VANITY_AGENT_API_KEY
 *
 * Stateless, JSON responses (no SSE). Bring-your-own carrier keys can be passed
 * as x-carrier-* headers, same as the REST routes.
 */
async function handle(request: Request): Promise<Response> {
  const auth = authorizeAgent(request);
  if (!auth.ok) return auth.response;

  const transport = new WebStandardStreamableHTTPServerTransport({
    sessionIdGenerator: undefined,
    enableJsonResponse: true,
  });
  const server = createVanityMcpServer(carrierOverride(request));
  await server.connect(transport);
  return transport.handleRequest(request);
}

export const POST = handle;
export const GET = handle;
export const DELETE = handle;
