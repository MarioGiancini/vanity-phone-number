import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Privacy — Vanity Phone Number Studio",
  description:
    "How Vanity Phone Number Studio handles data: local-first, anonymous analytics with an opt-out, and bring-your-own carrier keys.",
};

export default function PrivacyPage() {
  return (
    <main className="mx-auto flex w-full max-w-3xl flex-col gap-5 px-5 py-12 sm:px-8">
      <header className="space-y-2">
        <p className="text-[11px] uppercase tracking-[0.2em] text-ink-faint">Vanity Phone Number Studio</p>
        <h1 className="text-3xl font-semibold tracking-tight text-ink">Privacy</h1>
      </header>

      <section className="space-y-2 text-sm leading-relaxed text-ink-muted">
        <h2 className="text-lg font-semibold text-ink">Local-first by default</h2>
        <p>
          Favorites, recents, custom word lists, and preferences live in your browser&apos;s
          <span className="font-mono text-ink"> localStorage</span>. The server has no account system
          and does not store your library.
        </p>
      </section>

      <section className="space-y-2 text-sm leading-relaxed text-ink-muted">
        <h2 className="text-lg font-semibold text-ink">Anonymous analytics</h2>
        <p>
          We use cookieless, aggregate analytics (Vercel Web Analytics) to understand usage. It does
          not use cookies or track you across sites, and it honors Do Not Track. You can turn it off
          any time with the <span className="text-ink">Anonymous analytics</span> toggle in the footer;
          the choice is stored locally.
        </p>
      </section>

      <section className="space-y-2 text-sm leading-relaxed text-ink-muted">
        <h2 className="text-lg font-semibold text-ink">Carrier keys (bring your own)</h2>
        <p>
          If you paste your own Twilio/Telnyx keys in the <span className="text-ink">Carrier keys</span>{" "}
          dialog, they are stored only in your browser and sent to this app&apos;s own routes per
          request so the server can use them transiently. The server never stores or logs them. Prefer
          scoped, rotatable keys.
        </p>
      </section>

      <section className="space-y-2 text-sm leading-relaxed text-ink-muted">
        <h2 className="text-lg font-semibold text-ink">Contact</h2>
        <p>
          Questions:{" "}
          <a className="text-accent underline-offset-4 hover:underline" href="mailto:mario@giancini.com">
            mario@giancini.com
          </a>
          .
        </p>
      </section>

      <nav className="flex flex-wrap gap-x-4 gap-y-2 text-sm" aria-label="Resources">
        <Link className="text-accent underline-offset-4 hover:underline" href="/">The studio</Link>
        <Link className="text-accent underline-offset-4 hover:underline" href="/about">About</Link>
        <Link className="text-accent underline-offset-4 hover:underline" href="/docs">API docs</Link>
      </nav>
    </main>
  );
}
