import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Agent API — Vanity Phone Number Studio",
  description:
    "REST and MCP documentation for the Vanity Phone Number Studio agent API: find, decode, and verify vanity phone numbers.",
};

function Code({ children }: { children: string }) {
  return (
    <pre className="scroll-area overflow-x-auto rounded-xl border border-border bg-surface-2 p-4 text-xs leading-relaxed text-ink">
      <code className="font-mono">{children}</code>
    </pre>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="space-y-3">
      <h2 className="text-lg font-semibold tracking-tight text-ink">{title}</h2>
      <div className="space-y-3 text-sm leading-relaxed text-ink-muted">{children}</div>
    </section>
  );
}

export default function DocsPage() {
  return (
    <main className="mx-auto flex w-full max-w-3xl flex-col gap-8 px-5 py-12 sm:px-8">
      <header className="space-y-2">
        <p className="text-[11px] uppercase tracking-[0.2em] text-ink-faint">Vanity Phone Number Studio</p>
        <h1 className="text-3xl font-semibold tracking-tight text-ink">Agent API</h1>
        <p className="text-sm text-ink-muted">
          Turn a brief into ranked vanity phone numbers, decode numbers into words, and verify
          availability. Open source under MIT.{" "}
          <Link className="text-accent underline-offset-4 hover:underline" href="/">
            Open the studio →
          </Link>
        </p>
      </header>

      <Section title="Authentication">
        <p>
          The <code className="font-mono text-ink">/api/agent/*</code> routes require a bearer key:
          send <code className="font-mono text-ink">Authorization: Bearer $VANITY_AGENT_API_KEY</code>{" "}
          or <code className="font-mono text-ink">x-api-key</code>. Generate one with{" "}
          <code className="font-mono text-ink">openssl rand -hex 32</code>. If the server has no key
          configured, these routes return <code className="font-mono text-ink">503</code>. See{" "}
          <Link className="text-accent underline-offset-4 hover:underline" href="/auth.md">
            auth.md
          </Link>
          .
        </p>
      </Section>

      <Section title="Find vanity numbers">
        <p>
          <code className="font-mono text-ink">POST /api/agent/find</code> resolves a natural-language
          brief (city → area code, keywords → word pack), generates candidates, and — when the prompt
          asks for an available number, or <code className="font-mono text-ink">onlyAvailable</code> is
          set — verifies the top candidates against Twilio&apos;s inventory.
        </p>
        <Code>{`curl -s -X POST http://localhost:3000/api/agent/find \\
  -H "Authorization: Bearer $VANITY_AGENT_API_KEY" \\
  -H "Content-Type: application/json" \\
  -d '{
    "prompt": "cool vanity number in Las Vegas for a tech business that is available",
    "onlyAvailable": true,
    "limit": 5
  }'`}</Code>
      </Section>

      <Section title="Decode a number">
        <Code>{`curl -s -X POST http://localhost:3000/api/agent/decode \\
  -H "Authorization: Bearer $VANITY_AGENT_API_KEY" \\
  -H "Content-Type: application/json" \\
  -d '{"number": "702-776-4726"}'`}</Code>
      </Section>

      <Section title="Check availability">
        <p>
          <code className="font-mono text-ink">POST /api/availability</code> accepts{" "}
          <code className="font-mono text-ink">{`{ "number": "702-776-4726" }`}</code>. It is
          rate-limited and makes zero network calls when Twilio isn&apos;t configured.
        </p>
        <p>
          <code className="font-mono text-ink">POST /api/agent/verify</code> batch-verifies words with
          Twilio&apos;s <code className="font-mono text-ink">Contains</code> pattern — one call per
          word confirms every number that spells it.
        </p>
        <Code>{`curl -s -X POST http://localhost:3000/api/agent/verify \\
  -H "Authorization: Bearer $VANITY_AGENT_API_KEY" \\
  -H "Content-Type: application/json" \\
  -d '{"areaCode": "702", "words": ["BIGCODE", "PROGRAM"]}'`}</Code>
      </Section>

      <Section title="MCP">
        <p>
          The repo ships a stdio MCP server with tools{" "}
          <code className="font-mono text-ink">find_vanity_numbers</code>,{" "}
          <code className="font-mono text-ink">decode_number</code>, and{" "}
          <code className="font-mono text-ink">check_availability</code>.
        </p>
        <Code>{`{
  "mcpServers": {
    "vanity": {
      "command": "node",
      "args": ["scripts/mcp-server.mjs"],
      "env": { "VANITY_AGENT_API_KEY": "…" }
    }
  }
}`}</Code>
      </Section>

      <Section title="Machine-readable">
        <ul className="list-inside list-disc space-y-1">
          <li>
            <Link className="text-accent underline-offset-4 hover:underline" href="/openapi.json">
              /openapi.json
            </Link>{" "}
            — OpenAPI 3.1
          </li>
          <li>
            <Link className="text-accent underline-offset-4 hover:underline" href="/.well-known/api-catalog">
              /.well-known/api-catalog
            </Link>{" "}
            — RFC 9727
          </li>
          <li>
            <Link className="text-accent underline-offset-4 hover:underline" href="/.well-known/mcp/server-card">
              /.well-known/mcp/server-card
            </Link>{" "}
            — MCP server card
          </li>
          <li>
            <Link className="text-accent underline-offset-4 hover:underline" href="/.well-known/agent.json">
              /.well-known/agent.json
            </Link>{" "}
            — A2A agent card
          </li>
          <li>
            <Link className="text-accent underline-offset-4 hover:underline" href="/llms.txt">
              /llms.txt
            </Link>
          </li>
        </ul>
      </Section>
    </main>
  );
}
