import { siteUrl } from "@/lib/site";
import { REPO_URL } from "@/lib/seo";

export const dynamic = "force-static";

/** RFC 9116 security.txt. */
export function GET() {
  const base = siteUrl();
  const body = `Contact: mailto:mario@giancini.com
Expires: 2027-09-13T00:00:00.000Z
Canonical: ${base}/.well-known/security.txt
Policy: ${REPO_URL}/blob/main/SECURITY.md
Preferred-Languages: en
`;
  return new Response(body, {
    headers: { "Content-Type": "text/plain; charset=utf-8" },
  });
}
