import { relative } from "node:path";
import { ruleMeta } from "../rules.ts";
import { counts, type ScanResult } from "../scan.ts";
import type { Severity } from "../types.ts";

const COLORS: Record<Severity, string> = { error: "\x1b[31m", warning: "\x1b[33m", note: "\x1b[36m" };
const RESET = "\x1b[0m";
const DIM = "\x1b[2m";
const NONE = "Nothing here breaks on Node 26 LTS as far as these rules can tell.";

export function textReport(result: ScanResult, color = false): string {
  const paint = (s: string, code: string) => (color ? `${code}${s}${RESET}` : s);
  const lines: string[] = [];
  const kinds = Object.entries(result.scanned).map(([k, n]) => `${n} ${k}`).join(", ") || "no files these rules read";
  lines.push(`Scanned ${kinds}. Repo pin: ${result.repoPin}.`);
  if (result.truncated) lines.push("Stopped after 30000 files; run it on a smaller folder for a full scan.");
  if (result.findings.length === 0) {
    lines.push(NONE);
    return `${lines.join("\n")}\n`;
  }
  lines.push("");
  for (const f of result.findings) {
    const fixable = f.edits ? paint(" [fixable]", DIM) : "";
    lines.push(`${f.file}:${f.line}  ${paint(f.severity.padEnd(7), COLORS[f.severity])} ${f.rule}${fixable}`);
    lines.push(`  ${f.message.replace(/`/g, "")}`);
    if (f.snippet) lines.push(paint(`  > ${f.snippet.length > 160 ? `${f.snippet.slice(0, 157)}...` : f.snippet}`, DIM));
  }
  const c = counts(result.findings);
  const fixable = result.findings.filter((f) => f.edits).length;
  lines.push("");
  lines.push(`${c.error} error(s), ${c.warning} warning(s), ${c.note} note(s); ${fixable} can be rewritten with --fix.`);
  return `${lines.join("\n")}\n`;
}

export function jsonReport(result: ScanResult): string {
  return `${JSON.stringify(
    {
      root: relative(process.cwd(), result.root) || ".",
      repoPin: result.repoPin,
      counts: counts(result.findings),
      scanned: result.scanned,
      findings: result.findings.map(({ edits, ...f }) => ({ ...f, fixable: Boolean(edits), source: ruleMeta(f.rule).source, dep: ruleMeta(f.rule).dep })),
    },
    null,
    2,
  )}\n`;
}

export { NONE };
