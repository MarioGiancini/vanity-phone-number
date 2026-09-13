import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

/** JSON 404 for unknown API paths so agents never get an HTML error page. */
function notFound(request: Request) {
  const pathname = new URL(request.url).pathname;
  return NextResponse.json(
    {
      error: "Not found",
      message: `No API route for ${pathname}.`,
      capabilityDocument: "/api/agent",
      docs: "/docs",
      openapi: "/openapi.json",
    },
    { status: 404 },
  );
}

function methodNotAllowed() {
  return NextResponse.json(
    { error: "Method not allowed" },
    { status: 405, headers: { Allow: "GET, POST" } },
  );
}

export const GET = notFound;
export const POST = notFound;
export const PUT = methodNotAllowed;
export const PATCH = methodNotAllowed;
export const DELETE = methodNotAllowed;
