import Link from "next/link";
import { JsonLd } from "@/components/seo/json-ld";
import { AppShell } from "@/components/studio/app-shell";
import { StudioProvider } from "@/components/studio/studio-context";
import { organizationJsonLd, softwareApplicationJsonLd, websiteJsonLd } from "@/lib/seo";

export default function Home() {
  return (
    <>
      <JsonLd data={[organizationJsonLd(), softwareApplicationJsonLd(), websiteJsonLd()]} />
      <StudioProvider>
        <AppShell />
      </StudioProvider>

      <section className="mx-auto w-full max-w-[1400px] space-y-4 px-4 pb-16 sm:px-6 lg:px-8">
        <h2 className="text-xl font-semibold tracking-tight text-ink">
          Vanity phone numbers for humans and AI agents
        </h2>
        <p className="max-w-3xl text-sm leading-relaxed text-ink-muted">
          Vanity Phone Number Studio turns words, word combos, and dev terms into memorable phone
          numbers (for example <span className="font-mono text-ink">702-PROGRAM</span> ={" "}
          <span className="font-mono text-ink">702-776-4726</span>), decodes numbers back into words,
          generates combos from themed word packs, and verifies availability against Twilio and
          Telnyx inventory. It is open source (MIT) and agent-native: an authenticated REST API and an
          MCP server let an agent find a good number from a brief, and a human can use the studio
          above.
        </p>
        <ul className="grid max-w-3xl gap-2 text-sm text-ink-muted sm:grid-cols-2">
          <li>
            <strong className="text-ink">Spell</strong> — words to numbers, with alternate readings.
          </li>
          <li>
            <strong className="text-ink">Combos</strong> — 3+4 word combinations from theme packs.
          </li>
          <li>
            <strong className="text-ink">Decode</strong> — a number back into dictionary words.
          </li>
          <li>
            <strong className="text-ink">Discover</strong> — scan an area code for available
            word-spelling numbers.
          </li>
        </ul>
        <nav className="flex flex-wrap gap-x-4 gap-y-2 text-sm" aria-label="Resources">
          <Link className="text-accent underline-offset-4 hover:underline" href="/docs">
            API docs
          </Link>
          <Link className="text-accent underline-offset-4 hover:underline" href="/openapi.json">
            OpenAPI
          </Link>
          <Link className="text-accent underline-offset-4 hover:underline" href="/llms.txt">
            llms.txt
          </Link>
          <Link className="text-accent underline-offset-4 hover:underline" href="/agents.md">
            Agent guide
          </Link>
          <Link className="text-accent underline-offset-4 hover:underline" href="/about">
            About
          </Link>
          <Link className="text-accent underline-offset-4 hover:underline" href="/privacy">
            Privacy
          </Link>
        </nav>
      </section>
    </>
  );
}
