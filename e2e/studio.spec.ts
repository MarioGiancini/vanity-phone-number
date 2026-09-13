import { expect, test } from "@playwright/test";

test("spell a word into a number", async ({ page }) => {
  await page.goto("/");
  await expect(page.getByRole("heading", { name: "Vanity Phone Number Studio" })).toBeVisible();

  await page.getByRole("button", { name: "PROGRAM", exact: true }).click();
  await expect(page.getByText("702-PROGRAM").first()).toBeVisible();
  await expect(page.getByText("702-776-4726").first()).toBeVisible();
});

test("dial pad builds letters on the phone screen", async ({ page }) => {
  await page.goto("/");
  await page.getByRole("button", { name: "Letter P" }).click();
  await page.getByRole("button", { name: "Letter R" }).click();
  await page.getByRole("button", { name: "Letter O" }).click();
  await expect(page.getByText("PRO", { exact: false }).first()).toBeVisible();
});

test("combos generate multi-word candidates", async ({ page }) => {
  await page.goto("/");
  await page.getByRole("tab", { name: "Combos" }).click();
  await page.getByLabel("Filter results").fill("BIGCODE");
  await expect(page.getByText("702-BIG-CODE").first()).toBeVisible();
  await expect(page.getByText("702-244-2633").first()).toBeVisible();
});

test("decode reverses a numeric number", async ({ page }) => {
  await page.goto("/");
  await page.getByRole("tab", { name: "Decode" }).click();
  await page.getByLabel("Number to decode").fill("7764726");
  await expect(page.getByText("702-PROGRAM").first()).toBeVisible();
});

test("agent-readiness surfaces respond", async ({ request }) => {
  const surfaces = [
    ["/robots.txt", "text/plain"],
    ["/llms.txt", "text/plain"],
    ["/openapi.json", "application/json"],
    ["/.well-known/api-catalog", "application/linkset+json"],
    ["/.well-known/mcp/server-card", "application/json"],
    ["/.well-known/agent.json", "application/json"],
    ["/auth.md", "text/markdown"],
  ] as const;

  for (const [path, type] of surfaces) {
    const response = await request.get(path);
    expect(response.status(), `${path} status`).toBe(200);
    expect(response.headers()["content-type"], `${path} content-type`).toContain(type);
  }
});

test("docs page server-renders", async ({ page }) => {
  await page.goto("/docs");
  await expect(page.getByRole("heading", { name: "Agent API" })).toBeVisible();
  await expect(page.getByText("/openapi.json").first()).toBeVisible();
});
