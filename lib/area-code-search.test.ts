import { describe, expect, it } from "vitest";
import { lookupAreaCode } from "@/data/area-codes";
import { describeAreaCode, nearestAreaCode, searchAreaCodes } from "./area-code-search";

describe("area code search", () => {
  it("includes newer NANPA area codes", () => {
    expect(lookupAreaCode("945")).toBeDefined();
    expect(lookupAreaCode("448")).toBeDefined();
    expect(searchAreaCodes("945")[0]?.code).toBe("945");
  });

  it("finds by code prefix", () => {
    expect(searchAreaCodes("702")[0]?.code).toBe("702");
  });

  it("finds Las Vegas by curated label", () => {
    const codes = searchAreaCodes("las vegas").map((item) => item.code);
    expect(codes).toContain("702");
    expect(codes).toContain("725");
  });

  it("finds by state", () => {
    expect(searchAreaCodes("NV").map((item) => item.code)).toContain("702");
  });

  it("prefers curated labels over the raw dataset city", () => {
    expect(describeAreaCode("702")).toBe("Las Vegas, NV");
  });

  it("finds the nearest area code to a coordinate", () => {
    const nearest = nearestAreaCode(36.1699, -115.1398);
    expect(nearest?.state).toBe("NV");
    expect(["702", "725"]).toContain(nearest?.code);
  });
});
