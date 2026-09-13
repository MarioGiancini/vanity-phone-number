"use client";

import { Trash2 } from "lucide-react";
import { ResultCard } from "../result-card";
import { useStudio } from "../studio-context";

export function SavedPanel() {
  const { favorites, recents, clearRecents } = useStudio();

  return (
    <div className="space-y-7">
      <section className="space-y-2.5">
        <h3 className="text-[11px] uppercase tracking-[0.18em] text-ink-faint">
          Favorites ({favorites.length})
        </h3>
        {favorites.length > 0 ? (
          <div className="grid gap-2.5 lg:grid-cols-2">
            {favorites.map((item) => (
              <ResultCard
                key={item.id}
                areaCode={item.areaCode}
                local={item.local}
                words={item.words}
                label={item.label}
              />
            ))}
          </div>
        ) : (
          <p className="panel p-6 text-center text-sm text-ink-muted">
            Star a number to keep it here.
          </p>
        )}
      </section>

      <section className="space-y-2.5">
        <div className="flex items-center justify-between">
          <h3 className="text-[11px] uppercase tracking-[0.18em] text-ink-faint">
            Recent ({recents.length})
          </h3>
          {recents.length > 0 ? (
            <button type="button" onClick={clearRecents} className="chip chip-interactive">
              <Trash2 className="size-3.5" />
              Clear
            </button>
          ) : null}
        </div>
        {recents.length > 0 ? (
          <div className="grid gap-2.5 lg:grid-cols-2">
            {recents.map((item) => (
              <ResultCard
                key={item.id}
                areaCode={item.areaCode}
                local={item.local}
                words={item.words}
              />
            ))}
          </div>
        ) : (
          <p className="panel p-6 text-center text-sm text-ink-muted">
            Numbers you save will show up here.
          </p>
        )}
      </section>
    </div>
  );
}
