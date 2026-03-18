import { describe, it, expect } from "vitest";
import { readUrl } from "./reader.js";

describe("selector and raw modes", () => {
  it("selector extracts matching elements", async () => {
    const result = await readUrl("https://example.com", { selector: "h1" });
    expect(result.content).toContain("Example Domain");
    expect(result.wordCount).toBeGreaterThan(0);
  });

  it("raw mode returns full page content", async () => {
    const result = await readUrl("https://example.com", { raw: true });
    expect(result.content).toContain("Example Domain");
    expect(result.wordCount).toBeGreaterThan(0);
  });

  it("selector with no matches throws", async () => {
    await expect(
      readUrl("https://example.com", { selector: ".nonexistent-class-xyz" })
    ).rejects.toThrow("No elements matched selector");
  });

  it("selector with format option works", async () => {
    const result = await readUrl("https://example.com", { selector: "p", format: "markdown" });
    expect(result.content.length).toBeGreaterThan(0);
  });
});
