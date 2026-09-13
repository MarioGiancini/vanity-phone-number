"use client";

import { KEY_LETTERS, KEYPAD_ROWS } from "@/lib/vanity";
import { cn } from "@/lib/utils";
import { useStudio } from "./studio-context";

/** Interactive T9 dial pad. Tap the key for a digit, tap a letter to spell. */
export function DialPad() {
  const { appendChar, entry } = useStudio();
  const typed = entry.replace(/[^A-Z0-9]/g, "").toUpperCase();

  return (
    <div className="grid grid-cols-3 gap-2.5" role="group" aria-label="Phone dial pad">
      {KEYPAD_ROWS.flat().map((digit) => {
        const letters = KEY_LETTERS[digit] ?? "";
        const isModifier = digit === "*" || digit === "#";
        return (
          <div
            key={digit}
            className={cn("dial-key aspect-[1/0.8]", isModifier && "pointer-events-none opacity-30")}
          >
            <button
              type="button"
              onClick={() => appendChar(digit)}
              disabled={isModifier}
              className="absolute inset-0 flex items-start justify-center pt-3"
              aria-label={letters ? `${digit} ${letters}` : digit}
            >
              <span className="font-mono text-2xl font-semibold leading-none">{digit}</span>
            </button>
            {letters ? (
              <div className="relative z-10 mt-auto flex w-full items-center justify-center gap-1 pb-2.5">
                {letters.split("").map((letter) => {
                  const active = typed.includes(letter);
                  return (
                    <button
                      key={letter}
                      type="button"
                      onClick={() => appendChar(letter)}
                      className={cn(
                        "rounded px-1 font-mono text-[11px] tracking-widest text-ink-faint transition hover:text-accent",
                        active && "text-accent",
                      )}
                      aria-label={`Letter ${letter}`}
                      title={`Type ${letter}`}
                    >
                      {letter}
                    </button>
                  );
                })}
              </div>
            ) : null}
          </div>
        );
      })}
    </div>
  );
}
