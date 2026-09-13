import { NextResponse } from "next/server";
import { siteUrl } from "@/lib/site";

export const dynamic = "force-static";

/** API index so `/api` is a reachable, self-describing endpoint. */
export function GET() {
  const base = siteUrl();
  return NextResponse.json({
    name: "Vanity Phone Number Studio API",
    version: "0.1.0",
    description:
      "Find, decode, and verify vanity phone numbers. Authenticated endpoints require a bearer key.",
    docs: `${base}/docs`,
    openapi: `${base}/openapi.json`,
    auth: `${base}/auth.md`,
    capability: `${base}/api/agent`,
    mcp: `${base}/api/mcp`,
    apiCatalog: `${base}/.well-known/api-catalog`,
    endpoints: {
      "GET /api/agent": "Capability document (no auth)",
      "POST /api/agent/find": "Find ranked vanity numbers from a brief or words",
      "POST /api/agent/discover": "Scan an area code for available word-spelling numbers",
      "POST /api/agent/decode": "Decode a number into dictionary readings",
      "POST /api/agent/verify": "Batch-verify words (Twilio Contains)",
      "POST /api/availability": "Single-number availability check (rate-limited)",
    },
  });
}
