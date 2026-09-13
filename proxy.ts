import { NextResponse, type NextRequest } from "next/server";

/** Paths that can be served as Markdown when the client asks for it. */
const MARKDOWN_TARGETS: Record<string, string> = {
  "/": "/index.md",
  "/docs": "/docs.md",
};

/**
 * Content negotiation: return a compact Markdown representation when the client
 * sends `Accept: text/markdown`, so agents don't have to execute JavaScript or
 * parse HTML.
 */
export function proxy(request: NextRequest) {
  const accept = request.headers.get("accept") ?? "";

  if ((request.method === "GET" || request.method === "HEAD") && accept.includes("text/markdown")) {
    const target = MARKDOWN_TARGETS[request.nextUrl.pathname];
    if (target) {
      const url = request.nextUrl.clone();
      url.pathname = target;
      const response = NextResponse.rewrite(url);
      response.headers.set("Vary", "Accept");
      return response;
    }
  }

  const response = NextResponse.next();
  response.headers.set("Vary", "Accept");
  return response;
}

export const config = { matcher: ["/", "/docs"] };
