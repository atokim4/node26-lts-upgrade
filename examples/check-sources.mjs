// Fetches every rule's source page and checks that the anchor it links to is still there.
// Usage: node examples/check-sources.mjs   (Node 22.18+, it imports the TypeScript rules directly)
import { RULES } from "../src/rules.ts";

const pages = new Map();
async function page(url) {
  if (!pages.has(url)) pages.set(url, fetch(url, { headers: { "user-agent": "node26-lts-upgrade source check" } }).then(async (r) => ({ status: r.status, text: r.ok ? await r.text() : "" })));
  return pages.get(url);
}

let failed = 0;
for (const rule of RULES) {
  const [url, anchor] = rule.source.split("#");
  const { status, text } = await page(url);
  // nodejs.org renders ids and hrefs without quotes; GitHub renders README headings as id="user-content-…".
  const found = !anchor || [`id=${anchor}`, `id="${anchor}"`, `#${anchor}`, `user-content-${anchor}`].some((s) => text.includes(s));
  const ok = status === 200 && found;
  if (!ok) failed++;
  console.log(`${ok ? "ok  " : "FAIL"} ${rule.id.padEnd(34)} ${status} ${rule.source}`);
}
console.log(failed ? `${failed} source(s) failed` : `all ${RULES.length} sources reachable, anchors present`);
process.exitCode = failed ? 1 : 0;
