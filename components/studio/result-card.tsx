"use client";

import { useMemo } from "react";
import { Star } from "lucide-react";
import {
  buildVanity,
  lettersToDigits,
  makeSavedNumber,
  slotsFromText,
} from "@/lib/vanity";
import { cn } from "@/lib/utils";
import { AvailabilityButton } from "./availability-button";
import { CopyButton } from "./copy-button";
import { ScoreRing } from "./score-ring";
import { useStudio } from "./studio-context";

export interface ResultCardProps {
  areaCode: string;
  local: string;
  words?: readonly string[];
  score?: number;
  label?: string;
  blurb?: string;
  tag?: string;
  className?: string;
}

export function ResultCard({
  areaCode,
  local,
  words,
  score,
  label,
  blurb,
  tag,
  className,
}: ResultCardProps) {
  const { setAreaCode, setEntry, toggleFavorite, isFavorite, recordRecent } = useStudio();

  const built = useMemo(
    () => buildVanity(areaCode, slotsFromText(local, 7), words?.map((word) => word.length)),
    [areaCode, local, words],
  );

  const saved = useMemo(
    () => makeSavedNumber({ areaCode, local, words, label }),
    [areaCode, local, words, label],
  );
  const favorited = isFavorite(saved.id);

  const loadIntoDialer = () => {
    setAreaCode(areaCode);
    setEntry(words && words.length > 0 ? words.join(" ") : local);
  };

  return (
    <article
      className={cn(
        "panel group flex items-center gap-3 p-3.5 transition hover:border-border-strong",
        className,
      )}
    >
      <button
        type="button"
        onClick={loadIntoDialer}
        className="min-w-0 flex-1 text-left"
        title="Load into the dialer"
      >
        <div className="flex items-center gap-2">
          <span className="truncate font-mono text-lg font-semibold tracking-tight text-ink">
            {built.formattedVanity}
          </span>
          {tag ? (
            <span className="chip px-2 py-0.5 text-[10px] uppercase tracking-wide">{tag}</span>
          ) : null}
        </div>
        <div className="font-mono text-sm text-ink-muted">{built.formattedNumeric || "\u2014"}</div>
        {blurb ? <p className="mt-1 text-xs text-ink-muted">{blurb}</p> : null}
        {words && words.length > 1 ? (
          <div className="mt-1.5 flex flex-wrap gap-1">
            {words.map((word) => (
              <span key={word} className="chip px-2 py-0.5 font-mono text-[11px]">
                {word} <span className="text-ink-faint">{lettersToDigits(word)}</span>
              </span>
            ))}
          </div>
        ) : null}
      </button>

      {typeof score === "number" ? <ScoreRing score={score} /> : null}

      <div className="flex shrink-0 items-center gap-1.5">
        {built.dialable ? <AvailabilityButton number={built.dialable} /> : null}
        <CopyButton
          value={built.formattedNumeric || built.dialable}
          label="Copy number"
          className="border-border"
        />
        <button
          type="button"
          onClick={(event) => {
            event.stopPropagation();
            toggleFavorite(saved);
            if (!favorited) recordRecent(saved);
          }}
          className={cn("btn shrink-0 px-2.5 py-2", favorited && "border-amber/50 text-amber")}
          aria-label={favorited ? "Remove from favorites" : "Save to favorites"}
          title={favorited ? "Remove from favorites" : "Save to favorites"}
        >
          <Star className={cn("size-4", favorited && "fill-amber")} />
        </button>
      </div>
    </article>
  );
}
