// One block per rule: what it reports, what it must leave alone, and the --fix output where it has one.
// Fixtures follow the shapes reported in public GitHub issues since node:lts moved to 26 (none of their code).
import { describe, expect, it } from "vitest";
import { RULES } from "../src/rules.ts";
import { findings, fixed, setupNode, workflow } from "./helpers.ts";

const PNPM_PKG = JSON.stringify({ name: "app", private: true, packageManager: "pnpm@10.34.9" }, null, 2);

describe("corepack-not-bundled", () => {
  it("errors on a node:lts-alpine stage and inserts the npm install (Docker build shape)", () => {
    const files = { Dockerfile: "FROM node:lts-alpine\nWORKDIR /app\nRUN corepack enable && pnpm install --frozen-lockfile\n" };
    const [f] = findings(files, "corepack-not-bundled");
    expect(f).toMatchObject({ severity: "error", line: 3 });
    expect(f!.message).toContain("Node 26 LTS");
    expect(fixed(files, "Dockerfile")).toContain("RUN npm install -g corepack@0.36.0 && corepack enable && pnpm install --frozen-lockfile\n");
  });

  it("handles ; chains, RUN --mount flags and a stage built from another stage", () => {
    const files = {
      Dockerfile: "FROM node:26 AS base\nFROM base AS build\nRUN --mount=type=cache,target=/root/.cache corepack enable ; yarn set version stable ; yarn install\n",
    };
    expect(fixed(files, "Dockerfile")).toContain("RUN --mount=type=cache,target=/root/.cache npm install -g corepack@0.36.0 && corepack enable ; yarn set version stable");
  });

  it("is fine once corepack is installed from npm, in the same stage or a parent stage", () => {
    expect(findings({ Dockerfile: "FROM node:lts\nRUN npm i -g corepack@0.36.0\nRUN corepack enable\n" }, "corepack-not-bundled")).toEqual([]);
    expect(findings({ Dockerfile: "FROM node:26 AS base\nRUN npm install --global corepack\nFROM base\nRUN corepack enable\n" }, "corepack-not-bundled")).toEqual([]);
  });

  it("is a note on a pinned Node 24 image and gets no rewrite", () => {
    const [f] = findings({ Dockerfile: "FROM node:24-alpine\nRUN corepack enable\n" }, "corepack-not-bundled");
    expect(f!.severity).toBe("note");
    expect(f!.edits).toBeUndefined();
  });

  it("follows setup-node: lts/* after the setup step, the runner's Node 22 before it", () => {
    const wf = workflow(`- run: corepack --version\n${setupNode("lts/*")}\n- run: corepack enable`);
    const list = findings({ ".github/workflows/ci.yml": wf }, "corepack-not-bundled");
    expect(list).toHaveLength(1);
    expect(list[0]).toMatchObject({ severity: "note", line: 8 });
  });

  it("resolves a matrix to its newest leg and node-version-file to .nvmrc", () => {
    const matrix = `name: ci
on: push
jobs:
  test:
    runs-on: ubuntu-latest
    strategy:
      matrix:
        node: [22, 24, 26]
    steps:
      - uses: actions/setup-node@v6
        with:
          node-version: \${{ matrix.node }}
      - run: corepack enable
`;
    expect(findings({ ".github/workflows/ci.yml": matrix }, "corepack-not-bundled")[0]!.severity).toBe("error");
    const file = workflow(`- uses: actions/setup-node@v6\n  with:\n    node-version-file: .nvmrc\n- run: corepack enable`);
    expect(findings({ ".github/workflows/ci.yml": file, ".nvmrc": "26\n" }, "corepack-not-bundled")[0]!.severity).toBe("error");
    expect(findings({ ".github/workflows/ci.yml": file, ".nvmrc": "22\n" }, "corepack-not-bundled")[0]!.severity).toBe("note");
  });

  it("covers GitLab job images, Jenkins docker agents and netlify NODE_VERSION", () => {
    const gitlab = "image: node:24\n\nbuild:\n  image: node:lts-alpine\n  script:\n    - corepack enable\n    - pnpm build\n";
    expect(findings({ ".gitlab-ci.yml": gitlab }, "corepack-not-bundled")[0]).toMatchObject({ severity: "error", line: 6 });
    const jenkins = "pipeline {\n  agent { docker { image 'node:lts' } }\n  stages { stage('b') { steps { sh 'corepack enable && pnpm i' } } }\n}\n";
    const j = findings({ Jenkinsfile: jenkins }, "corepack-not-bundled")[0]!;
    expect(j.severity).toBe("error");
    expect(j.edits).toBeUndefined();
    const netlify = '[build]\n  command = "corepack enable && pnpm build"\n[build.environment]\n  NODE_VERSION = "26"\n';
    expect(fixed({ "netlify.toml": netlify }, "netlify.toml")).toContain('command = "npm install -g corepack@0.36.0 && corepack enable && pnpm build"');
  });

  it("warns for scripts when the repo has no pin, and caps agent docs at warning", () => {
    expect(findings({ "package.json": '{ "scripts": { "setup": "corepack enable" } }' }, "corepack-not-bundled")[0]!.severity).toBe("warning");
    const doc = findings({ "AGENTS.md": "Run `corepack enable` first.\n", ".nvmrc": "lts/*\n" }, "corepack-not-bundled")[0]!;
    expect(doc.severity).toBe("warning");
  });

  it("does not rewrite a stage that runs as a non-root USER", () => {
    const [f] = findings({ Dockerfile: "FROM node:26\nUSER node\nRUN corepack enable\n" }, "corepack-not-bundled");
    expect(f!.edits).toBeUndefined();
    expect(f!.message).toContain("USER node");
  });

  it("mentions the EBADENGINE warning on Node 25", () => {
    expect(findings({ Dockerfile: "FROM node:25\nRUN corepack enable\n" }, "corepack-not-bundled")[0]!.message).toContain("EBADENGINE");
  });
});

describe("yarn-not-in-node26-image", () => {
  it("errors on yarn in a node:lts image and installs Yarn 1", () => {
    const files = { Dockerfile: "FROM node:lts\nWORKDIR /app\nRUN yarn install --frozen-lockfile\n" };
    expect(findings(files, "yarn-not-in-node26-image")[0]!.severity).toBe("error");
    expect(fixed(files, "Dockerfile")).toContain("RUN npm install -g yarn@1.22.22 && yarn install --frozen-lockfile");
  });

  it("goes through corepack for a Yarn 2+ packageManager", () => {
    const files = { Dockerfile: "FROM node:26-slim\nRUN yarn install --immutable\n", "package.json": '{ "packageManager": "yarn@4.10.3" }' };
    expect(fixed(files, "Dockerfile")).toContain("RUN npm install -g corepack@0.36.0 && corepack enable && yarn install --immutable");
  });

  it("is a note on Node 25 images, and quiet for installed yarn and GitHub-hosted runners", () => {
    const [n] = findings({ Dockerfile: "FROM node:25\nRUN yarn build\n" }, "yarn-not-in-node26-image");
    expect(n).toMatchObject({ severity: "note", edits: undefined });
    expect(findings({ Dockerfile: "FROM node:26\nRUN apk add yarn && yarn build\n" }, "yarn-not-in-node26-image")).toEqual([]);
    expect(findings({ ".github/workflows/ci.yml": workflow(`${setupNode("26")}\n- run: yarn build`) }, "yarn-not-in-node26-image")).toEqual([]);
  });

  it("covers GitHub container jobs", () => {
    const wf = "on: push\njobs:\n  b:\n    runs-on: ubuntu-latest\n    container: node:lts\n    steps:\n      - run: yarn install\n";
    expect(findings({ ".github/workflows/ci.yml": wf }, "yarn-not-in-node26-image")[0]!.severity).toBe("error");
  });
});

describe("package-manager-not-installed", () => {
  it("warns when pnpm from packageManager runs with nothing installing it", () => {
    const files = { "package.json": PNPM_PKG, Dockerfile: "FROM node:26-alpine\nRUN pnpm install --frozen-lockfile\n" };
    const [f] = findings(files, "package-manager-not-installed");
    expect(f!.severity).toBe("warning");
    expect(fixed(files, "Dockerfile")).toContain("RUN npm install -g pnpm@10.34.9 && pnpm install --frozen-lockfile");
  });

  it("flags Yarn 4 on a hosted runner, where the preinstalled Yarn 1 refuses to run it", () => {
    const files = { "package.json": '{ "packageManager": "yarn@4.10.3" }', ".github/workflows/ci.yml": workflow(`${setupNode("lts/*")}\n- run: yarn install --immutable`) };
    expect(findings(files, "package-manager-not-installed")).toHaveLength(1);
  });

  it("is quiet with pnpm/action-setup, a corepack line (its own rule) or a Node 24 pin", () => {
    const action = workflow(`- uses: pnpm/action-setup@v6\n${setupNode("26")}\n- run: pnpm install`);
    expect(findings({ "package.json": PNPM_PKG, ".github/workflows/ci.yml": action }, "package-manager-not-installed")).toEqual([]);
    expect(findings({ "package.json": PNPM_PKG, Dockerfile: "FROM node:26\nRUN corepack enable && pnpm i\n" }, "package-manager-not-installed")).toEqual([]);
    expect(findings({ "package.json": PNPM_PKG, Dockerfile: "FROM node:24\nRUN pnpm i\n" }, "package-manager-not-installed")).toEqual([]);
  });
});

describe("setup-node-cache-before-pm", () => {
  it("errors on cache: pnpm before pnpm is installed", () => {
    const wf = workflow(`${setupNode("26", "cache: pnpm")}\n- uses: pnpm/action-setup@v6\n- run: pnpm install`);
    expect(findings({ ".github/workflows/ci.yml": wf }, "setup-node-cache-before-pm")[0]).toMatchObject({ severity: "error", line: 8 });
  });

  it("passes when pnpm/action-setup comes first, and for cache: yarn on hosted runners", () => {
    const ok = workflow(`- uses: pnpm/action-setup@v6\n${setupNode("26", "cache: pnpm")}`);
    expect(findings({ ".github/workflows/ci.yml": ok }, "setup-node-cache-before-pm")).toEqual([]);
    expect(findings({ ".github/workflows/ci.yml": workflow(setupNode("26", "cache: yarn")) }, "setup-node-cache-before-pm")).toEqual([]);
  });

  it("errors on cache: yarn inside a node:26 container", () => {
    const wf = "on: push\njobs:\n  b:\n    runs-on: ubuntu-latest\n    container:\n      image: node:26\n    steps:\n      - uses: actions/setup-node@v6\n        with:\n          cache: yarn\n";
    expect(findings({ ".github/workflows/ci.yml": wf }, "setup-node-cache-before-pm")[0]!.severity).toBe("error");
  });
});

describe("setup-node-v5-auto-cache", () => {
  it("warns on setup-node@v5 with a pnpm packageManager and no cache input", () => {
    const wf = workflow(`- uses: actions/setup-node@v5\n  with:\n    node-version: 26\n- run: npm i -g pnpm@10.34.9 && pnpm i`);
    expect(findings({ ".github/workflows/ci.yml": wf, "package.json": PNPM_PKG }, "setup-node-v5-auto-cache")).toHaveLength(1);
  });

  it("is quiet on v6, or with package-manager-cache: false", () => {
    const v6 = workflow(`- uses: actions/setup-node@v6\n  with:\n    node-version: 26`);
    const off = workflow(`- uses: actions/setup-node@v5\n  with:\n    node-version: 26\n    package-manager-cache: false`);
    expect(findings({ ".github/workflows/ci.yml": v6, "package.json": PNPM_PKG }, "setup-node-v5-auto-cache")).toEqual([]);
    expect(findings({ ".github/workflows/ci.yml": off, "package.json": PNPM_PKG }, "setup-node-v5-auto-cache")).toEqual([]);
  });
});

describe("removed-transform-types-flag", () => {
  it("finds the flag in scripts, Dockerfile ENV and workflow env, not in comments", () => {
    expect(findings({ "package.json": '{ "scripts": { "dev": "node --experimental-transform-types src/main.ts" } }', ".nvmrc": "26\n" }, "removed-transform-types-flag")[0]!.severity).toBe("error");
    expect(findings({ Dockerfile: "FROM node:26\nENV NODE_OPTIONS=--experimental-transform-types\n" }, "removed-transform-types-flag")[0]!.severity).toBe("error");
    expect(findings({ Dockerfile: "FROM node:26\n# was --experimental-transform-types\n" }, "removed-transform-types-flag")).toEqual([]);
  });

  it("is a note while the repo pins 24", () => {
    expect(findings({ "run.sh": "node --experimental-transform-types x.ts\n", ".nvmrc": "24\n" }, "removed-transform-types-flag")[0]!.severity).toBe("note");
  });
});

describe("floating-node-version", () => {
  it("notes floating tags and pins them only with --pin", () => {
    const files = {
      Dockerfile: "FROM node:lts-alpine AS build\nFROM node:alpine\nFROM node\nFROM node:26-slim\nFROM node:lts@sha256:0000\n",
      ".nvmrc": "lts/*\n",
      ".github/workflows/ci.yml": workflow(setupNode("lts/*")),
    };
    const list = findings(files, "floating-node-version");
    expect(list.map((f) => `${f.file}:${f.line}`)).toEqual([".github/workflows/ci.yml:10", ".nvmrc:1", "Dockerfile:1", "Dockerfile:2", "Dockerfile:3"]);
    expect(list.every((f) => !f.edits)).toBe(true);
    expect(fixed(files, "Dockerfile", { pin: 26 })).toBe("FROM node:26-alpine AS build\nFROM node:26-alpine\nFROM node:26\nFROM node:26-slim\nFROM node:lts@sha256:0000\n");
    expect(fixed(files, ".nvmrc", { pin: 26 })).toBe("26\n");
    expect(fixed(files, ".github/workflows/ci.yml", { pin: 26 })).toContain("node-version: 26\n");
  });

  it("pins at the ARG when FROM takes its tag from one", () => {
    const files = { Dockerfile: "ARG NODE_VERSION=lts\nFROM node:${NODE_VERSION}-slim\nRUN npm ci\n" };
    expect(findings(files, "floating-node-version")).toHaveLength(1);
    expect(fixed(files, "Dockerfile", { pin: 26 })).toBe("ARG NODE_VERSION=26\nFROM node:${NODE_VERSION}-slim\nRUN npm ci\n");
  });

  it("pins quoted setup-node values and floating matrix legs", () => {
    const matrix = "on: push\njobs:\n  t:\n    runs-on: ubuntu-latest\n    strategy:\n      matrix:\n        node: [22, 'lts/*']\n    steps:\n      - uses: actions/setup-node@v6\n        with:\n          node-version: ${{ matrix.node }}\n";
    expect(fixed({ ".github/workflows/ci.yml": matrix }, ".github/workflows/ci.yml", { pin: 26 })).toContain("node: [22, '26']");
    const quoted = workflow(setupNode("'lts/*'"));
    expect(fixed({ ".github/workflows/ci.yml": quoted }, ".github/workflows/ci.yml", { pin: 26 })).toContain("node-version: '26'");
  });
});

describe("engines-exclude-node26", () => {
  it("warns when the repo runs on 26 and engines leaves it out", () => {
    const files = { "package.json": '{ "engines": { "node": "^20 || ^22 || ^24" } }', Dockerfile: "FROM node:lts\n" };
    const [f] = findings(files, "engines-exclude-node26");
    expect(f).toMatchObject({ severity: "warning", line: 1 });
    expect(f!.message).toContain("node:lts");
  });

  it("is a note without a 26 runtime, and quiet for open ranges", () => {
    expect(findings({ "package.json": '{ "engines": { "node": "<25" } }' }, "engines-exclude-node26")[0]!.severity).toBe("note");
    expect(findings({ "package.json": '{ "engines": { "node": ">=20" } }', Dockerfile: "FROM node:lts\n" }, "engines-exclude-node26")).toEqual([]);
  });

  it("warns when a job runs 25 and the range skips it", () => {
    const files = { "package.json": '{ "engines": { "node": "^22 || ^24 || >=26" } }', Dockerfile: "FROM node:25\n" };
    expect(findings(files, "engines-exclude-node26")[0]!.message).toContain("Node 25");
  });
});

describe("node-version-mismatch", () => {
  it("warns when .nvmrc pins 22 and the image floats to 26", () => {
    const [f] = findings({ ".nvmrc": "22\n", Dockerfile: "FROM node:lts-slim\n" }, "node-version-mismatch");
    expect(f!.message).toContain("pins Node 22");
  });

  it("is quiet when they agree or the image is older", () => {
    expect(findings({ ".nvmrc": "26\n", Dockerfile: "FROM node:lts\n" }, "node-version-mismatch")).toEqual([]);
    expect(findings({ ".nvmrc": "22\n", Dockerfile: "FROM node:20\n" }, "node-version-mismatch")).toEqual([]);
  });
});

describe("dependency-engines-exclude-node26", () => {
  it("lists npm and pnpm lockfile packages whose engines leave out 26", () => {
    const npmLock = JSON.stringify({
      lockfileVersion: 3,
      packages: {
        "": { name: "app" },
        "node_modules/old-tool": { version: "1.2.3", engines: { node: "^18 || ^20 || ^22" } },
        "node_modules/fine": { version: "2.0.0", engines: { node: ">=18" } },
      },
    });
    const [f] = findings({ "package-lock.json": npmLock }, "dependency-engines-exclude-node26");
    expect(f!.message).toContain("old-tool@1.2.3 (^18 || ^20 || ^22)");
    expect(f!.message).not.toContain("fine@");
    const pnpmLock = "lockfileVersion: '9.0'\n\npackages:\n\n  old-tool@1.2.3:\n    resolution: {integrity: sha512-x}\n    engines: {node: '>=18 <25'}\n\n  fine@2.0.0:\n    resolution: {integrity: sha512-y}\n    engines: {node: '>=18'}\n";
    expect(findings({ "pnpm-lock.yaml": pnpmLock }, "dependency-engines-exclude-node26")[0]!.message).toContain("old-tool@1.2.3 (>=18 <25)");
  });
});

describe("native-addon-rebuild", () => {
  it("lists addons built per ABI, not Node-API-only or plain install scripts", () => {
    const lock = JSON.stringify({
      lockfileVersion: 3,
      packages: {
        "node_modules/better-sqlite3": { version: "11.0.0", hasInstallScript: true, dependencies: { bindings: "^1.5.0", "prebuild-install": "^7.1.1" } },
        "node_modules/napi-only": { version: "1.0.0", hasInstallScript: true, dependencies: { "node-addon-api": "^8.0.0" } },
        "node_modules/esbuild": { version: "0.25.0", hasInstallScript: true },
        "node_modules/gyp-thing": { version: "0.1.0", hasInstallScript: true, gypfile: true },
      },
    });
    const [f] = findings({ "package-lock.json": lock }, "native-addon-rebuild");
    expect(f!.message).toContain("better-sqlite3@11.0.0");
    expect(f!.message).toContain("gyp-thing@0.1.0");
    expect(f!.message).not.toContain("esbuild");
    expect(f!.message).not.toContain("napi-only");
    expect(f!.message).toContain("147");
  });
});

describe("node-modules-cache-key", () => {
  it("warns on node_modules cached without the Node version under lts/*", () => {
    const wf = workflow(`${setupNode("lts/*")}\n- uses: actions/cache@v4\n  with:\n    path: node_modules\n    key: \${{ runner.os }}-node-\${{ hashFiles('package-lock.json') }}`);
    expect(findings({ ".github/workflows/ci.yml": wf }, "node-modules-cache-key")[0]!.severity).toBe("warning");
  });

  it("accepts keys with the Node version, and store caches", () => {
    const keyed = workflow(`${setupNode("lts/*")}\n- uses: actions/cache@v4\n  with:\n    path: node_modules\n    key: \${{ runner.os }}-\${{ steps.node.outputs.node-version }}-\${{ hashFiles('package-lock.json') }}`);
    const store = workflow(`${setupNode("lts/*")}\n- uses: actions/cache@v4\n  with:\n    path: ~/.npm\n    key: npm-\${{ hashFiles('package-lock.json') }}`);
    expect(findings({ ".github/workflows/ci.yml": keyed }, "node-modules-cache-key")).toEqual([]);
    expect(findings({ ".github/workflows/ci.yml": store }, "node-modules-cache-key")).toEqual([]);
  });
});

describe("source API rules", () => {
  const src = (code: string, rule: string, extra: Record<string, string> = {}) => findings({ "src/a.js": code, ...extra }, rule);

  it("dep0193-stream-internals: require, import and node: forms", () => {
    expect(src("const T = require('_stream_transform');", "dep0193-stream-internals")[0]!.message).toContain("require('node:stream').Transform");
    expect(src("import Readable from 'node:_stream_readable';", "dep0193-stream-internals")).toHaveLength(1);
    expect(src("const w = require('_stream_wrap');", "dep0193-stream-internals")[0]!.message).toContain("DEP0125");
    expect(src("// require('_stream_readable')\nconst s = require('node:stream');", "dep0193-stream-internals")).toEqual([]);
  });

  it("dep0063-writeheader: only on http responses", () => {
    expect(src("const http = require('node:http');\nhttp.createServer((req, res) => { res.writeHeader(200); });", "dep0063-writeheader")).toHaveLength(1);
    expect(src("csv.writeHeader(['a', 'b']);", "dep0063-writeheader")).toEqual([]);
  });

  it("dep0030-slowbuffer", () => {
    expect(src("const { SlowBuffer } = require('buffer');\nconst b = new SlowBuffer(10);", "dep0030-slowbuffer")).toHaveLength(2);
    expect(src("const s = 'SlowBuffer';", "dep0030-slowbuffer")).toEqual([]);
  });

  it("dep0176-fs-access-constants: bound names and destructuring", () => {
    expect(src("const fs = require('fs');\nfs.accessSync(p, fs.W_OK);", "dep0176-fs-access-constants")).toHaveLength(1);
    expect(src("import { access, R_OK } from 'node:fs';", "dep0176-fs-access-constants")).toHaveLength(1);
    expect(src("const fs = require('fs');\nfs.accessSync(p, fs.constants.W_OK);", "dep0176-fs-access-constants")).toEqual([]);
    expect(src("const fse = require('fs-extra');\nfse.R_OK;", "dep0176-fs-access-constants")).toEqual([]);
  });

  it("dep0147-rmdir-recursive", () => {
    expect(src("fs.rmdirSync(dir, { recursive: true });", "dep0147-rmdir-recursive")).toHaveLength(1);
    expect(src("await fs.promises.rmdir(dir);\nfs.rmSync(dir, { recursive: true });", "dep0147-rmdir-recursive")).toEqual([]);
  });

  it("dep0173-calltracker", () => {
    expect(src("const tracker = new assert.CallTracker();", "dep0173-calltracker")).toHaveLength(1);
  });

  it("dep0094-assert-fail-args: two or more arguments only", () => {
    expect(src("assert.fail(actual, expected, 'differs', '!==');", "dep0094-assert-fail-args")).toHaveLength(1);
    expect(src("assert.fail('should not get here');\nassert.fail(fmt(a, b));", "dep0094-assert-fail-args")).toEqual([]);
  });

  it("dep0160-multiple-resolves", () => {
    expect(src("process.on('multipleResolves', (type, p) => log(type));", "dep0160-multiple-resolves")).toHaveLength(1);
  });

  it("dep0185-repl-without-new", () => {
    expect(src("const r = repl.REPLServer({ prompt: '> ' });", "dep0185-repl-without-new")).toHaveLength(1);
    expect(src("const r = new repl.REPLServer({ prompt: '> ' });", "dep0185-repl-without-new")).toEqual([]);
  });

  it("dep0077-module-debug", () => {
    expect(src("const Module = require('module');\nModule._debug('x');", "dep0077-module-debug")).toHaveLength(1);
  });

  it("dep0154-rsa-pss-hash", () => {
    expect(src("generateKeyPairSync('rsa-pss', { modulusLength: 2048, hash: 'sha256' });", "dep0154-rsa-pss-hash")).toHaveLength(1);
    expect(src("generateKeyPairSync('rsa-pss', { modulusLength: 2048, hashAlgorithm: 'sha256' });", "dep0154-rsa-pss-hash")).toEqual([]);
  });

  it("dep0132-worker-terminate-callback: only in files that use worker_threads", () => {
    expect(src("const { Worker } = require('node:worker_threads');\nw.terminate(() => done());", "dep0132-worker-terminate-callback")).toHaveLength(1);
    expect(src("const { Worker } = require('node:worker_threads');\nawait w.terminate();", "dep0132-worker-terminate-callback")).toEqual([]);
    expect(src("session.terminate(cb);", "dep0132-worker-terminate-callback")).toEqual([]);
  });

  it("dep0182-gcm-auth-tag: GCM decipher without authTagLength", () => {
    expect(src("const d = crypto.createDecipheriv('aes-256-gcm', key, iv);\nd.setAuthTag(tag);", "dep0182-gcm-auth-tag")[0]!.severity).toBe("note");
    expect(src("const d = crypto.createDecipheriv('aes-256-gcm', key, iv, { authTagLength: 16 });\nd.setAuthTag(tag);", "dep0182-gcm-auth-tag")).toEqual([]);
  });

  it("dep0205-module-register", () => {
    expect(src("import { register } from 'node:module';\nregister('./hooks.mjs', import.meta.url);", "dep0205-module-register")).toHaveLength(1);
    expect(src("import { registerHooks } from 'node:module';\nregisterHooks({});", "dep0205-module-register")).toEqual([]);
  });

  it("dep0198-shake-output-length", () => {
    expect(src("createHash('shake256').update(x).digest();", "dep0198-shake-output-length")).toHaveLength(1);
    expect(src("createHash('shake256', { outputLength: 32 });", "dep0198-shake-output-length")).toEqual([]);
  });

  it("dep0031-ecdh-setpublickey", () => {
    expect(src("const ecdh = crypto.createECDH('prime256v1');\necdh.setPublicKey(pub);", "dep0031-ecdh-setpublickey")).toHaveLength(1);
  });

  it("API errors drop to warnings when every pin is older than the removal", () => {
    expect(src("x.writeHeader; res.writeHeader(200);", "dep0063-writeheader", { ".nvmrc": "22\n" })[0]!.severity).toBe("warning");
    expect(src("res.writeHeader(200);", "dep0063-writeheader", { ".nvmrc": "26\n" })[0]!.severity).toBe("error");
  });
});

describe("rule catalogue", () => {
  it("has unique ids, a source for every rule and a DEP code on every API rule", () => {
    expect(new Set(RULES.map((r) => r.id)).size).toBe(RULES.length);
    for (const r of RULES) {
      expect(r.source, r.id).toMatch(/^https:\/\/(nodejs\.org|github\.com|docs\.npmjs\.com)\//);
      if (/^dep\d/.test(r.id)) expect(r.dep, r.id).toBe(r.id.slice(0, 7).toUpperCase());
    }
  });
});

describe("JS masking", () => {
  it("ignores names inside comments, strings, template literals and regex literals", () => {
    const code = [
      "// SlowBuffer in a comment",
      "const a = 'SlowBuffer';",
      "const b = `require('_stream_readable')`;",
      "const c = /SlowBuffer|require\\('_stream_wrap'\\)/g;",
      "const d = x / SlowBufferish / 2;",
      "const e = [/a\\/b/, 'c'];",
    ].join("\n");
    expect(findings({ "src/a.js": code }).filter((f) => f.rule.startsWith("dep"))).toEqual([]);
  });
});

describe("monorepos", () => {
  it("uses the nearest .nvmrc and package.json above each file", () => {
    const files = {
      ".nvmrc": "22\n",
      "apps/web/.nvmrc": "26\n",
      "apps/web/package.json": JSON.stringify({ packageManager: "pnpm@10.34.9", scripts: { setup: "corepack enable" } }),
      "apps/web/Dockerfile": "FROM node:26-alpine\nRUN pnpm install\n",
      "apps/api/scripts/setup.sh": "corepack enable\n",
    };
    const corepack = findings(files, "corepack-not-bundled");
    expect(corepack.find((f) => f.file === "apps/web/package.json")!.severity).toBe("error");
    expect(corepack.find((f) => f.file === "apps/api/scripts/setup.sh")!.severity).toBe("note");
    expect(findings(files, "package-manager-not-installed").map((f) => f.file)).toEqual(["apps/web/Dockerfile"]);
    expect(findings(files, "node-version-mismatch")).toEqual([]);
  });
});

describe("nested shells and docker run", () => {
  it("reads bash -c scripts and resolves docker run images, also through a variable", () => {
    const script = [
      "#!/usr/bin/env bash",
      "IMAGE=node:lts-alpine",
      "docker run --rm -v \"$PWD:/app\" -w /app \"$IMAGE\" sh -c 'corepack enable && pnpm install'",
    ].join("\n");
    const [f] = findings({ "ci/build.sh": script, ".nvmrc": "22\n" }, "corepack-not-bundled");
    expect(f).toMatchObject({ severity: "error", line: 3 });
    expect(f!.edits).toBeUndefined();
  });

  it("knows Playwright images moved to Node 26 and ship Yarn 1", () => {
    const script = "docker create -i --ipc=host mcr.microsoft.com/playwright:v1.64.1-noble bash -euo pipefail -c '\n  corepack enable\n  yarn test\n'\n";
    const corepack = findings({ "run-e2e.sh": script }, "corepack-not-bundled");
    expect(corepack[0]!.message).toContain("Playwright images ship Node 26");
    expect(findings({ "run-e2e.sh": script }, "yarn-not-in-node26-image")).toEqual([]);
  });

  it("follows a direct command after the image", () => {
    expect(findings({ "x.sh": "docker run node:26 corepack enable\n" }, "corepack-not-bundled")[0]!.severity).toBe("error");
    expect(findings({ "x.sh": "bash -c \"corepack enable\"\n", ".nvmrc": "26\n" }, "corepack-not-bundled")[0]!.severity).toBe("error");
  });
});

describe("pnpm/setup", () => {
  it("counts as a pnpm install and sets the Node runtime", () => {
    const wf = workflow("- uses: pnpm/setup@v3\n  with:\n    runtime: node@26\n- run: pnpm install\n- run: corepack --version");
    const files = { ".github/workflows/ci.yml": wf, "package.json": PNPM_PKG };
    expect(findings(files, "package-manager-not-installed")).toEqual([]);
    expect(findings(files, "corepack-not-bundled")[0]!.severity).toBe("error");
  });

  it("leaves Netlify builds to Netlify", () => {
    const files = { "netlify.toml": '[build]\ncommand = "pnpm build"\n[build.environment]\nNODE_VERSION = "26"\n', "package.json": PNPM_PKG };
    expect(findings(files, "package-manager-not-installed")).toEqual([]);
  });
});
