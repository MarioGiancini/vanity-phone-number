"use client";

import { useState } from "react";
import { Loader2, Radar } from "lucide-react";
import { discoverNumbers, type DiscoverResponse } from "@/lib/availability";
import { ResultCard } from "../result-card";
import { useStudio } from "../studio-context";

export function DiscoverPanel() {
  const { areaCode, showToast } = useStudio();
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState<DiscoverResponse | null>(null);
  const [error, setError] = useState<string | null>(null);

  const run = async () => {
    setLoading(true);
    setError(null);
    try {
      const result = await discoverNumbers(areaCode, 2);
      setData(result);
      if (!result.availabilityConfigured) {
        showToast("Availability checks aren't configured");
      } else if (result.matches === 0) {
        showToast("No word-spelling numbers in this sample");
      }
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-4">
      <div className="panel space-y-3 p-4">
        <h3 className="text-[11px] uppercase tracking-[0.18em] text-ink-faint">
          Discover available numbers
        </h3>
        <p className="text-sm text-ink-muted">
          Scan area code <span className="font-mono text-ink">{areaCode}</span> for numbers that are
          currently available <em>and</em> spell real words. This queries the carrier, so it can take
          a few seconds.
        </p>
        <button type="button" onClick={run} disabled={loading} className="btn btn-accent">
          {loading ? <Loader2 className="size-4 animate-spin" /> : <Radar className="size-4" />}
          {loading ? "Scanning\u2026" : `Scan ${areaCode}`}
        </button>
        {data ? (
          <p className="text-xs text-ink-faint">
            Scanned {data.scanned} available number{data.scanned === 1 ? "" : "s"} · {data.matches}{" "}
            match{data.matches === 1 ? "" : "es"}
          </p>
        ) : null}
      </div>

      {error ? (
        <p className="panel border-danger/40 p-4 text-sm text-danger">{error}</p>
      ) : null}

      {data && data.results.length > 0 ? (
        <div className="grid gap-2.5 lg:grid-cols-2">
          {data.results.map((result) => (
            <ResultCard
              key={result.number}
              areaCode={result.dialable.slice(0, 3)}
              local={result.words.join("")}
              words={result.words}
              score={result.score}
              tag="available"
              blurb={[result.locality, result.region].filter(Boolean).join(", ")}
            />
          ))}
        </div>
      ) : null}

      {data && data.availabilityConfigured && data.results.length === 0 ? (
        <p className="panel p-6 text-center text-sm text-ink-muted">
          No word-spelling numbers in this sample. Inventory changes — try again or scan another area
          code.
        </p>
      ) : null}

      {data && !data.availabilityConfigured ? (
        <p className="panel p-6 text-center text-sm text-ink-muted">
          Availability checking isn&apos;t configured. Set Twilio credentials to scan inventory.
        </p>
      ) : null}
    </div>
  );
}
