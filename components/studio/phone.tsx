"use client";

import { Delete, Star, X } from "lucide-react";
import { makeSavedNumber } from "@/lib/vanity";
import { cn } from "@/lib/utils";
import { AvailabilityButton } from "./availability-button";
import { CopyButton } from "./copy-button";
import { DialPad } from "./dial-pad";
import { PhoneScreen } from "./phone-screen";
import { useStudio } from "./studio-context";

export function Phone() {
  const { entry, backspace, clearEntry, built, toggleFavorite, isFavorite } = useStudio();

  const saved = makeSavedNumber({
    areaCode: built.areaCode,
    local: built.local.join(""),
    words: entry.trim() ? entry.trim().split(/\s+/) : undefined,
  });
  const favorited = built.complete && isFavorite(saved.id);

  return (
    <section className="panel flex flex-col gap-3 p-4">
      <PhoneScreen />

      <DialPad />

      <div className="grid grid-cols-3 gap-2.5">
        <button
          type="button"
          onClick={backspace}
          disabled={entry.length === 0}
          className="btn"
          title="Backspace"
        >
          <Delete className="size-4" />
          Back
        </button>
        <button
          type="button"
          onClick={clearEntry}
          disabled={entry.length === 0}
          className="btn"
          title="Clear"
        >
          <X className="size-4" />
          Clear
        </button>
        <CopyButton
          value={built.formattedNumeric || built.dialable}
          className="btn-accent"
          label="Copy number"
        >
          Copy
        </CopyButton>
      </div>

      <button
        type="button"
        onClick={() => toggleFavorite(saved)}
        disabled={!built.complete}
        className={cn("btn w-full", favorited && "border-amber/50 text-amber")}
      >
        <Star className={cn("size-4", favorited && "fill-amber")} />
        {favorited ? "Saved" : "Save this number"}
      </button>

      {built.complete ? (
        <AvailabilityButton number={built.dialable} variant="button" />
      ) : null}
    </section>
  );
}
