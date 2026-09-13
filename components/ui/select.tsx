"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { Check, ChevronDown } from "lucide-react";
import { cn } from "@/lib/utils";

export interface SelectOption {
  value: string;
  label: string;
  hint?: string;
  group?: string;
}

/**
 * Custom dark-themed listbox. Native <select> menus render with OS styling that
 * can't be themed, so this mirrors the rest of the studio instead.
 */
export function Select({
  value,
  onChange,
  options,
  ariaLabel,
  placeholder = "Select\u2026",
  className,
  disabled,
}: {
  value: string;
  onChange: (value: string) => void;
  options: SelectOption[];
  ariaLabel?: string;
  placeholder?: string;
  className?: string;
  disabled?: boolean;
}) {
  const [open, setOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const selected = useMemo(
    () => options.find((option) => option.value === value),
    [options, value],
  );

  useEffect(() => {
    if (!open) return;
    const onPointerDown = (event: PointerEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setOpen(false);
      }
    };
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") setOpen(false);
    };
    document.addEventListener("pointerdown", onPointerDown);
    document.addEventListener("keydown", onKeyDown);
    return () => {
      document.removeEventListener("pointerdown", onPointerDown);
      document.removeEventListener("keydown", onKeyDown);
    };
  }, [open]);

  const groups = useMemo(() => {
    const map = new Map<string, SelectOption[]>();
    for (const option of options) {
      const key = option.group ?? "";
      const bucket = map.get(key);
      if (bucket) bucket.push(option);
      else map.set(key, [option]);
    }
    return [...map.entries()];
  }, [options]);

  return (
    <div ref={containerRef} className="relative">
      <button
        type="button"
        disabled={disabled}
        onClick={() => setOpen((current) => !current)}
        aria-haspopup="listbox"
        aria-expanded={open}
        aria-label={ariaLabel}
        className={cn(
          "field flex items-center gap-2 text-left disabled:cursor-not-allowed disabled:opacity-40",
          open && "border-accent/70",
          className,
        )}
      >
        <span className={cn("truncate", selected ? "text-ink" : "text-ink-faint")}>
          {selected?.label ?? placeholder}
        </span>
        {selected?.hint ? (
          <span className="ml-auto shrink-0 font-mono text-[11px] text-ink-faint">
            {selected.hint}
          </span>
        ) : null}
        <ChevronDown
          className={cn(
            "size-4 shrink-0 text-ink-faint transition",
            !selected?.hint && "ml-auto",
            open && "rotate-180",
          )}
        />
      </button>

      {open && options.length > 0 ? (
        <div
          role="listbox"
          className="scroll-area absolute z-50 mt-2 max-h-72 w-full min-w-56 overflow-auto rounded-xl border border-border bg-surface-3 p-1 shadow-2xl"
        >
          {groups.map(([group, items]) => (
            <div key={group}>
              {group ? (
                <div className="px-2.5 pb-1 pt-2 text-[10px] uppercase tracking-[0.16em] text-ink-faint">
                  {group}
                </div>
              ) : null}
              {items.map((option) => {
                const active = option.value === value;
                return (
                  <button
                    key={option.value}
                    type="button"
                    role="option"
                    aria-selected={active}
                    onClick={() => {
                      onChange(option.value);
                      setOpen(false);
                    }}
                    className={cn(
                      "flex w-full items-center gap-2 rounded-lg px-2.5 py-2 text-left text-sm transition hover:bg-surface-2",
                      active ? "text-accent" : "text-ink",
                    )}
                  >
                    <span className="min-w-0 flex-1 truncate">{option.label}</span>
                    {option.hint ? (
                      <span className="shrink-0 font-mono text-[11px] text-ink-faint">
                        {option.hint}
                      </span>
                    ) : null}
                    {active ? <Check className="size-4 shrink-0" /> : null}
                  </button>
                );
              })}
            </div>
          ))}
        </div>
      ) : null}
    </div>
  );
}
