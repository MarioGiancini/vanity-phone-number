import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Terms — Vanity Phone Number Studio",
  description: "Terms of use for Vanity Phone Number Studio. MIT-licensed open-source software.",
};

export default function TermsPage() {
  return (
    <main className="mx-auto flex w-full max-w-3xl flex-col gap-5 px-5 py-12 sm:px-8">
      <header className="space-y-2">
        <p className="text-[11px] uppercase tracking-[0.2em] text-ink-faint">Vanity Phone Number Studio</p>
        <h1 className="text-3xl font-semibold tracking-tight text-ink">Terms</h1>
      </header>
      <section className="space-y-2 text-sm leading-relaxed text-ink-muted">
        <p>
          This software is provided open source under the MIT License, &ldquo;as is&rdquo;, without
          warranty of any kind. There is no guarantee that a number reported as available can be
          purchased, ported, or retained; availability reflects a carrier&apos;s inventory at query
          time only.
        </p>
        <p>
          Use it for lawful purposes. You are responsible for complying with carrier terms and
          applicable telecommunications regulations (for example, SMS/A2P registration) when you
          acquire or message from a number.
        </p>
        <p>
          Source and full license:{" "}
          <a
            className="text-accent underline-offset-4 hover:underline"
            href="https://github.com/MarioGiancini/vanity-phone-number"
          >
            github.com/MarioGiancini/vanity-phone-number
          </a>
          .
        </p>
      </section>
      <nav className="flex flex-wrap gap-x-4 gap-y-2 text-sm" aria-label="Resources">
        <Link className="text-accent underline-offset-4 hover:underline" href="/">The studio</Link>
        <Link className="text-accent underline-offset-4 hover:underline" href="/about">About</Link>
        <Link className="text-accent underline-offset-4 hover:underline" href="/privacy">Privacy</Link>
        <Link className="text-accent underline-offset-4 hover:underline" href="/docs">API docs</Link>
      </nav>
    </main>
  );
}
