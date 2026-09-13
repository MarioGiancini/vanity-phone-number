"use client";

import { useMemo } from "react";
import { Sparkles } from "lucide-react";
import { decodeLocal, normalize } from "@/lib/vanity";
import { isQualityReading } from "@/lib/word-quality";
import { ResultCard } from "../result-card";
import { useStudio } from "../studio-context";

const EXAMPLES = ["PROGRAM", "BIG CODE", "HOT WIRE", "mkdir", "DEV PROS"];

export function SpellPanel() {
  const { entry, setEntry, built, dictionaryIndex, curatedWords } = useStudio();

  const readings = useMemo(() => {
    if (!built.complete) return [];
    const currentWords = entry
      .split(/[\s-]+/)
      .map((token) => normalize(token))
      .filter(Boolean)
      .join(" ");
    const matches = decodeLocal(built.localDigits, dictionaryIndex, {
      areaCode: built.areaCode,
      limit: 500,
    });
    return matches
      .filter(
        (match) =>
          match.words.join(" ") !== currentWords && isQualityReading(match.words, curatedWords),
      )
      .slice(0, 6);
  }, [built, dictionaryIndex, curatedWords, entry]);

  const used = built.localDigits.length;
  const overflow = entry.replace(/[^A-Z0-9]/g, "").length > 7;

  return (
    <div className="space-y-5">
      <div className="panel p-4">
        <label className="text-[11px] uppercase tracking-[0.18em] text-ink-faint">
          Spell it out
        </label>
        <div className="mt-2.5 flex items-center gap-3">
          <Sparkles className="size-5 shrink-0 text-accent" />
          <input
            value={entry}
            onChange={(event) => setEntry(event.target.value)}
            placeholder={"PROGRAM, BIG CODE, mkdir\u2026"}
            aria-label="Spell a vanity number"
            className="min-w-0 flex-1 bg-transparent font-mono text-2xl font-semibold tracking-tight text-ink outline-none placeholder:text-ink-faint/60"
          />
        </div>
        <p className="mt-2 text-xs text-ink-muted">
          Letters map to digits; spaces and dashes mark word breaks. The dialer updates live.
        </p>
        {overflow ? (
          <p className="mt-1.5 text-xs text-amber">Only the first 7 letters are used.</p>
        ) : null}
      </div>

      {entry ? (
        <ResultCard
          areaCode={built.areaCode}
          local={built.local.join("")}
          words={entry.trim() ? entry.trim().split(/\s+/) : undefined}
        />
      ) : (
        <div className="flex flex-wrap gap-2">
          {EXAMPLES.map((example) => (
            <button
              key={example}
              type="button"
              onClick={() => setEntry(example)}
              className="chip chip-interactive font-mono"
            >
              {example}
            </button>
          ))}
        </div>
      )}

      {!built.complete && entry ? (
        <p className="text-xs text-ink-muted">
          {7 - used} letter{7 - used === 1 ? "" : "s"} to go.
        </p>
      ) : null}

      {readings.length > 0 ? (
        <section>
          <h3 className="mb-2 text-[11px] uppercase tracking-[0.18em] text-ink-faint">
            This number also reads as
          </h3>
          <div className="space-y-2">
            {readings.map((reading) => (
              <ResultCard
                key={reading.local}
                areaCode={reading.areaCode}
                local={reading.local}
                words={reading.words}
                score={reading.score}
              />
            ))}
          </div>
        </section>
      ) : null}
    </div>
  );
}
