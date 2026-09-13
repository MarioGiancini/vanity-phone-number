import type { SavedNumber, WordList } from "@/lib/vanity";
import { preferencesSchema, savedNumbersSchema, wordListsSchema } from "./schema";
import { DEFAULT_PREFERENCES, type StudioPreferences, type VanityRepository } from "./types";

const RECENT_LIMIT = 60;

function doNotTrack(): boolean {
  if (typeof navigator === "undefined") return false;
  const nav = navigator as Navigator & { doNotTrack?: string | null };
  return nav.doNotTrack === "1" || nav.doNotTrack === "yes";
}

/**
 * localStorage-backed repository. Instances are namespaced so a per-user
 * namespace can be swapped in once accounts exist (e.g. user id instead of
 * "anon"), and so the storage layout never has to change.
 */
export class LocalStorageRepository implements VanityRepository {
  constructor(private readonly namespace = "anon") {}

  private key(suffix: string): string {
    return `vanity-studio:${this.namespace}:${suffix}`;
  }

  private read<T>(suffix: string, parse: (value: unknown) => T[], fallback: T[]): T[] {
    if (typeof window === "undefined") return fallback;
    try {
      const raw = window.localStorage.getItem(this.key(suffix));
      if (!raw) return fallback;
      return parse(JSON.parse(raw));
    } catch {
      return fallback;
    }
  }

  private write<T>(suffix: string, value: T[]): void {
    if (typeof window === "undefined") return;
    try {
      window.localStorage.setItem(this.key(suffix), JSON.stringify(value));
    } catch {
      // Quota or private-mode failures are non-fatal for a local-first tool.
    }
  }

  async favorites(): Promise<SavedNumber[]> {
    return this.read("favorites", (v) => savedNumbersSchema.parse(v), []);
  }

  async addFavorite(entry: SavedNumber): Promise<SavedNumber[]> {
    const current = await this.favorites();
    const next = [entry, ...current.filter((item) => item.id !== entry.id)];
    this.write("favorites", next);
    return next;
  }

  async removeFavorite(id: string): Promise<SavedNumber[]> {
    const next = (await this.favorites()).filter((item) => item.id !== id);
    this.write("favorites", next);
    return next;
  }

  async recents(): Promise<SavedNumber[]> {
    return this.read("recents", (v) => savedNumbersSchema.parse(v), []);
  }

  async addRecent(entry: SavedNumber): Promise<SavedNumber[]> {
    const current = await this.recents();
    const next = [entry, ...current.filter((item) => item.id !== entry.id)].slice(0, RECENT_LIMIT);
    this.write("recents", next);
    return next;
  }

  async clearRecents(): Promise<void> {
    this.write("recents", []);
  }

  async customLists(): Promise<WordList[]> {
    return this.read("lists", (v) => wordListsSchema.parse(v), []);
  }

  async saveCustomList(list: WordList): Promise<WordList[]> {
    const current = await this.customLists();
    const next = [list, ...current.filter((item) => item.id !== list.id)];
    this.write("lists", next);
    return next;
  }

  async removeCustomList(id: string): Promise<WordList[]> {
    const next = (await this.customLists()).filter((item) => item.id !== id);
    this.write("lists", next);
    return next;
  }

  async preferences(): Promise<StudioPreferences> {
    if (typeof window === "undefined") return DEFAULT_PREFERENCES;
    try {
      const raw = window.localStorage.getItem(this.key("preferences"));
      if (!raw) return { analytics: !doNotTrack() };
      return preferencesSchema.parse(JSON.parse(raw));
    } catch {
      return { analytics: !doNotTrack() };
    }
  }

  async savePreferences(preferences: StudioPreferences): Promise<StudioPreferences> {
    if (typeof window === "undefined") return preferences;
    try {
      window.localStorage.setItem(this.key("preferences"), JSON.stringify(preferences));
    } catch {
      // Quota or private-mode failures are non-fatal.
    }
    return preferences;
  }
}
