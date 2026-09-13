"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { ChevronDown, Crosshair, MapPin, Search } from "lucide-react";
import { AREA_CODE_SUGGESTIONS } from "@/data/presets";
import {
  areaCodeLabel,
  describeAreaCode,
  nearestAreaCode,
  searchAreaCodes,
} from "@/lib/area-code-search";
import { cn } from "@/lib/utils";
import { useStudio } from "./studio-context";

interface DisplayItem {
  code: string;
  label: string;
}

export function AreaCodePicker() {
  const { areaCode, setAreaCode, showToast } = useStudio();
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [locating, setLocating] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  const currentLabel = describeAreaCode(areaCode);

  const items = useMemo<DisplayItem[]>(() => {
    const trimmed = query.trim();
    if (!trimmed) {
      return AREA_CODE_SUGGESTIONS.map((item) => ({ code: item.code, label: item.label }));
    }
    const results = searchAreaCodes(trimmed, 40).map((item) => ({
      code: item.code,
      label: areaCodeLabel(item),
    }));
    if (/^\d{3}$/.test(trimmed) && !results.some((item) => item.code === trimmed)) {
      results.unshift({ code: trimmed, label: "Custom area code" });
    }
    return results;
  }, [query]);

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

  const choose = (code: string, label?: string) => {
    setAreaCode(code);
    setOpen(false);
    setQuery("");
    if (label) showToast(`Area code ${code} \u00b7 ${label}`);
  };

  const useMyLocation = () => {
    if (typeof navigator === "undefined" || !navigator.geolocation) {
      showToast("Geolocation isn't available in this browser");
      return;
    }
    setLocating(true);
    navigator.geolocation.getCurrentPosition(
      (position) => {
        const nearest = nearestAreaCode(position.coords.latitude, position.coords.longitude);
        setLocating(false);
        if (nearest) choose(nearest.code, `${nearest.city}, ${nearest.state}`);
        else showToast("Couldn't match a nearby area code");
      },
      () => {
        setLocating(false);
        showToast("Location permission denied");
      },
      { enableHighAccuracy: false, timeout: 8000, maximumAge: 600000 },
    );
  };

  return (
    <div ref={containerRef} className="relative">
      <button
        type="button"
        onClick={() => setOpen((current) => !current)}
        aria-haspopup="dialog"
        aria-expanded={open}
        aria-label="Area code"
        className={cn(
          "flex w-full items-center gap-2.5 rounded-xl border border-border bg-surface-2/70 px-3 py-2 text-left transition hover:border-border-strong",
          open && "border-accent/70",
        )}
      >
        <MapPin className="size-4 shrink-0 text-accent" />
        <span className="font-mono text-lg font-semibold tracking-tight text-ink">{areaCode}</span>
        <span className="min-w-0 flex-1 truncate text-sm text-ink-muted">{currentLabel}</span>
        <ChevronDown
          className={cn("size-4 shrink-0 text-ink-faint transition", open && "rotate-180")}
        />
      </button>

      {open ? (
        <div className="absolute right-0 z-40 mt-2 w-[22rem] overflow-hidden rounded-xl border border-border bg-surface-3 shadow-2xl">
          <div className="flex items-center gap-2 border-b border-border px-3 py-2.5">
            <Search className="size-4 shrink-0 text-ink-faint" />
            <input
              autoFocus
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="Search city, state, or code"
              aria-label="Search area codes"
              className="min-w-0 flex-1 bg-transparent text-sm text-ink outline-none placeholder:text-ink-faint"
            />
          </div>

          <button
            type="button"
            onClick={useMyLocation}
            disabled={locating}
            className="flex w-full items-center gap-2 border-b border-border px-3 py-2.5 text-left text-sm text-ink transition hover:bg-surface-2 disabled:opacity-50"
          >
            <Crosshair className={cn("size-4 text-accent", locating && "animate-pulse")} />
            {locating ? "Locating\u2026" : "Use my location"}
          </button>

          <div className="scroll-area max-h-72 overflow-auto p-1">
            {items.length === 0 ? (
              <p className="px-2.5 py-3 text-sm text-ink-faint">No matching area codes.</p>
            ) : (
              items.map((item) => (
                <button
                  key={`${item.code}-${item.label}`}
                  type="button"
                  onClick={() => choose(item.code, item.label)}
                  className={cn(
                    "flex w-full items-center justify-between gap-2 rounded-lg px-2.5 py-2 text-left text-sm transition hover:bg-surface-2",
                    item.code === areaCode ? "text-accent" : "text-ink",
                  )}
                >
                  <span className="font-mono font-medium">{item.code}</span>
                  <span className="min-w-0 truncate text-ink-muted">{item.label}</span>
                </button>
              ))
            )}
          </div>

          <p className="border-t border-border px-3 py-2 text-[11px] text-ink-faint">
            NANP data only. Location is matched to the nearest area-code centroid.
          </p>
        </div>
      ) : null}
    </div>
  );
}
