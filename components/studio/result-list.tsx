"use client";

import { useMemo, useState } from "react";
import { Search } from "lucide-react";
import { ResultCard } from "./result-card";

export interface Candidate {
  areaCode: string;
  local: string;
  words?: string[];
  score?: number;
  label?: string;
  blurb?: string;
  tag?: string;
}

export function ResultList({
  candidates,
  initial = 24,
  searchable = true,
  emptyLabel = "Nothing yet.",
}: {
  candidates: Candidate[];
  initial?: number;
  searchable?: boolean;
  emptyLabel?: string;
}) {
  const [query, setQuery] = useState("");
  const [visible, setVisible] = useState(initial);

  const filtered = useMemo(() => {
    const needle = query.trim().toUpperCase().replace(/[^A-Z0-9]/g, "");
    if (!needle) return candidates;
    return candidates.filter((candidate) =>
      `${candidate.areaCode}${candidate.local}`.toUpperCase().includes(needle),
    );
  }, [candidates, query]);

  return (
    <div className="space-y-2.5">
      {searchable && candidates.length > initial ? (
        <div className="flex items-center gap-2 rounded-xl border border-border bg-surface-2/70 px-3 py-2">
          <Search className="size-4 text-ink-faint" />
          <input
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Filter results"
            aria-label="Filter results"
            className="min-w-0 flex-1 bg-transparent text-sm text-ink outline-none placeholder:text-ink-faint"
          />
          <span className="shrink-0 font-mono text-xs text-ink-faint">{filtered.length}</span>
        </div>
      ) : null}

      {filtered.slice(0, visible).map((candidate, index) => (
        <ResultCard key={`${candidate.areaCode}-${candidate.local}-${index}`} {...candidate} />
      ))}

      {filtered.length === 0 ? (
        <p className="panel p-6 text-center text-sm text-ink-muted">{emptyLabel}</p>
      ) : null}

      {filtered.length > visible ? (
        <button
          type="button"
          onClick={() => setVisible((current) => current + initial)}
          className="btn w-full"
        >
          Show {Math.min(initial, filtered.length - visible)} more of {filtered.length}
        </button>
      ) : null}
    </div>
  );
}
