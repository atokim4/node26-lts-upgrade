import { mkdtempSync, readFileSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { describe, expect, it } from "vitest";
import { run } from "../src/action/main.ts";
import { repo } from "./helpers.ts";

function action(files: Record<string, string>, inputs: Record<string, string> = {}) {
  const workspace = repo(files);
  const out = mkdtempSync(join(tmpdir(), "node26check-gh-"));
  const env: NodeJS.ProcessEnv = { GITHUB_WORKSPACE: workspace, GITHUB_OUTPUT: join(out, "output"), GITHUB_STEP_SUMMARY: join(out, "summary") };
  writeFileSync(env.GITHUB_OUTPUT!, "");
  for (const [k, v] of Object.entries(inputs)) env[`INPUT_${k.toUpperCase()}`] = v;
  const lines: string[] = [];
  const code = run(env, (l) => lines.push(l));
  const read = (p: string) => { try { return readFileSync(p, "utf8"); } catch { return ""; } };
  return { code, log: lines.join("\n"), outputs: read(env.GITHUB_OUTPUT!), summary: read(env.GITHUB_STEP_SUMMARY!), workspace };
}

describe("action", () => {
  it("annotates, writes SARIF, outputs and the summary, and fails on errors", () => {
    const r = action({ Dockerfile: "FROM node:26\nRUN corepack enable\n" });
    expect(r.code).toBe(1);
    expect(r.log).toContain("::error file=Dockerfile,line=2,title=Node 26 LTS%3A corepack-not-bundled::");
    expect(r.outputs).toContain("errors-count=1\n");
    expect(r.outputs).toContain("sarif-file=node26-lts.sarif\n");
    expect(JSON.parse(readFileSync(join(r.workspace, "node26-lts.sarif"), "utf8")).version).toBe("2.1.0");
    expect(r.summary).toContain("## Node 26 LTS upgrade check");
  });

  it("fix: true with pin: 26 rewrites the checkout and passes when nothing is left", () => {
    const r = action({ Dockerfile: "FROM node:lts-alpine\nRUN corepack enable\n" }, { fix: "true", pin: "26" });
    expect(r.code).toBe(0);
    expect(readFileSync(join(r.workspace, "Dockerfile"), "utf8")).toBe("FROM node:26-alpine\nRUN npm install -g corepack@0.36.0 && corepack enable\n");
    expect(r.outputs).toContain("fixed-count=2\n");
  });

  it("notes become ::notice and don't fail by default", () => {
    const r = action({ ".nvmrc": "lts/*\n" }, { format: "markdown" });
    expect(r.code).toBe(0);
    expect(r.log).toContain("::notice file=.nvmrc,line=1");
  });

  it("rejects bad inputs", () => {
    expect(action({}, { "fail-on": "sometimes" }).code).toBe(1);
    expect(action({}, { path: "../outside" }).code).toBe(1);
    expect(action({}, { exclude: "nope" }).code).toBe(1);
    expect(action({}, { pin: "lts" }).code).toBe(1);
  });
});
