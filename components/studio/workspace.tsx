"use client";

import { useState } from "react";
import { cn } from "@/lib/utils";
import { CombosPanel } from "./panels/combos-panel";
import { DecodePanel } from "./panels/decode-panel";
import { ListsPanel } from "./panels/lists-panel";
import { PresetsPanel } from "./panels/presets-panel";
import { SavedPanel } from "./panels/saved-panel";
import { SpellPanel } from "./panels/spell-panel";
import { useStudio } from "./studio-context";

type TabId = "spell" | "combos" | "decode" | "presets" | "saved" | "lists";

const TABS: { id: TabId; label: string }[] = [
  { id: "spell", label: "Spell" },
  { id: "combos", label: "Combos" },
  { id: "decode", label: "Decode" },
  { id: "presets", label: "Presets" },
  { id: "saved", label: "Saved" },
  { id: "lists", label: "Lists" },
];

export function Workspace() {
  const { favorites } = useStudio();
  const [tab, setTab] = useState<TabId>("spell");

  return (
    <section className="flex min-h-0 flex-1 flex-col gap-4">
      <div className="flex flex-wrap gap-2" role="tablist" aria-label="Tools">
        {TABS.map(({ id, label }) => (
          <button
            key={id}
            type="button"
            role="tab"
            aria-selected={tab === id}
            onClick={() => setTab(id)}
            className={cn(
              "chip chip-interactive px-3.5 py-1.5",
              tab === id && "border-accent/60 bg-accent/10 text-accent",
            )}
          >
            {label}
            {id === "saved" && favorites.length > 0 ? (
              <span className="font-mono text-[10px] opacity-80">{favorites.length}</span>
            ) : null}
          </button>
        ))}
      </div>

      <div key={tab} className="min-h-0 animate-fade-up">
        {tab === "spell" ? <SpellPanel /> : null}
        {tab === "combos" ? <CombosPanel onManageLists={() => setTab("lists")} /> : null}
        {tab === "decode" ? <DecodePanel /> : null}
        {tab === "presets" ? <PresetsPanel /> : null}
        {tab === "saved" ? <SavedPanel /> : null}
        {tab === "lists" ? <ListsPanel /> : null}
      </div>
    </section>
  );
}
