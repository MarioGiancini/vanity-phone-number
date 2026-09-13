"use client";

import { localGroups } from "@/lib/vanity";
import { cn } from "@/lib/utils";
import { useStudio } from "./studio-context";

const BLANK = "\u2022";

/** Retro handset display: area code, spelled number, numeric readout. */
export function PhoneScreen() {
  const { built, grouping, areaCode } = useStudio();
  const groups = localGroups(built.local, grouping.length > 0 ? grouping : undefined);

  return (
    <div className="rounded-2xl border border-border bg-gradient-to-b from-surface-3/80 to-surface-2/50 p-4">
      <div className="flex items-center justify-between text-[10px] uppercase tracking-[0.22em] text-ink-faint">
        <span>{areaCode ? `+1 ${areaCode}` : "no area code"}</span>
        <span className={cn(built.complete ? "text-accent" : "text-ink-faint")}>
          {built.complete ? "ready" : "typing"}
        </span>
      </div>

      <div className="mt-3 flex min-h-12 flex-wrap items-baseline gap-x-1.5 font-mono text-3xl font-semibold tracking-tight">
        <span className="text-ink-muted">{areaCode || BLANK.repeat(3)}</span>
        {groups.map((group, index) => (
          <span key={index} className="flex items-baseline gap-x-1.5">
            <span className="text-ink-faint">-</span>
            <span className={cn(group.includes(BLANK) ? "text-ink-faint" : "text-accent")}>
              {group}
            </span>
          </span>
        ))}
      </div>

      <div className="mt-2 flex items-center justify-between font-mono text-sm">
        <span className="text-ink-muted">{built.formattedNumeric || "\u2014 \u2014 \u2014"}</span>
        <span className="text-ink-faint">{built.localDigits.length}/7</span>
      </div>

      {built.warnings.length > 0 ? (
        <p className="mt-2 text-xs text-amber">{built.warnings[0]}</p>
      ) : null}
    </div>
  );
}
