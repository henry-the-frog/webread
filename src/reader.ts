import { Readability } from "@mozilla/readability";
import { parseHTML } from "linkedom";

export interface ReadResult {
  title: string;
  byline: string | null;
  content: string;
  excerpt: string | null;
  siteName: string | null;
  url: string;
  wordCount: number;
}

export type OutputFormat = "text" | "markdown" | "json";

export interface ReadOptions {
  format?: OutputFormat;
  selector?: string;
  raw?: boolean;
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

function htmlToMarkdown(html: string): string {
  return html
    .replace(/<h1[^>]*>(.*?)<\/h1>/gi, "# $1\n\n")
    .replace(/<h2[^>]*>(.*?)<\/h2>/gi, "## $1\n\n")
    .replace(/<h3[^>]*>(.*?)<\/h3>/gi, "### $1\n\n")
    .replace(/<h4[^>]*>(.*?)<\/h4>/gi, "#### $1\n\n")
    .replace(/<h5[^>]*>(.*?)<\/h5>/gi, "##### $1\n\n")
    .replace(/<h6[^>]*>(.*?)<\/h6>/gi, "###### $1\n\n")
    .replace(/<(strong|b)[^>]*>(.*?)<\/\1>/gi, "**$2**")
    .replace(/<(em|i)[^>]*>(.*?)<\/\1>/gi, "*$2*")
    .replace(/<a[^>]+href="([^"]*)"[^>]*>(.*?)<\/a>/gi, "[$2]($1)")
    .replace(/<code[^>]*>(.*?)<\/code>/gi, '`$1`')
    .replace(/<pre[^>]*>(.*?)<\/pre>/gis, "\n```\n$1\n```\n")
    .replace(/<li[^>]*>(.*?)<\/li>/gi, "- $1\n")
    .replace(/<\/?(ul|ol)[^>]*>/gi, "\n")
    .replace(/<blockquote[^>]*>(.*?)<\/blockquote>/gis, (_, content) =>
      content.split("\n").map((line: string) => '> ' + line).join("\n") + "\n"
    )
    .replace(/<hr[^>]*\/?>/gi, "\n---\n")
    .replace(/<br\s*\/?>/gi, "\n")
    .replace(/<\/?(p|div|tr)[^>]*>/gi, "\n")
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

export async function readUrl(url: string, formatOrOpts: OutputFormat | ReadOptions = "text"): Promise<ReadResult> {
  const opts: ReadOptions = typeof formatOrOpts === "string" ? { format: formatOrOpts } : formatOrOpts;
  const format = opts.format ?? "text";
  const selector = opts.selector;
  const raw = opts.raw ?? false;

  const res = await fetch(url, {
    headers: {
      "User-Agent": "webread/0.3 (https://github.com/henry-the-frog/webread)",
      "Accept": "text/html,application/xhtml+xml",
    },
    redirect: "follow",
  });

  if (!res.ok) {
    throw new Error('HTTP ' + res.status + ': ' + res.statusText);
  }

  const html = await res.text();
  const { document } = parseHTML(html);

  const converter = format === "markdown" ? htmlToMarkdown : htmlToText;

  // CSS selector mode: extract matching elements directly
  if (selector) {
    const elements = document.querySelectorAll(selector);
    if (elements.length === 0) {
      throw new Error(`No elements matched selector: ${selector}`);
    }
    const htmlParts = Array.from(elements).map((el: any) => el.innerHTML ?? el.textContent ?? "");
    const content = converter(htmlParts.join("\n\n"));
    return {
      title: document.querySelector("title")?.textContent ?? "",
      byline: null,
      content,
      excerpt: null,
      siteName: null,
      url,
      wordCount: content.split(/\s+/).filter(Boolean).length,
    };
  }

  // Raw mode: convert entire body without Readability
  if (raw) {
    const body = document.querySelector("body");
    const content = converter(body?.innerHTML ?? html);
    return {
      title: document.querySelector("title")?.textContent ?? "",
      byline: null,
      content,
      excerpt: null,
      siteName: null,
      url,
      wordCount: content.split(/\s+/).filter(Boolean).length,
    };
  }

  // Default: use Readability for article extraction
  const reader = new Readability(document as unknown as Document);
  const article = reader.parse();
  
  if (!article) {
    throw new Error("Could not extract article content from page");
  }

  const content = converter(article.content ?? "");

  return {
    title: article.title ?? "",
    byline: article.byline ?? null,
    content,
    excerpt: article.excerpt ?? null,
    siteName: article.siteName ?? null,
    url,
    wordCount: content.split(/\s+/).filter(Boolean).length,
  };
}
