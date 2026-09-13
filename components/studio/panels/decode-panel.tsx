"use client";

import { useMemo, useState } from "react";
import { Hash } from "lucide-react";
import { decodeLocal } from "@/lib/vanity";
import { ResultList } from "../result-list";
import { useStudio } from "../studio-context";
import { Select } from "@/components/ui/select";

export function DecodePanel() {
  const { areaCode, built, dictionaryIndex } = useStudio();
  const [digits, setDigits] = useState("");
  const [minPart, setMinPart] = useState(2);
  const [maxParts, setMaxParts] = useState(3);

  const cleaned = digits.replace(/[^0-9]/g, "");
  const local = cleaned.length > 7 ? cleaned.slice(-7) : cleaned;

  const matches = useMemo(() => {
    if (local.length !== 7) return [];
    return decodeLocal(local, dictionaryIndex, { areaCode, minPart, maxParts, limit: 500 });
  }, [local, dictionaryIndex, areaCode, minPart, maxParts]);

  return (
    <div className="space-y-4">
      <div className="panel space-y-3 p-4">
        <label className="text-[11px] uppercase tracking-[0.18em] text-ink-faint">
          Reverse lookup
        </label>
        <div className="flex items-center gap-3">
          <Hash className="size-5 shrink-0 text-accent" />
          <input
            value={digits}
            onChange={(event) => setDigits(event.target.value)}
            inputMode="numeric"
            placeholder="7764726 or 702-776-4726"
            aria-label="Number to decode"
            className="min-w-0 flex-1 bg-transparent font-mono text-2xl font-semibold tracking-tight text-ink outline-none placeholder:text-ink-faint/60"
          />
        </div>

        <div className="flex flex-wrap items-center gap-3 pt-1">
          <button
            type="button"
            onClick={() => setDigits(built.localDigits)}
            disabled={!built.complete}
            className="chip chip-interactive disabled:opacity-40"
          >
            Use current number
          </button>

          <div className="flex items-center gap-2 text-xs text-ink-muted">
            Shortest word
            <Select
              value={String(minPart)}
              onChange={(value) => setMinPart(Number(value))}
              options={[
                { value: "2", label: "2 letters" },
                { value: "3", label: "3 letters" },
                { value: "4", label: "4 letters" },
              ]}
              ariaLabel="Shortest word"
              className="w-28"
            />
          </div>

          <div className="flex items-center gap-2 text-xs text-ink-muted">
            Max words
            <Select
              value={String(maxParts)}
              onChange={(value) => setMaxParts(Number(value))}
              options={[
                { value: "2", label: "2" },
                { value: "3", label: "3" },
                { value: "4", label: "4" },
              ]}
              ariaLabel="Max words"
              className="w-20"
            />
          </div>
        </div>
      </div>

      {local.length > 0 && local.length < 7 ? (
        <p className="text-xs text-ink-muted">{7 - local.length} more digit(s) needed.</p>
      ) : null}

      <ResultList
        key={`${local}-${minPart}-${maxParts}`}
        candidates={matches}
        emptyLabel="No dictionary readings for this number. Try lowering the shortest word length."
      />
    </div>
  );
}
