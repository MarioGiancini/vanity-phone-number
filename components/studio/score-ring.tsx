import { cn } from "@/lib/utils";

function colorFor(score: number): string {
  if (score >= 80) return "var(--accent)";
  if (score >= 60) return "var(--violet)";
  if (score >= 40) return "var(--amber)";
  return "var(--ink-faint)";
}

/** Small SVG progress ring showing a 0-100 memorability score. */
export function ScoreRing({ score, className }: { score: number; className?: string }) {
  const radius = 15;
  const circumference = 2 * Math.PI * radius;
  const clamped = Math.max(0, Math.min(100, score));
  const offset = circumference - (clamped / 100) * circumference;
  const color = colorFor(clamped);

  return (
    <div
      className={cn("relative grid size-11 shrink-0 place-items-center", className)}
      title={`Memorability score: ${clamped}/100`}
    >
      <svg viewBox="0 0 36 36" className="size-11 -rotate-90">
        <circle cx="18" cy="18" r={radius} fill="none" stroke="var(--surface-3)" strokeWidth="3" />
        <circle
          cx="18"
          cy="18"
          r={radius}
          fill="none"
          stroke={color}
          strokeWidth="3"
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
        />
      </svg>
      <span className="absolute font-mono text-[11px] font-semibold text-ink">{clamped}</span>
    </div>
  );
}
