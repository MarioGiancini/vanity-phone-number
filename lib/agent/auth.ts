import { timingSafeEqual } from "node:crypto";
import { NextResponse } from "next/server";

/** Server-only secret that gates /api/agent/*. */
export function agentKey(): string | undefined {
  return process.env.VANITY_AGENT_API_KEY || process.env.AGENT_API_KEY;
}

function safeEqual(a: string, b: string): boolean {
  const left = Buffer.from(a);
  const right = Buffer.from(b);
  if (left.length !== right.length) return false;
  return timingSafeEqual(left, right);
}

export type AgentAuthResult = { ok: true } | { ok: false; response: NextResponse };

/**
 * Requires `Authorization: Bearer <key>` or `x-api-key: <key>`.
 * If no key is configured on the server, the endpoint reports 503 rather than
 * silently allowing access.
 */
export function authorizeAgent(request: Request): AgentAuthResult {
  const key = agentKey();
  if (!key) {
    return {
      ok: false,
      response: NextResponse.json(
        { error: "Agent API is not configured. Set VANITY_AGENT_API_KEY on the server." },
        { status: 503 },
      ),
    };
  }

  const header = request.headers.get("authorization") ?? "";
  const bearer = header.toLowerCase().startsWith("bearer ") ? header.slice(7).trim() : "";
  const provided = bearer || request.headers.get("x-api-key") || "";

  if (!provided || !safeEqual(provided, key)) {
    return { ok: false, response: NextResponse.json({ error: "Unauthorized." }, { status: 401 }) };
  }
  return { ok: true };
}
