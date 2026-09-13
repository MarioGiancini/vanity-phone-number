"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from "react";
import { DICTIONARY } from "@/data/dictionary";
import { BUILT_IN_LISTS } from "@/data/word-lists";
import { createRepository } from "@/lib/storage";
import { DEFAULT_PREFERENCES, type StudioPreferences } from "@/lib/storage/types";
import {
  buildDigitIndex,
  buildVanity,
  entryGrouping,
  normalize,
  sanitizeEntry,
  slotsFromText,
  toSlots,
  type BuiltVanity,
  type DigitIndex,
  type SavedNumber,
  type SlotChar,
  type WordList,
} from "@/lib/vanity";

interface StudioValue {
  areaCode: string;
  setAreaCode: (value: string) => void;

  /** Literal user input, e.g. "BIG CODE". Single source of truth for the pad. */
  entry: string;
  setEntry: (value: string) => void;
  appendChar: (char: string) => void;
  backspace: () => void;
  clearEntry: () => void;

  slots: SlotChar[];
  grouping: number[];
  built: BuiltVanity;

  favorites: SavedNumber[];
  recents: SavedNumber[];
  toggleFavorite: (entry: SavedNumber) => void;
  isFavorite: (id: string) => boolean;
  recordRecent: (entry: SavedNumber) => void;
  clearRecents: () => void;

  lists: WordList[];
  saveList: (list: WordList) => void;
  deleteList: (id: string) => void;
  dictionaryIndex: DigitIndex;
  /** Every word the user has curated across built-in and custom lists. */
  curatedWords: Set<string>;

  toast: string | null;
  showToast: (message: string) => void;

  preferences: StudioPreferences;
  setAnalyticsEnabled: (value: boolean) => void;
}

const StudioContext = createContext<StudioValue | null>(null);

const MAX_LETTERS = 7;

export function StudioProvider({ children }: { children: ReactNode }) {
  const repository = useMemo(() => createRepository(), []);
  const [areaCode, setAreaCodeState] = useState("702");
  const [entry, setEntryState] = useState("");
  const [favorites, setFavorites] = useState<SavedNumber[]>([]);
  const [recents, setRecents] = useState<SavedNumber[]>([]);
  const [customLists, setCustomLists] = useState<WordList[]>([]);
  const [toast, setToast] = useState<string | null>(null);
  const [preferences, setPreferences] = useState<StudioPreferences>(DEFAULT_PREFERENCES);
  const toastTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    let active = true;
    void Promise.all([
      repository.favorites(),
      repository.recents(),
      repository.customLists(),
      repository.preferences(),
    ]).then(([loadedFavorites, loadedRecents, loadedLists, loadedPreferences]) => {
      if (!active) return;
      setFavorites(loadedFavorites);
      setRecents(loadedRecents);
      setCustomLists(loadedLists);
      setPreferences(loadedPreferences);
    });
    return () => {
      active = false;
    };
  }, [repository]);

  const slots = useMemo(() => toSlots(slotsFromText(entry, MAX_LETTERS)), [entry]);
  const grouping = useMemo(() => entryGrouping(entry), [entry]);
  const built = useMemo(() => buildVanity(areaCode, slots, grouping), [areaCode, slots, grouping]);

  const lists = useMemo<WordList[]>(() => [...BUILT_IN_LISTS, ...customLists], [customLists]);

  const dictionaryIndex = useMemo(() => {
    const words = new Set<string>(DICTIONARY);
    for (const list of lists) {
      for (const word of list.words) words.add(word.toUpperCase());
    }
    return buildDigitIndex(words);
  }, [lists]);

  const curatedWords = useMemo(() => {
    const words = new Set<string>();
    for (const list of lists) {
      // The full dictionary lists aren't "curated" — they'd let any word through.
      if (list.group === "Dictionary") continue;
      for (const word of list.words) words.add(word.toUpperCase());
    }
    return words;
  }, [lists]);

  const showToast = useCallback((message: string) => {
    setToast(message);
    if (toastTimer.current) clearTimeout(toastTimer.current);
    toastTimer.current = setTimeout(() => setToast(null), 2200);
  }, []);

  const setAreaCode = useCallback((value: string) => {
    setAreaCodeState(normalize(value).replace(/[^0-9]/g, "").slice(0, 3));
  }, []);

  const setEntry = useCallback((value: string) => {
    setEntryState(sanitizeEntry(value));
  }, []);

  const appendChar = useCallback((char: string) => {
    const clean = char.toUpperCase().replace(/[^A-Z0-9]/g, "");
    if (!clean) return;
    setEntryState((current) => {
      const filled = current.replace(/[^A-Z0-9]/g, "").length;
      if (filled >= MAX_LETTERS) return current;
      return current + clean;
    });
  }, []);

  const backspace = useCallback(() => {
    setEntryState((current) => current.slice(0, -1));
  }, []);

  const clearEntry = useCallback(() => setEntryState(""), []);

  const persistFavorites = useCallback(
    async (next: Promise<SavedNumber[]>) => {
      setFavorites(await next);
    },
    [],
  );

  const toggleFavorite = useCallback(
    (candidate: SavedNumber) => {
      const exists = favorites.some((item) => item.id === candidate.id);
      const request = exists
        ? repository.removeFavorite(candidate.id)
        : repository.addFavorite(candidate);
      void persistFavorites(request);
      showToast(exists ? "Removed from favorites" : "Saved to favorites — see the Saved tab");
    },
    [favorites, persistFavorites, repository, showToast],
  );

  const isFavorite = useCallback(
    (id: string) => favorites.some((item) => item.id === id),
    [favorites],
  );

  const recordRecent = useCallback(
    (candidate: SavedNumber) => {
      void repository.addRecent(candidate).then(setRecents);
    },
    [repository],
  );

  const clearRecents = useCallback(() => {
    setRecents([]);
    void repository.clearRecents();
  }, [repository]);

  const setAnalyticsEnabled = useCallback(
    (value: boolean) => {
      setPreferences((current) => ({ ...current, analytics: value }));
      void repository.savePreferences({ analytics: value });
    },
    [repository],
  );

  const saveList = useCallback(
    (list: WordList) => {
      void repository.saveCustomList(list).then(setCustomLists);
      showToast("List saved");
    },
    [repository, showToast],
  );

  const deleteList = useCallback(
    (id: string) => {
      void repository.removeCustomList(id).then(setCustomLists);
      showToast("List deleted");
    },
    [repository, showToast],
  );

  const value = useMemo<StudioValue>(
    () => ({
      areaCode,
      setAreaCode,
      entry,
      setEntry,
      appendChar,
      backspace,
      clearEntry,
      slots,
      grouping,
      built,
      favorites,
      recents,
      toggleFavorite,
      isFavorite,
      recordRecent,
      clearRecents,
      lists,
      saveList,
      deleteList,
      dictionaryIndex,
      curatedWords,
      toast,
      showToast,
      preferences,
      setAnalyticsEnabled,
    }),
    [
      areaCode,
      setAreaCode,
      entry,
      setEntry,
      appendChar,
      backspace,
      clearEntry,
      slots,
      grouping,
      built,
      favorites,
      recents,
      toggleFavorite,
      isFavorite,
      recordRecent,
      clearRecents,
      lists,
      saveList,
      deleteList,
      dictionaryIndex,
      curatedWords,
      toast,
      showToast,
      preferences,
      setAnalyticsEnabled,
    ],
  );

  return (
    <StudioContext.Provider value={value}>
      {children}
      <div className="pointer-events-none fixed inset-x-0 bottom-6 z-50 flex justify-center">
        {toast ? (
          <div
            role="status"
            className="animate-toast pointer-events-auto rounded-full border border-border-strong bg-surface-3/95 px-4 py-2 text-sm text-ink shadow-2xl backdrop-blur"
          >
            {toast}
          </div>
        ) : null}
      </div>
    </StudioContext.Provider>
  );
}

export function useStudio(): StudioValue {
  const context = useContext(StudioContext);
  if (!context) throw new Error("useStudio must be used inside <StudioProvider>");
  return context;
}
