"use client";

import { useState } from "react";
import { Loader2, Shield, ShieldCheck, ShieldX } from "lucide-react";
import { checkAvailability } from "@/lib/availability";
import { cn } from "@/lib/utils";
import { useStudio } from "./studio-context";

type State = "idle" | "loading" | "available" | "taken" | "unknown";

/**
 * Runs a carrier availability check. If Twilio isn't configured on the server,
 * it explains how to enable it rather than failing silently.
 */
export function AvailabilityButton({
  number,
  variant = "icon",
  className,
}: {
  number: string;
  variant?: "icon" | "button";
  className?: string;
}) {
  const { showToast } = useStudio();
  const [state, setState] = useState<State>("idle");

  const isDisabled = !number || state === "loading";

  const run = async () => {
    setState("loading");
    const result = await checkAvailability(number);
    if (!result.configured) {
      setState("idle");
      showToast(result.message);
      return;
    }
    if (result.available === true) {
      setState("available");
      showToast(`Available \u00b7 ${result.number}`);
    } else if (result.available === false) {
      setState("taken");
      showToast("Not in Twilio's available inventory");
    } else {
      setState("unknown");
      showToast(result.message);
    }
  };

  const icon =
    state === "loading" ? (
      <Loader2 className="size-4 animate-spin" />
    ) : state === "available" ? (
      <ShieldCheck className="size-4" />
    ) : state === "taken" ? (
      <ShieldX className="size-4" />
    ) : (
      <Shield className="size-4" />
    );

  const label =
    state === "available"
      ? "Available"
      : state === "taken"
        ? "Taken"
        : state === "unknown"
          ? "Unknown"
          : "Check availability";

  const tone =
    state === "available"
      ? "border-accent/50 text-accent"
      : state === "taken"
        ? "border-danger/40 text-danger"
        : state === "unknown"
          ? "border-amber/40 text-amber"
          : undefined;

  return (
    <button
      type="button"
      onClick={(event) => {
        event.stopPropagation();
        void run();
      }}
      disabled={isDisabled}
      className={cn("btn shrink-0", variant === "icon" ? "px-2.5 py-2" : "w-full", tone, className)}
      aria-label={label}
      title={label}
    >
      {icon}
      {variant === "button" ? <span>{label}</span> : null}
    </button>
  );
}
