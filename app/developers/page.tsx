import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Developers — Vanity Phone Number Studio",
  description:
    "Developer resources for the Vanity Phone Number Studio: REST API, OpenAPI, MCP server, and agent guide.",
};

const RESOURCES = [
  ["/docs", "API docs", "Human-readable guide to every endpoint."],
  ["/agents.md", "Agent guide", "When to use it, which tool to call, and tips."],
  ["/openapi.json", "OpenAPI 3.1", "Machine-readable description with typed error schema."],
  ["/auth.md", "Authentication", "How agents authenticate (bearer key)."],
  ["/api/agent", "Capability document", "Endpoints, themes, and examples (no auth)."],
  ["/api/mcp", "Remote MCP server", "Streamable HTTP MCP — connect with a URL, no install."],
  ["/.well-known/api-catalog", "API catalog", "RFC 9727 linkset."],
  ["/.well-known/mcp.json", "MCP manifest", "Server card with tools and transport."],
] as const;

export default function DevelopersPage() {
  return (
    <main className="mx-auto flex w-full max-w-3xl flex-col gap-6 px-5 py-12 sm:px-8">
      <header className="space-y-2">
        <p className="text-[11px] uppercase tracking-[0.2em] text-ink-faint">Vanity Phone Number Studio</p>
        <h1 className="text-3xl font-semibold tracking-tight text-ink">Developers</h1>
        <p className="text-sm text-ink-muted">
          Build on the agent API. Everything is open source (MIT).
        </p>
      </header>

      <ul className="grid gap-3 sm:grid-cols-2">
        {RESOURCES.map(([href, title, blurb]) => (
          <li key={href} className="panel p-4">
            <Link className="text-sm font-medium text-accent underline-offset-4 hover:underline" href={href}>
              {title}
            </Link>
            <p className="mt-1 text-xs text-ink-muted">{blurb}</p>
          </li>
        ))}
      </ul>

      <section className="space-y-2">
        <h2 className="text-lg font-semibold text-ink">Quickstart</h2>
        <pre className="scroll-area overflow-x-auto rounded-xl border border-border bg-surface-2 p-4 text-xs leading-relaxed text-ink">
          <code className="font-mono">{`curl -s -X POST https://vanity-phone-number.vercel.app/api/agent/find \\
  -H "Authorization: Bearer $VANITY_AGENT_API_KEY" \\
  -H "Content-Type: application/json" \\
  -d '{"prompt":"cool vanity number in Las Vegas for a tech business that is available","onlyAvailable":true}'`}</code>
        </pre>
      </section>

      <nav className="flex flex-wrap gap-x-4 gap-y-2 text-sm" aria-label="Resources">
        <Link className="text-accent underline-offset-4 hover:underline" href="/">The studio</Link>
        <Link className="text-accent underline-offset-4 hover:underline" href="/about">About</Link>
        <Link className="text-accent underline-offset-4 hover:underline" href="/docs">API docs</Link>
      </nav>
    </main>
  );
}
