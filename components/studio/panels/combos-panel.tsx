"use client";

import { useCallback, useMemo, useState, type ReactNode } from "react";
import { ArrowRightLeft, ListPlus, Shuffle } from "lucide-react";
import { generateCombos, normalize, type Slot } from "@/lib/vanity";
import { cn } from "@/lib/utils";
import { ResultList } from "../result-list";
import { useStudio } from "../studio-context";
import { Select, type SelectOption } from "@/components/ui/select";

type Mode = "two" | "one";

function Field({ label, children }: { label: string; children: ReactNode }) {
  return (
    <label className="block">
      <span className="mb-1.5 block text-[11px] uppercase tracking-[0.16em] text-ink-faint">
        {label}
      </span>
      {children}
    </label>
  );
}

function ModeButton({
  active,
  onClick,
  children,
}: {
  active: boolean;
  onClick: () => void;
  children: ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "chip chip-interactive px-3.5 py-1.5",
        active && "border-accent/60 bg-accent/10 text-accent",
      )}
    >
      {children}
    </button>
  );
}

export function CombosPanel({ onManageLists }: { onManageLists?: () => void }) {
  const { areaCode, lists } = useStudio();
  const [mode, setMode] = useState<Mode>("two");

  const [leftId, setLeftId] = useState("core-3");
  const [rightId, setRightId] = useState("core-4");
  const [reversed, setReversed] = useState(false);

  const [wordListId, setWordListId] = useState("tech");
  const [wordLength, setWordLength] = useState(5);
  const [placement, setPlacement] = useState<"first" | "last">("last");

  const optionsForLength = useCallback(
    (length: number): SelectOption[] =>
      lists
        .map((list) => ({
          list,
          count: list.words.filter((word) => normalize(word).length === length).length,
        }))
        .filter((entry) => entry.count > 0)
        .map((entry) => ({
          value: entry.list.id,
          label: entry.list.name,
          hint: `${entry.count}`,
          group: entry.list.group ?? "My lists",
        })),
    [lists],
  );

  const leftOptions = useMemo(() => optionsForLength(3), [optionsForLength]);
  const rightOptions = useMemo(() => optionsForLength(4), [optionsForLength]);

  const oneList = lists.find((list) => list.id === wordListId);
  const themes = useMemo(() => lists.filter((list) => list.group === "Themes"), [lists]);

  const lengthOptions = useMemo(() => {
    if (!oneList) return [] as { length: number; count: number }[];
    const counts = new Map<number, number>();
    for (const word of oneList.words) {
      const size = normalize(word).length;
      // Cap wildcard digits at 3 (10^3) to keep generation instant.
      if (size < 4 || size > 7) continue;
      counts.set(size, (counts.get(size) ?? 0) + 1);
    }
    return [...counts.entries()]
      .map(([length, count]) => ({ length, count }))
      .sort((a, b) => a.length - b.length);
  }, [oneList]);

  const effectiveLength = lengthOptions.some((option) => option.length === wordLength)
    ? wordLength
    : (lengthOptions[0]?.length ?? wordLength);

  const results = useMemo(() => {
    if (mode === "two") {
      const left = lists.find((list) => list.id === leftId);
      const right = lists.find((list) => list.id === rightId);
      if (!left || !right) return [];

      const exchange: Slot = { kind: "words", length: 3, words: left.words };
      const line: Slot = { kind: "words", length: 4, words: right.words };
      const slots = reversed ? [line, exchange] : [exchange, line];
      return generateCombos({ areaCode, slots, limit: 4000 });
    }

    if (!oneList) return [];
    const pad = 7 - effectiveLength;
    if (pad < 0) return [];

    const wordSlot: Slot = { kind: "words", length: effectiveLength, words: oneList.words };
    const digitSlot: Slot = { kind: "digits", length: pad };
    const slots: Slot[] =
      placement === "first"
        ? [wordSlot, ...(pad > 0 ? [digitSlot] : [])]
        : [...(pad > 0 ? [digitSlot] : []), wordSlot];
    return generateCombos({ areaCode, slots, limit: 3000 });
  }, [mode, lists, leftId, rightId, reversed, oneList, effectiveLength, placement, areaCode]);

  const capped = results.length >= (mode === "two" ? 4000 : 3000);

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center gap-2">
        <ModeButton active={mode === "two"} onClick={() => setMode("two")}>
          Two words
        </ModeButton>
        <ModeButton active={mode === "one"} onClick={() => setMode("one")}>
          One word + digits
        </ModeButton>
        {onManageLists ? (
          <button
            type="button"
            onClick={onManageLists}
            className="chip chip-interactive ml-auto"
            title="Add or edit word lists"
          >
            <ListPlus className="size-3.5" />
            Manage lists
          </button>
        ) : null}
      </div>

      <div className="panel p-4">
        {mode === "two" ? (
          <div className="space-y-4">
            {themes.length > 0 ? (
              <div>
                <span className="mb-1.5 block text-[11px] uppercase tracking-[0.16em] text-ink-faint">
                  Theme packs
                </span>
                <div className="flex flex-wrap gap-1.5">
                  {themes.map((theme) => {
                    const active = leftId === theme.id && rightId === theme.id;
                    return (
                      <button
                        key={theme.id}
                        type="button"
                        onClick={() => {
                          setLeftId(theme.id);
                          setRightId(theme.id);
                        }}
                        className={cn(
                          "chip chip-interactive px-2.5 py-1 text-[11px]",
                          active && "border-accent/60 bg-accent/10 text-accent",
                        )}
                      >
                        {theme.name}
                      </button>
                    );
                  })}
                </div>
              </div>
            ) : null}

            <div className="grid gap-3 sm:grid-cols-[1fr_auto_1fr] sm:items-end">
              <Field label="Exchange · 3 letters">
                <Select
                  value={leftId}
                  onChange={setLeftId}
                  options={leftOptions}
                  ariaLabel="Exchange word list"
                />
              </Field>
              <button
                type="button"
                onClick={() => setReversed((value) => !value)}
                className="btn h-[42px]"
                title="Swap the word order"
                aria-label="Swap the word order"
              >
                <ArrowRightLeft className="size-4" />
              </button>
              <Field label="Line · 4 letters">
                <Select
                  value={rightId}
                  onChange={setRightId}
                  options={rightOptions}
                  ariaLabel="Line word list"
                />
              </Field>
            </div>
            <p className="text-xs text-ink-muted">
              {reversed ? "4-letter word first" : "3-letter word first"} · shown as{" "}
              {reversed ? "CODE-BIG" : "BIG-CODE"}, dialed as the standard 3+4 split.
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            <div className="grid gap-3 sm:grid-cols-3">
              <Field label="Word list">
                <Select
                  value={wordListId}
                  onChange={setWordListId}
                  options={lists.map((list) => ({
                    value: list.id,
                    label: list.name,
                    hint: `${list.words.length}`,
                    group: list.group ?? "My lists",
                  }))}
                  ariaLabel="Word list"
                />
              </Field>
              <Field label="Word length">
                <Select
                  value={String(effectiveLength)}
                  onChange={(value) => setWordLength(Number(value))}
                  options={lengthOptions.map((option) => ({
                    value: String(option.length),
                    label: `${option.length} letters`,
                    hint: `${option.count}`,
                  }))}
                  ariaLabel="Word length"
                />
              </Field>
              <Field label="Placement">
                <Select
                  value={placement}
                  onChange={(value) => setPlacement(value as "first" | "last")}
                  options={[
                    { value: "last", label: "Word last" },
                    { value: "first", label: "Word first" },
                  ]}
                  ariaLabel="Placement"
                />
              </Field>
            </div>
            <p className="text-xs text-ink-muted">
              {lengthOptions.length === 0
                ? "This list has no 4-7 letter words. Add some in Lists or pick another list."
                : effectiveLength < 7
                  ? `The remaining ${7 - effectiveLength} digit${7 - effectiveLength === 1 ? "" : "s"} are filled with 0-9 wildcards.`
                  : "A full 7-letter word, no filler digits."}
            </p>
          </div>
        )}
      </div>

      <div className="flex items-center justify-between">
        <span className="text-[11px] uppercase tracking-[0.18em] text-ink-faint">
          {results.length}
          {capped ? "+" : ""} candidate{results.length === 1 ? "" : "s"}
        </span>
        {themes.length > 0 && mode === "two" ? (
          <span className="flex items-center gap-1 text-[11px] text-ink-faint">
            <Shuffle className="size-3" />
            Tap a theme to load both lists
          </span>
        ) : null}
      </div>

      <ResultList
        key={`${mode}-${leftId}-${rightId}-${reversed}-${wordListId}-${effectiveLength}-${placement}`}
        candidates={results}
        emptyLabel="No candidates for this combination. Try another list or word length."
      />
    </div>
  );
}
