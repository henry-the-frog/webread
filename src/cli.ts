#!/usr/bin/env node
import { readUrl, OutputFormat } from "./reader.js";

const args = process.argv.slice(2);

if (args.includes("--help") || args.includes("-h") || args.length === 0) {
  console.log(`webread - Clean web page reader for AI agents and terminal users

Usage: webread <url> [options]

Options:
  --json         Output as JSON
  --markdown     Output as Markdown (preserves headers, links, bold, etc.)
  --limit <n>    Limit output to first n characters (with word boundary)
  --help, -h     Show this help

Examples:
  webread https://example.com/article
  webread https://example.com/article --markdown
  webread https://example.com/article --limit 2000
  webread url1 url2 --json`);
  process.exit(0);
}

const jsonFlag = args.includes("--json");
const markdownFlag = args.includes("--markdown");
const limitIdx = args.indexOf("--limit");
const limit = limitIdx !== -1 ? parseInt(args[limitIdx + 1], 10) : 0;

const flagArgs = new Set(["--json", "--markdown", "--limit", "--help", "-h"]);
const urls = args.filter((a, i) => !flagArgs.has(a) && !(i > 0 && args[i - 1] === "--limit"));

if (urls.length === 0) {
  console.error("Error: No URLs provided. Run webread --help for usage.");
  process.exit(1);
}

const format: OutputFormat = markdownFlag ? "markdown" : "text";

function truncate(text: string, maxChars: number): string {
  if (!maxChars || text.length <= maxChars) return text;
  const cut = text.slice(0, maxChars);
  const lastSpace = cut.lastIndexOf(" ");
  return (lastSpace > maxChars * 0.8 ? cut.slice(0, lastSpace) : cut) + "\n\n[... truncated]";
}

for (const url of urls) {
  try {
    const result = await readUrl(url, format);
    const content = truncate(result.content, limit);
    
    if (jsonFlag) {
      console.log(JSON.stringify({ ...result, content }, null, 2));
    } else {
      if (result.title) console.log(`# ${result.title}\n`);
      if (result.byline) console.log(`By: ${result.byline}`);
      if (result.siteName) console.log(`Source: ${result.siteName}`);
      console.log(`URL: ${result.url}`);
      console.log(`Words: ${result.wordCount}\n`);
      console.log("---\n");
      console.log(content);
    }
  } catch (err: any) {
    console.error(`Error reading ${url}: ${err.message}`);
    process.exit(1);
  }
}
