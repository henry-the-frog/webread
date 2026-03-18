#!/usr/bin/env node
import { readUrl } from "./reader.js";

const args = process.argv.slice(2);
const jsonFlag = args.includes("--json");
const urls = args.filter(a => !a.startsWith("--"));

if (urls.length === 0) {
  console.error("Usage: webread <url> [--json]");
  console.error("  Fetches a web page and returns clean, readable text.");
  process.exit(1);
}

for (const url of urls) {
  try {
    const result = await readUrl(url);
    
    if (jsonFlag) {
      console.log(JSON.stringify(result, null, 2));
    } else {
      if (result.title) console.log(`# ${result.title}\n`);
      if (result.byline) console.log(`By: ${result.byline}`);
      if (result.siteName) console.log(`Source: ${result.siteName}`);
      console.log(`URL: ${result.url}\n`);
      console.log("---\n");
      console.log(result.content);
    }
  } catch (err: any) {
    console.error(`Error reading ${url}: ${err.message}`);
    process.exit(1);
  }
}
