"use client";

import { useState } from "react";
import { Copy, Pencil, Plus, Trash2 } from "lucide-react";
import { normalize, type WordList } from "@/lib/vanity";
import { useStudio } from "../studio-context";

function parseWords(text: string): string[] {
  const seen = new Set<string>();
  const out: string[] = [];
  for (const token of text.split(/[^A-Za-z0-9]+/)) {
    const word = normalize(token);
    if (!word || seen.has(word)) continue;
    seen.add(word);
    out.push(word);
  }
  return out;
}

function lengthSummary(list: WordList): string {
  const lengths = [...new Set(list.words.map((word) => normalize(word).length))].sort(
    (a, b) => a - b,
  );
  return `${lengths.join(" · ")} letters`;
}

export function ListsPanel() {
  const { lists, saveList, deleteList, showToast } = useStudio();
  const [editingId, setEditingId] = useState<string | null>(null);
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [wordsText, setWordsText] = useState("");

  const reset = () => {
    setEditingId(null);
    setName("");
    setDescription("");
    setWordsText("");
  };

  const submit = () => {
    const words = parseWords(wordsText);
    if (!name.trim() || words.length === 0) {
      showToast("Add a name and at least one word");
      return;
    }
    saveList({
      id: editingId ?? `custom-${Date.now().toString(36)}`,
      name: name.trim(),
      description: description.trim() || undefined,
      words,
      group: "My lists",
    });
    reset();
  };

  const edit = (list: WordList) => {
    setEditingId(list.id);
    setName(list.name);
    setDescription(list.description ?? "");
    setWordsText(list.words.join(", "));
  };

  const duplicate = (list: WordList) => {
    setEditingId(null);
    setName(`${list.name} copy`);
    setDescription(list.description ?? "");
    setWordsText(list.words.join(", "));
    showToast("Editing a copy — save to add it to Combos");
  };

  return (
    <div className="space-y-5">
      <div className="panel space-y-3 p-4">
        <div className="flex items-center justify-between">
          <h3 className="text-[11px] uppercase tracking-[0.18em] text-ink-faint">
            {editingId ? "Edit list" : "New word list"}
          </h3>
          {editingId ? (
            <button type="button" onClick={reset} className="chip chip-interactive">
              Cancel
            </button>
          ) : null}
        </div>
        <p className="text-xs text-ink-muted">
          Word lists power the Combos engine. Any list with 3-letter words appears in the exchange
          dropdown; any with 4-letter words appears in the line dropdown. Duplicate a built-in pack
          to make it your own.
        </p>
        <input
          className="field"
          placeholder="List name (e.g. Client names)"
          value={name}
          onChange={(event) => setName(event.target.value)}
        />
        <input
          className="field"
          placeholder="Description (optional)"
          value={description}
          onChange={(event) => setDescription(event.target.value)}
        />
        <textarea
          className="field min-h-28 font-mono text-xs leading-relaxed"
          placeholder="GREP, PIPE, SHIP&#10;or one word per line"
          value={wordsText}
          onChange={(event) => setWordsText(event.target.value)}
        />
        <div className="flex items-center gap-2">
          <button type="button" onClick={submit} className="btn btn-accent">
            <Plus className="size-4" />
            {editingId ? "Update list" : "Save list"}
          </button>
          <span className="text-xs text-ink-faint">
            {parseWords(wordsText).length} words parsed
          </span>
        </div>
      </div>

      <div className="grid gap-2.5 lg:grid-cols-2">
        {lists.map((list) => (
          <div key={list.id} className="panel flex flex-col gap-2 p-4">
            <div className="flex items-start justify-between gap-2">
              <div className="min-w-0">
                <div className="flex items-center gap-2">
                  <h4 className="truncate font-medium text-ink">{list.name}</h4>
                  {list.group ? (
                    <span className="chip shrink-0 px-2 py-0.5 text-[10px] uppercase tracking-wide">
                      {list.group}
                    </span>
                  ) : null}
                </div>
                {list.description ? (
                  <p className="mt-0.5 text-xs text-ink-muted">{list.description}</p>
                ) : null}
              </div>
              <div className="flex shrink-0 gap-1">
                {list.builtIn ? (
                  <button
                    type="button"
                    onClick={() => duplicate(list)}
                    className="btn px-2 py-1.5"
                    aria-label={`Duplicate ${list.name}`}
                    title="Duplicate & edit"
                  >
                    <Copy className="size-3.5" />
                  </button>
                ) : (
                  <>
                    <button
                      type="button"
                      onClick={() => edit(list)}
                      className="btn px-2 py-1.5"
                      aria-label={`Edit ${list.name}`}
                      title="Edit"
                    >
                      <Pencil className="size-3.5" />
                    </button>
                    <button
                      type="button"
                      onClick={() => deleteList(list.id)}
                      className="btn px-2 py-1.5"
                      aria-label={`Delete ${list.name}`}
                      title="Delete"
                    >
                      <Trash2 className="size-3.5" />
                    </button>
                  </>
                )}
              </div>
            </div>

            <div className="flex flex-wrap gap-1">
              {list.words.slice(0, 14).map((word) => (
                <span key={word} className="chip px-2 py-0.5 font-mono text-[11px]">
                  {word}
                </span>
              ))}
              {list.words.length > 14 ? (
                <span className="chip px-2 py-0.5 text-[11px] text-ink-faint">
                  +{list.words.length - 14}
                </span>
              ) : null}
            </div>

            <p className="text-[11px] uppercase tracking-wide text-ink-faint">
              {list.words.length} words · {lengthSummary(list)}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
}
