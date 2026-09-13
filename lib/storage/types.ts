import type { SavedNumber, WordList } from "@/lib/vanity";

/** Local preferences. Analytics is anonymous and opt-out. */
export interface StudioPreferences {
  analytics: boolean;
}

export const DEFAULT_PREFERENCES: StudioPreferences = { analytics: true };

/**
 * Persistence contract for the studio.
 *
 * The app ships with a localStorage implementation (no backend required). When
 * auth + a database are added, provide a new implementation that talks to the
 * server — nothing in the UI changes.
 */
export interface VanityRepository {
  favorites(): Promise<SavedNumber[]>;
  addFavorite(entry: SavedNumber): Promise<SavedNumber[]>;
  removeFavorite(id: string): Promise<SavedNumber[]>;

  recents(): Promise<SavedNumber[]>;
  addRecent(entry: SavedNumber): Promise<SavedNumber[]>;
  clearRecents(): Promise<void>;

  customLists(): Promise<WordList[]>;
  saveCustomList(list: WordList): Promise<WordList[]>;
  removeCustomList(id: string): Promise<WordList[]>;

  preferences(): Promise<StudioPreferences>;
  savePreferences(preferences: StudioPreferences): Promise<StudioPreferences>;
}
