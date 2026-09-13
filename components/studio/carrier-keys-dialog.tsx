"use client";

import { useState, type ChangeEvent } from "react";
import { KeyRound, X } from "lucide-react";
import {
  clearCarrierKeys,
  hasAnyCarrierKeys,
  loadCarrierKeys,
  saveCarrierKeys,
  type CarrierKeys,
} from "@/lib/carrier-keys";
import { useStudio } from "./studio-context";

export function CarrierKeysDialog({ open, onClose }: { open: boolean; onClose: () => void }) {
  const { showToast } = useStudio();
  const [keys, setKeys] = useState<CarrierKeys>(() => loadCarrierKeys());

  if (!open) return null;

  const update = (field: keyof CarrierKeys) => (event: ChangeEvent<HTMLInputElement>) =>
    setKeys((current) => ({ ...current, [field]: event.target.value.trim() }));

  const save = () => {
    saveCarrierKeys(keys);
    showToast(hasAnyCarrierKeys(keys) ? "Carrier keys saved in this browser" : "No keys entered");
    onClose();
  };

  const clear = () => {
    clearCarrierKeys();
    setKeys(loadCarrierKeys());
    showToast("Carrier keys cleared");
  };

  return (
    <div
      className="fixed inset-0 z-[60] flex items-center justify-center bg-black/60 p-4"
      onClick={onClose}
      role="presentation"
    >
      <div
        className="panel w-full max-w-md space-y-4 p-5"
        onClick={(event) => event.stopPropagation()}
        role="dialog"
        aria-modal="true"
        aria-label="Carrier keys"
      >
        <div className="flex items-start justify-between gap-3">
          <div>
            <h2 className="flex items-center gap-2 text-sm font-semibold text-ink">
              <KeyRound className="size-4 text-accent" />
              Carrier keys
            </h2>
            <p className="mt-1 text-xs text-ink-muted">
              Use your own Twilio and/or Telnyx keys for availability on this site. Stored only in
              this browser and sent to this app&apos;s own routes per request — never stored
              server-side. Prefer scoped, rotatable keys.
            </p>
          </div>
          <button type="button" onClick={onClose} className="btn px-2 py-1.5" aria-label="Close">
            <X className="size-4" />
          </button>
        </div>

        <div className="space-y-2.5">
          <label className="block">
            <span className="mb-1 block text-[11px] uppercase tracking-[0.16em] text-ink-faint">
              Twilio Account SID
            </span>
            <input
              className="field font-mono text-xs"
              placeholder="AC…"
              value={keys.twilioAccountSid}
              onChange={update("twilioAccountSid")}
            />
          </label>
          <label className="block">
            <span className="mb-1 block text-[11px] uppercase tracking-[0.16em] text-ink-faint">
              Twilio API Key SID
            </span>
            <input
              className="field font-mono text-xs"
              placeholder="SK…"
              value={keys.twilioApiKey}
              onChange={update("twilioApiKey")}
            />
          </label>
          <label className="block">
            <span className="mb-1 block text-[11px] uppercase tracking-[0.16em] text-ink-faint">
              Twilio API Secret
            </span>
            <input
              className="field font-mono text-xs"
              type="password"
              placeholder="…"
              value={keys.twilioApiSecret}
              onChange={update("twilioApiSecret")}
            />
          </label>
          <label className="block">
            <span className="mb-1 block text-[11px] uppercase tracking-[0.16em] text-ink-faint">
              Telnyx API key
            </span>
            <input
              className="field font-mono text-xs"
              type="password"
              placeholder="KEY…"
              value={keys.telnyxApiKey}
              onChange={update("telnyxApiKey")}
            />
          </label>
        </div>

        <div className="flex items-center gap-2">
          <button type="button" onClick={save} className="btn btn-accent">
            Save
          </button>
          <button type="button" onClick={clear} className="btn">
            Clear
          </button>
        </div>
      </div>
    </div>
  );
}
