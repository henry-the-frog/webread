# webread

A clean web page reader for AI agents and terminal users. Fetches a URL, extracts the article content using Mozilla's Readability algorithm, and returns clean text or Markdown.

## Why?

AI agents and CLI users often need to read web pages but get buried in HTML, ads, and navigation. `webread` strips all of that away and gives you just the content.

## Install

```bash
npm install -g webread
```

## Usage

```bash
# Read a web page as clean text
webread https://example.com/article

# Output as Markdown (preserves headers, links, bold, etc.)
webread https://example.com/article --markdown

# Limit output to first 2000 characters (word-boundary aware)
webread https://example.com/article --limit 2000

# Output as JSON (for programmatic use)
webread https://example.com/article --json

# Multiple URLs
webread https://example.com/one https://example.com/two
```

## Output

Default output includes a header with title, author, source, URL, and word count, followed by the article text.

### Markdown mode

With `--markdown`, the output preserves:
- Headers (`#`, `##`, etc.)
- Bold and italic
- Links (`[text](url)`)
- Code blocks
- Lists
- Blockquotes

This is useful for feeding content into LLMs or note-taking systems that understand Markdown.

### JSON mode

With `--json`, returns a structured object:

```json
{
  "title": "Article Title",
  "byline": "Author Name",
  "content": "The article text...",
  "excerpt": "A brief summary",
  "siteName": "Example.com",
  "url": "https://example.com/article",
  "wordCount": 1234
}
```

## API

```typescript
import { readUrl } from "webread";

const result = await readUrl("https://example.com", "markdown");
console.log(result.content);    // Markdown text
console.log(result.wordCount);  // 1234
```

## How it works

1. Fetches the page with a minimal User-Agent
2. Parses HTML with [linkedom](https://github.com/WebReflection/linkedom)
3. Extracts article content with [Mozilla Readability](https://github.com/mozilla/readability) (same algorithm as Firefox Reader View)
4. Converts to clean text or Markdown

## License

MIT
