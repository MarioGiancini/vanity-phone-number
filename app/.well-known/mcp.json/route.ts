import { buildServerCard } from "@/lib/mcp/server-card";

export const dynamic = "force-static";

/** Alias manifest at the conventional /.well-known/mcp.json path. */
export function GET() {
  return Response.json(buildServerCard(), {
    headers: { "Content-Type": "application/json; charset=utf-8" },
  });
}
