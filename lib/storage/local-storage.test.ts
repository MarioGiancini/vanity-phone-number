import { beforeEach, describe, expect, it } from "vitest";
import { makeSavedNumber } from "@/lib/vanity";
import { LocalStorageRepository } from "./local-storage";

describe("LocalStorageRepository", () => {
  beforeEach(() => {
    window.localStorage.clear();
  });

  it("stores and removes favorites", async () => {
    const repo = new LocalStorageRepository("test");
    const entry = makeSavedNumber({ areaCode: "702", local: "PROGRAM" });

    await repo.addFavorite(entry);
    expect(await repo.favorites()).toHaveLength(1);

    await repo.removeFavorite(entry.id);
    expect(await repo.favorites()).toHaveLength(0);
  });

  it("dedupes recents by id, newest first", async () => {
    const repo = new LocalStorageRepository("test");
    const first = makeSavedNumber({ areaCode: "702", local: "PROGRAM" });
    const second = makeSavedNumber({ areaCode: "702", local: "BIGCODE", words: ["BIG", "CODE"] });

    await repo.addRecent(first);
    await repo.addRecent(second);
    await repo.addRecent(first);

    const recents = await repo.recents();
    expect(recents).toHaveLength(2);
    expect(recents[0].id).toBe(first.id);
  });

  it("persists custom word lists", async () => {
    const repo = new LocalStorageRepository("test");
    await repo.saveCustomList({ id: "custom-1", name: "Mine", words: ["GREP", "PIPE"] });
    const lists = await repo.customLists();
    expect(lists[0].name).toBe("Mine");

    await repo.removeCustomList("custom-1");
    expect(await repo.customLists()).toHaveLength(0);
  });

  it("isolates namespaces", async () => {
    const a = new LocalStorageRepository("a");
    const b = new LocalStorageRepository("b");
    await a.addFavorite(makeSavedNumber({ areaCode: "702", local: "PROGRAM" }));
    expect(await b.favorites()).toHaveLength(0);
  });
});
