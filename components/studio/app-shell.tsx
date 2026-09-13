"use client";

import { useState } from "react";
import Link from "next/link";
import { KeyRound } from "lucide-react";
import { REPO_URL } from "@/lib/seo";
import { AreaCodePicker } from "./area-code-picker";
import { CarrierKeysDialog } from "./carrier-keys-dialog";
import { Phone } from "./phone";
import { StudioAnalytics } from "./studio-analytics";
import { useStudio } from "./studio-context";
import { Workspace } from "./workspace";

export function AppShell() {
  const { preferences, setAnalyticsEnabled } = useStudio();
  const [keysOpen, setKeysOpen] = useState(false);

  return (
    <div className="mx-auto flex min-h-dvh w-full max-w-[1400px] flex-col gap-6 px-4 py-6 sm:px-6 lg:px-8">
      <header className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-3">
          <div className="grid size-11 place-items-center rounded-2xl border border-border bg-surface-2 shadow-lg">
            <span className="font-mono text-lg font-bold text-accent">#</span>
          </div>
          <div>
            <h1 className="text-lg font-semibold tracking-tight text-ink">
              Vanity Phone Number Studio
            </h1>
            <p className="text-xs text-ink-muted">
              Spell, test, and generate memorable numbers.
            </p>
          </div>
        </div>
        <div className="sm:w-80">
          <AreaCodePicker />
        </div>
      </header>

      <main className="grid flex-1 gap-6 lg:grid-cols-[minmax(320px,380px)_minmax(0,1fr)]">
        <div className="lg:sticky lg:top-6 lg:self-start">
          <Phone />
        </div>
        <Workspace />
      </main>

      <footer className="flex flex-col gap-2 border-t border-border pt-4 text-xs text-ink-faint">
        <p>
          Numbers are generated locally. Availability checks use Twilio when configured and reflect
          Twilio&apos;s inventory, not the whole carrier market.
        </p>
        <div className="flex flex-wrap items-center justify-between gap-2">
          <p>
            Favorites, recents, and custom word lists are stored in this browser (localStorage). The{" "}
            <Link href="/docs" className="text-ink-muted underline-offset-4 hover:underline">
              agent API
            </Link>{" "}
            lives at <span className="font-mono text-ink-muted">/api/agent</span>.
          </p>
          <button
            type="button"
            onClick={() => setAnalyticsEnabled(!preferences.analytics)}
            className="chip chip-interactive shrink-0"
            title="Toggle anonymous, cookieless analytics"
          >
            Anonymous analytics: {preferences.analytics ? "on" : "off"}
          </button>
          <button
            type="button"
            onClick={() => setKeysOpen(true)}
            className="chip chip-interactive shrink-0"
            title="Use your own Twilio/Telnyx keys in this browser"
          >
            <KeyRound className="size-3.5" />
            Carrier keys
          </button>
        </div>
        <nav className="flex flex-wrap gap-x-4 gap-y-1" aria-label="Site">
          <Link href="/about" className="hover:text-ink">
            About
          </Link>
          <Link href="/privacy" className="hover:text-ink">
            Privacy
          </Link>
          <Link href="/terms" className="hover:text-ink">
            Terms
          </Link>
          <Link href="/docs" className="hover:text-ink">
            API docs
          </Link>
          <Link href="/developers" className="hover:text-ink">
            Developers
          </Link>
          <Link href="/agents.md" className="hover:text-ink">
            Agent guide
          </Link>
          <a href={REPO_URL} className="hover:text-ink">
            GitHub
          </a>
        </nav>
      </footer>

      <StudioAnalytics />
      <CarrierKeysDialog
        key={keysOpen ? "open" : "closed"}
        open={keysOpen}
        onClose={() => setKeysOpen(false)}
      />
    </div>
  );
}
