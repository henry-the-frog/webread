import { Readability } from "@mozilla/readability";
import { parseHTML } from "linkedom";

export interface ReadResult {
  title: string;
  byline: string | null;
  content: string;
  excerpt: string | null;
  siteName: string | null;
  url: string;
}

function htmlToText(html: string): string {
  return html
    .replace(/<br\s*\/?>/gi, "\n")
    .replace(/<\/?(p|div|h[1-6]|li|tr|blockquote|pre|hr)[^>]*>/gi, "\n")
    .replace(/<[^>]+>/g, "")
    .replace(/&nbsp;/g, " ")
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/\n{3,}/g, "\n\n")
    .trim();
}

export async function readUrl(url: string): Promise<ReadResult> {
  const res = await fetch(url, {
    headers: {
      "User-Agent": "webread/0.1 (https://github.com/henry-the-frog/webread)",
      "Accept": "text/html,application/xhtml+xml",
    },
    redirect: "follow",
  });

  if (!res.ok) {
    throw new Error(`HTTP \${res.status}: \${res.statusText}`);
  }

  const html = await res.text();
  const { document } = parseHTML(html);
  
  const reader = new Readability(document as unknown as Document);
  const article = reader.parse();
  
  if (!article) {
    throw new Error("Could not extract article content from page");
  }

  return {
    title: article.title ?? "",
    byline: article.byline ?? null,
    content: htmlToText(article.content ?? ""),
    excerpt: article.excerpt ?? null,
    siteName: article.siteName ?? null,
    url,
  };
}
