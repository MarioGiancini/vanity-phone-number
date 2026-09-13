import { siteUrl } from "@/lib/site";

export const dynamic = "force-static";

/**
 * Full-control robots.txt so we can express AI-bot rules and a Content Signals
 * policy. https://contentsignals.org
 */
export function GET() {
  const base = siteUrl();
  const body = `# Vanity Phone Number Studio
User-Agent: *
Allow: /

# AI crawlers and agents are welcome.
User-Agent: GPTBot
Allow: /
User-Agent: ChatGPT-User
Allow: /
User-Agent: OAI-SearchBot
Allow: /
User-Agent: ClaudeBot
Allow: /
User-Agent: Claude-Web
Allow: /
User-Agent: anthropic-ai
Allow: /
User-Agent: PerplexityBot
Allow: /
User-Agent: Google-Extended
Allow: /
User-Agent: Applebot-Extended
Allow: /
User-Agent: CCBot
Allow: /

# Content Signals Policy: search, ai-input, and ai-train are allowed.
Content-Signal: search=yes, ai-input=yes, ai-train=yes

Sitemap: ${base}/sitemap.xml
`;
  return new Response(body, {
    headers: { "Content-Type": "text/plain; charset=utf-8" },
  });
}
