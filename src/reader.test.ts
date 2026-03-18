import { describe, it, expect, vi } from "vitest";
import { readUrl } from "./reader.js";

// We can't easily unit-test htmlToText/htmlToMarkdown since they're not exported.
// Instead, test through readUrl with mocked fetch.

const SAMPLE_HTML = `
<!DOCTYPE html>
<html>
<head><title>Test Article</title></head>
<body>
<article>
  <h1>Test Article</h1>
  <p>By <strong>John Doe</strong></p>
  <p>This is the first paragraph of a test article about <em>interesting things</em>.</p>
  <p>Here is a <a href="https://example.com">link</a> to somewhere.</p>
  <ul>
    <li>Item one</li>
    <li>Item two</li>
    <li>Item three</li>
  </ul>
  <blockquote>A wise quote about testing.</blockquote>
  <p>And some <code>inline code</code> for good measure.</p>
  <pre>const x = 42;</pre>
  <p>Final paragraph with entities: &amp; &lt; &gt; &quot; &#39;</p>
</article>
</body>
</html>
`;

function mockFetch(html: string, status = 200) {
  return vi.fn().mockResolvedValue({
    ok: status >= 200 && status < 300,
    status,
    statusText: status === 200 ? "OK" : "Not Found",
    text: () => Promise.resolve(html),
  });
}

describe("readUrl", () => {
  it("extracts article content as text", async () => {
    vi.stubGlobal("fetch", mockFetch(SAMPLE_HTML));
    const result = await readUrl("https://example.com/article", "text");

    expect(result.title).toBe("Test Article");
    expect(result.url).toBe("https://example.com/article");
    expect(result.content).toContain("interesting things");
    expect(result.content).toContain("Item one");
    expect(result.content).not.toContain("<p>");
    expect(result.content).not.toContain("<strong>");
    expect(result.wordCount).toBeGreaterThan(0);

    vi.unstubAllGlobals();
  });

  it("extracts article content as markdown", async () => {
    vi.stubGlobal("fetch", mockFetch(SAMPLE_HTML));
    const result = await readUrl("https://example.com/article", "markdown");

    expect(result.content).toContain("**");  // bold markers
    expect(result.content).toContain("*interesting things*");
    expect(result.content).toContain("[link](https://example.com)");
    expect(result.content).toContain("- Item one");
    expect(result.content).toContain("`inline code`");
    expect(result.content).not.toContain("<p>");

    vi.unstubAllGlobals();
  });

  it("decodes HTML entities", async () => {
    vi.stubGlobal("fetch", mockFetch(SAMPLE_HTML));
    const result = await readUrl("https://example.com/article", "text");

    expect(result.content).toContain("& < > \" '");

    vi.unstubAllGlobals();
  });

  it("throws on HTTP errors", async () => {
    vi.stubGlobal("fetch", mockFetch("Not Found", 404));

    await expect(readUrl("https://example.com/missing")).rejects.toThrow("HTTP 404");

    vi.unstubAllGlobals();
  });

  it("throws when content cannot be extracted", async () => {
    vi.stubGlobal("fetch", mockFetch("<html><body></body></html>"));

    await expect(readUrl("https://example.com/empty")).rejects.toThrow("Could not extract");

    vi.unstubAllGlobals();
  });

  it("reports correct word count", async () => {
    vi.stubGlobal("fetch", mockFetch(SAMPLE_HTML));
    const result = await readUrl("https://example.com/article", "text");

    const manualCount = result.content.split(/\s+/).filter(Boolean).length;
    expect(result.wordCount).toBe(manualCount);

    vi.unstubAllGlobals();
  });
});
