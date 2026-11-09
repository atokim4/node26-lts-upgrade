import { cpSync, readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";
import { main } from "../src/cli.ts";
import { RULES } from "../src/rules.ts";
import { repo } from "./helpers.ts";

const SAMPLE = join(import.meta.dirname, "..", "examples", "sample-app");

function run(args: string[]) {
  let stdout = "";
  let stderr = "";
  const code = main(args, (s) => (stdout += s), (s) => (stderr += s));
  return { code, stdout, stderr };
}

describe("cli", () => {
  it("exits 1 on errors, 0 with --fail-on none, 2 on bad usage", () => {
    const root = repo({ Dockerfile: "FROM node:lts\nRUN corepack enable\n" });
    expect(run([root]).code).toBe(1);
    expect(run([root, "--fail-on", "none"]).code).toBe(0);
    expect(run([root, "--format", "xml"]).code).toBe(2);
    expect(run([root, "--exclude", "no-such-rule"]).code).toBe(2);
    expect(run([root, "--pin", "26"]).code).toBe(2);
    expect(run([root, "--fix", "--pin", "lts"]).code).toBe(2);
    expect(run([join(root, "missing")]).code).toBe(2);
  });

  it("passes a repo that is ready for 26", () => {
    const root = repo({ Dockerfile: "FROM node:26-alpine\nRUN npm install -g corepack@0.36.0 && corepack enable && pnpm i\n", ".nvmrc": "26\n" });
    const r = run([root]);
    expect(r.code).toBe(0);
    expect(r.stdout).toContain("Nothing here breaks on Node 26 LTS");
  });

  it("keeps diffs off stdout for machine-readable formats", () => {
    const root = repo({ Dockerfile: "FROM node:lts\nRUN corepack enable\n" });
    const r = run([root, "--diff", "--format", "json", "--fail-on", "none"]);
    expect(() => JSON.parse(r.stdout)).not.toThrow();
    expect(r.stderr).toContain("+RUN npm install -g corepack@0.36.0 && corepack enable");
  });

  it("--fix --pin 26 rewrites the sample app, and a second run has nothing left to fix", () => {
    const root = repo({});
    cpSync(SAMPLE, root, { recursive: true });
    const first = run([root, "--fix", "--pin", "26", "--fail-on", "none"]);
    expect(first.stdout).toMatch(/Fixed 9 finding\(s\) in 4 file\(s\)/);
    expect(readFileSync(join(root, "Dockerfile"), "utf8")).toContain("FROM node:26-alpine AS build\n");
    expect(readFileSync(join(root, "Dockerfile.docs"), "utf8")).toContain("RUN npm install -g yarn@1.22.22 && yarn install");
    const second = run([root, "--diff", "--pin", "26", "--format", "json", "--fail-on", "none"]);
    const report = JSON.parse(second.stdout) as { findings: { fixable: boolean; rule: string }[] };
    expect(report.findings.filter((f) => f.fixable)).toEqual([]);
    expect(report.findings.map((f) => f.rule)).toContain("dep0063-writeheader");
  });

  it("writes SARIF 2.1.0 with every rule and its source", () => {
    const r = run([SAMPLE, "--format", "sarif", "--fail-on", "none"]);
    const sarif = JSON.parse(r.stdout);
    expect(sarif.version).toBe("2.1.0");
    const run0 = sarif.runs[0];
    expect(run0.tool.driver.rules).toHaveLength(RULES.length);
    for (const res of run0.results) {
      expect(run0.tool.driver.rules[res.ruleIndex].id).toBe(res.ruleId);
      expect(res.locations[0].physicalLocation.region.startLine).toBeGreaterThan(0);
    }
    expect(run0.tool.driver.rules[0].helpUri).toBe("https://github.com/nodejs/node/commit/f31c88021b5b815bf776066c8eca510696b8c744");
  });

  it("renders a Markdown table with DEP codes linked to the deprecations page", () => {
    const r = run([SAMPLE, "--format", "markdown", "--fail-on", "none"]);
    expect(r.stdout).toContain("| Level | Where | Rule | What to change |");
    expect(r.stdout).toContain("[DEP0063](https://nodejs.org/api/deprecations.html#dep0063-serverresponseprototypewriteheader)");
  });

  it("lists the rules with their sources", () => {
    const r = run(["--list-rules"]);
    expect(r.stdout.split("\n").filter((l) => l.includes("https://")).length).toBe(RULES.length);
  });
});
