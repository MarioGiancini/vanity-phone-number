import { siteUrl } from "@/lib/site";

export const dynamic = "force-static";

/** RFC 9727 API catalog (linkset) pointing at the OpenAPI description and docs. */
export function GET() {
  const base = siteUrl();
  const document = {
    linkset: [
      {
        anchor: `${base}/api/agent`,
        "service-desc": [{ href: `${base}/openapi.json`, type: "application/openapi+json" }],
        "service-doc": [{ href: `${base}/docs`, type: "text/html" }],
        "service-meta": [{ href: `${base}/llms.txt`, type: "text/plain" }],
      },
      {
        anchor: `${base}/api/availability`,
        "service-desc": [{ href: `${base}/openapi.json`, type: "application/openapi+json" }],
      },
    ],
  };

  return Response.json(document, {
    headers: { "Content-Type": "application/linkset+json; charset=utf-8" },
  });
}
