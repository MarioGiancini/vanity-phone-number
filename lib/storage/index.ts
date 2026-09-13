import { LocalStorageRepository } from "./local-storage";
import type { VanityRepository } from "./types";

export * from "./types";
export * from "./schema";

export interface RepositoryOptions {
  /** Namespace to scope storage. Swap for a user id once auth exists. */
  namespace?: string;
}

/**
 * Repository factory.
 *
 * Local-first today. To add accounts + a database, return a server-backed
 * implementation here and every consumer keeps working unchanged.
 */
export function createRepository(options: RepositoryOptions = {}): VanityRepository {
  return new LocalStorageRepository(options.namespace ?? "anon");
}
