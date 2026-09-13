"use client";

import { LAS_VEGAS_PRESETS } from "@/data/presets";
import { ResultCard } from "../result-card";
import { useStudio } from "../studio-context";

export function PresetsPanel() {
  const { areaCode } = useStudio();

  return (
    <div className="space-y-4">
      <p className="text-sm text-ink-muted">
        Hand-picked tech numbers, rendered for area code{" "}
        <span className="font-mono text-ink">{areaCode}</span>. Tap a card to load it into the
        dialer, star it to save.
      </p>
      <div className="grid gap-2.5 lg:grid-cols-2">
        {LAS_VEGAS_PRESETS.map((preset) => (
          <ResultCard
            key={preset.id}
            areaCode={areaCode}
            local={preset.local}
            words={preset.words}
            tag={preset.tag}
            blurb={preset.blurb}
          />
        ))}
      </div>
    </div>
  );
}
