# webread

A clean web page reader for AI agents and terminal users. Fetches a URL, extracts the article content using Mozilla's Readability algorithm, and returns clean plain text.

## Why?

AI agents and CLI users often need to read web pages but get buried in HTML, ads, and navigation. `webread` strips all of that away and gives you just the article text.

## Install

```bash
npm install -g webread
```

## Usage

```bash
# Read a web page as clean text
webread https://example.com/article

# Output as JSON (for programmatic use)
webread https://example.com/article --json

# Multiple URLs
webread https://example.com/one https://example.com/two
```

## Output

```
# Article Title

By: Author Name
Source: Site Name
URL: https://example.com/article

---

The article content as clean, readable plain text...
```

## API

```typescript
import { readUrl } from "webread";

const result = await readUrl("https://example.com");
console.log(result.title);   // Article title
console.log(result.content);  // Clean text
console.log(result.byline);   // Author
```

## Built With

- [@mozilla/readability](https://github.com/mozilla/readability) — Article extraction (same algorithm as Firefox Reader View)
- [linkedom](https://github.com/WebReflection/linkedom) — Fast HTML parsing

## License

MIT
