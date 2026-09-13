import type { Metadata } from "next";
import Link from "next/link";
import { JsonLd } from "@/components/seo/json-ld";
import { organizationJsonLd } from "@/lib/seo";

export const metadata: Metadata = {
  title: "About — Vanity Phone Number Studio",
  description:
    "What Vanity Phone Number Studio is, who built it, and how it is licensed. Open-source, agent-native vanity phone number tool.",
};

export default function AboutPage() {
  return (
    <main className="mx-auto flex w-full max-w-3xl flex-col gap-6 px-5 py-12 sm:px-8">
      <JsonLd data={organizationJsonLd()} />
      <header className="space-y-2">
        <p className="text-[11px] uppercase tracking-[0.2em] text-ink-faint">Vanity Phone Number Studio</p>
        <h1 className="text-3xl font-semibold tracking-tight text-ink">About</h1>
      </header>

      <p className="text-sm leading-relaxed text-ink-muted">
        Vanity Phone Number Studio turns words, word combos, and dev terms into memorable phone
        numbers, decodes numbers back into words, and verifies availability against Twilio and Telnyx
        inventory. It is open source and built to be used by both humans (a browser studio) and AI
        agents (a REST API and an MCP server).
      </p>
      <p className="text-sm leading-relaxed text-ink-muted">
        Built by <a className="text-accent underline-offset-4 hover:underline" href="https://github.com/MarioGiancini">Mario Giancini</a>.
        Licensed under MIT. Source on{" "}
        <a className="text-accent underline-offset-4 hover:underline" href="https://github.com/MarioGiancini/vanity-phone-number">
          GitHub
        </a>. Contact: <a className="text-accent underline-offset-4 hover:underline" href="mailto:mario@giancini.com">mario@giancini.com</a>.
      </p>

      <nav className="flex flex-wrap gap-x-4 gap-y-2 text-sm" aria-label="Resources">
        <Link className="text-accent underline-offset-4 hover:underline" href="/">The studio</Link>
        <Link className="text-accent underline-offset-4 hover:underline" href="/docs">API docs</Link>
        <Link className="text-accent underline-offset-4 hover:underline" href="/agents.md">Agent guide</Link>
        <Link className="text-accent underline-offset-4 hover:underline" href="/privacy">Privacy</Link>
      </nav>
    </main>
  );
}
