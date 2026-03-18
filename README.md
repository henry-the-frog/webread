# webread

Clean web page reader for AI agents and terminal users. Fetches a URL and returns just the readable content — no ads, no nav, no clutter.

Uses Mozilla's [Readability](https://github.com/nicknisi/readability) (the same engine behind Firefox Reader View) with [linkedom](https://github.com/nicknisi/linkedom) for HTML parsing.

## Install

```bash
npm install -g webread
# or
npx webread https://example.com
```

## Usage

```bash
# Basic text extraction
webread https://example.com/article

# Markdown output (preserves headers, links, bold, lists)
webread https://example.com/article --markdown

# JSON output
webread https://example.com/article --json

# CSS selector — extract specific elements
webread https://example.com --selector "article .content"
webread https://news.site/page --selector "h2.headline"

# Raw mode — skip Readability, get full page body
webread https://example.com --raw

# Limit output length
webread https://example.com/article --limit 2000

# Combine options
webread https://example.com --selector "main" --markdown --limit 5000

# Multiple URLs
webread url1 url2 --json
```

## Options

| Flag | Description |
|------|-------------|
| `--json` | Output as JSON |
| `--markdown` | Output as Markdown |
| `--selector <css>` | Extract only elements matching CSS selector |
| `--raw` | Skip Readability, convert entire page body |
| `--limit <n>` | Limit output to first n characters |
| `--help`, `-h` | Show help |

## API

```typescript
import { readUrl, ReadOptions } from "webread";

// Simple usage
const result = await readUrl("https://example.com");
console.log(result.title, result.content);

// With options
const result = await readUrl("https://example.com", {
  format: "markdown",
  selector: "article",
  raw: false,
});

// Legacy format string still works
const result = await readUrl("https://example.com", "markdown");
```

### ReadResult

```typescript
interface ReadResult {
  title: string;
  byline: string | null;
  content: string;
  excerpt: string | null;
  siteName: string | null;
  url: string;
  wordCount: number;
}
```

## Why?

AI agents and terminal tools need clean text from web pages. Existing solutions are either too heavy (headless browsers) or too simple (raw HTML stripping). webread hits the sweet spot: Mozilla's battle-tested extraction algorithm in a lightweight CLI.

## License

MIT
