import Link from "next/link";

const RESOURCES = [
  ["/", "The studio"],
  ["/docs", "Agent API docs"],
  ["/agents.md", "Agent guide"],
  ["/llms.txt", "llms.txt"],
  ["/openapi.json", "OpenAPI 3.1"],
  ["/auth.md", "Authentication"],
  ["/api/agent", "Capability document"],
  ["/api/mcp", "Remote MCP server"],
] as const;

export default function NotFound() {
  return (
    <main className="mx-auto flex min-h-dvh w-full max-w-3xl flex-col justify-center gap-4 px-6 py-16">
      <p className="text-[11px] uppercase tracking-[0.2em] text-ink-faint">404</p>
      <h1 className="text-3xl font-semibold tracking-tight text-ink">Page not found</h1>
      <p className="max-w-prose text-sm text-ink-muted">
        That URL doesn&apos;t exist. Humans can head back to the studio or the docs. Agents should use
        the machine-readable entry points below.
      </p>
      <nav className="flex flex-wrap gap-x-4 gap-y-2 text-sm" aria-label="Resources">
        {RESOURCES.map(([href, label]) => (
          <Link key={href} href={href} className="text-accent underline-offset-4 hover:underline">
            {label}
          </Link>
        ))}
      </nav>
    </main>
  );
}
