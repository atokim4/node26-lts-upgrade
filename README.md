# Fix `corepack: not found` and other Node 26 LTS breaks in 1 command

No install: [check a public repo in the browser](https://upgrade-check-2026.netlify.app) (same engine, runs in the tab, reads up to 60 files; the CLI reads everything).

Node.js 26 became the Active LTS on 2026-10-28 (26.13.0). Every floating name moved with it: `node:lts`,
`node:lts-alpine`, `lts/*` in setup-node and `.nvmrc`. Builds that worked last week now fail, and the cause
is often two releases back:

- Node 25.0.0 stopped shipping Corepack ([nodejs/node f31c88021b](https://github.com/nodejs/node/commit/f31c88021b5b815bf776066c8eca510696b8c744),
  after the [TSC vote](https://github.com/nodejs/TSC/pull/1697#issuecomment-2737093616)), so `corepack enable` fails with
  `corepack: not found`.
- The official `node` images stopped bundling Yarn 1 with Node 26 ([docker-node README](https://github.com/nodejs/docker-node#yarn-v1-classic-bundling)),
  so `yarn install` fails with `yarn: not found`.
- Node 25 and 26 moved a set of deprecated APIs to End-of-Life, and 26 removed `--experimental-transform-types`.

`node26-check` reads a repo and reports each of these with the file, the line and the fix. With `--fix` it
inserts the missing install lines. Every rule links to the official page it comes from.

This is a personal project by Sunnatulla E. It isn't affiliated with the Node.js project.

```console
$ npx github:atokim4/node26-lts-upgrade .
Dockerfile:4  error   corepack-not-bundled [fixable]
  corepack enable runs on node:lts-alpine (Node 26 LTS since 2026-10-28): Node 25+ has no corepack binary, so this fails with "corepack: not found". Install it first with npm install -g corepack@0.36.0.
  > RUN corepack enable && pnpm install --frozen-lockfile
```

## Before and after

`--fix` on the sample app in [examples/sample-app](examples/sample-app) (`--pin 26` also pins the floating tags):

```diff
--- a/Dockerfile
+++ b/Dockerfile
@@ -1,11 +1,11 @@
-FROM node:lts-alpine AS build
+FROM node:26-alpine AS build
 WORKDIR /app
 COPY package.json pnpm-lock.yaml ./
-RUN corepack enable && pnpm install --frozen-lockfile
+RUN npm install -g corepack@0.36.0 && corepack enable && pnpm install --frozen-lockfile
 COPY . .
 RUN pnpm build
--- a/Dockerfile.docs
+++ b/Dockerfile.docs
@@ -1,6 +1,6 @@
-ARG NODE_VERSION=lts
+ARG NODE_VERSION=26
 FROM node:${NODE_VERSION}-slim
 WORKDIR /site
 COPY . .
-RUN yarn install --frozen-lockfile && yarn build
+RUN npm install -g yarn@1.22.22 && yarn install --frozen-lockfile && yarn build
--- a/.github/workflows/ci.yml
+++ b/.github/workflows/ci.yml
@@ -7,9 +7,9 @@
       - uses: actions/checkout@v5
       - uses: actions/setup-node@v5
         with:
-          node-version: lts/*
+          node-version: 26
           cache: pnpm
-      - run: corepack enable
+      - run: npm install -g corepack@0.36.0 && corepack enable
       - run: pnpm install --frozen-lockfile
```

The same workflow also gets an error that `--fix` leaves to you, because it means moving a step:
`setup-node has cache: pnpm but pnpm is not installed yet`. setup-node asks pnpm for its store path, so
[pnpm/action-setup has to come first](https://github.com/actions/setup-node/blob/main/docs/advanced-usage.md#caching-packages-data).

I ran both rewritten `RUN` lines on the official Node 26.13.0 Linux build: corepack 0.36.0 installs, `corepack
prepare pnpm@10.34.9 --activate` works and Yarn 1.22.22 runs. The output is in [examples/LOGS.md](examples/LOGS.md).

## Usage

```bash
npx github:atokim4/node26-lts-upgrade .                 # report, exit 1 on errors
npx github:atokim4/node26-lts-upgrade . --diff          # show what --fix would change
npx github:atokim4/node26-lts-upgrade . --fix           # insert the install lines, then report what is left
npx github:atokim4/node26-lts-upgrade . --fix --pin 26  # also pin node:lts / lts/* / latest to 26
npx github:atokim4/node26-lts-upgrade . --format sarif --output node26.sarif
```

Options: `--format text|json|markdown|sarif`, `--output <file>`, `--fail-on error|warning|note|none`,
`--exclude <rule ids>`, `--list-rules`, `--no-color`. Exit codes: 0 clean at the `--fail-on` level, 1 findings,
2 bad usage. Node 22 or newer, no runtime dependencies.

## What it checks

| Rule | Level | `--fix` | Source |
| --- | --- | --- | --- |
| `corepack-not-bundled`: `corepack …` on Node 25+ | error | inserts `npm install -g corepack@0.36.0 &&` | [nodejs/node f31c88021b](https://github.com/nodejs/node/commit/f31c88021b5b815bf776066c8eca510696b8c744) |
| `yarn-not-in-node26-image`: `yarn` in a node:26 image | error | inserts `npm install -g yarn@1.22.22 &&` (corepack for Yarn 2+) | [docker-node](https://github.com/nodejs/docker-node#yarn-v1-classic-bundling) |
| `package-manager-not-installed`: `packageManager` pnpm/Yarn 2+, nothing installs it | warning | inserts `npm install -g pnpm@<version> &&` | [nodejs/node f31c88021b](https://github.com/nodejs/node/commit/f31c88021b5b815bf776066c8eca510696b8c744) |
| `setup-node-cache-before-pm`: `cache: pnpm` before pnpm is installed | error | | [setup-node](https://github.com/actions/setup-node/blob/main/docs/advanced-usage.md#caching-packages-data) |
| `setup-node-v5-auto-cache`: setup-node v5 caching by itself for `packageManager` | warning | | [setup-node](https://github.com/actions/setup-node#breaking-changes-in-v5) |
| `removed-transform-types-flag`: `--experimental-transform-types` | error | | [Node TypeScript docs](https://nodejs.org/api/typescript.html#modules-typescript) |
| `floating-node-version`: node:lts, lts/*, latest, node:alpine… | note | with `--pin <major>` | [docker-node](https://github.com/nodejs/docker-node#nodelts) |
| `engines-exclude-node26`: `engines.node` that rules out 26 | warning | | [npm docs](https://docs.npmjs.com/cli/v11/configuring-npm/package-json#engines) |
| `node-version-mismatch`: .nvmrc says 22, the image runs 26 | warning | | [docker-node](https://github.com/nodejs/docker-node#nodelts) |
| `dependency-engines-exclude-node26`: locked packages whose engines leave out 26 | note | | [npm docs](https://docs.npmjs.com/cli/v11/configuring-npm/package-json#engines) |
| `native-addon-rebuild`: addons built per ABI (NODE_MODULE_VERSION 147 on 26) | note | | [Node 26.0.0 notes](https://nodejs.org/en/blog/release/v26.0.0) |
| `node-modules-cache-key`: `node_modules` cached without the Node version in the key | warning | | [Node 26.0.0 notes](https://nodejs.org/en/blog/release/v26.0.0) |
| 16 API rules for JS/TS: DEP0193, DEP0063, DEP0030, DEP0176, DEP0147, DEP0173, DEP0094, DEP0160, DEP0185, DEP0077, DEP0154, DEP0132 (removed in 25/26), DEP0182, DEP0205, DEP0198, DEP0031 (notes) | error / note | | [deprecations page](https://nodejs.org/api/deprecations.html) |

`--list-rules` prints all 28 with their links. Each API rule names its DEP code. Where the deprecations page lists
an official codemod (`npx codemod@latest @nodejs/rmdir` and others), the message names it too.

Levels depend on where the command runs. On Node 25 or later, or on a floating name that already points at 26,
it's an error. When the Node version can't be read from the repo, it's a warning. When the pin is older (a
`node:22` stage), it's a note, because it works today and breaks when you move.

## Where it looks, and how it knows which Node runs

- Dockerfiles (`Dockerfile*`, `*.Dockerfile`, `Containerfile`): each stage's `FROM`, global `ARG` defaults
  (`FROM node:${NODE_VERSION}`), stages built from other stages, `RUN` (shell, exec and heredoc forms), `USER`.
- GitHub Actions (`.github/workflows/*.yml`, composite actions): `actions/setup-node` `node-version`,
  `node-version-file` and matrix legs (the newest leg counts), `pnpm/setup` `runtime`, `container:` images.
  Steps before setup-node run on the runner's Node 22 (ubuntu-24.04 image, which also has Yarn 1.22.22).
- GitLab CI (`.gitlab-ci.yml`): the default and per-job `image`. Jenkinsfile: `docker` agent images.
- `netlify.toml` (`command`, `NODE_VERSION`) and `vercel.json` (`installCommand`, `buildCommand`).
- `package.json` (scripts, `engines`, `packageManager`, `volta`, `devEngines`), `.nvmrc`, `.node-version`,
  `package-lock.json`, `pnpm-lock.yaml`, `*.sh`, Makefiles, `AGENTS.md` / `CLAUDE.md` code spans, and
  `*.js` / `*.ts` sources for the API rules.
- `sh -c '…'` / `bash -c '…'` scripts, and `docker run|create|exec IMAGE …`, also through `IMAGE=…` in the same
  file. `mcr.microsoft.com/playwright` images count as "unknown Node": their Dockerfile moved from Node 24 to 26
  on 2026-10-29 ([microsoft/playwright 38fb53bf4c](https://github.com/microsoft/playwright/commit/38fb53bf4c)) and the
  tag doesn't say which side an image is from.
- In a monorepo, each file uses the nearest `.nvmrc` / `.node-version` / `package.json` above it.

## GitHub Action

```yaml
- uses: actions/checkout@v5
- uses: atokim4/node26-lts-upgrade@main
  id: node26
  with:
    fail-on: error        # or warning, note, none
    # fix: "true"         # apply the safe rewrites in the checkout (commit them in a later step)
    # pin: "26"           # with fix, also pin floating versions
- uses: github/codeql-action/upload-sarif@v4
  if: always()
  with:
    sarif_file: ${{ steps.node26.outputs.sarif-file }}
```

It runs on `node24`, writes annotations, a job summary table and a SARIF 2.1.0 file. Outputs: `findings-count`,
`errors-count`, `fixable-count`, `fixed-count`, `sarif-file`.

## Agent skill

```bash
npx skills add atokim4/node26-lts-upgrade --skill node26-lts-upgrade
```

[skills/node26-lts-upgrade/SKILL.md](skills/node26-lts-upgrade/SKILL.md) tells a coding agent (Claude Code, Codex,
Cursor and others) how to run the bundled scanner, which rewrites are safe, and which questions to bring to you
(pinning, moving setup steps, engines).

## Does it find real breaks?

Each PR below is a public fix for one of these breaks. I ran the scanner on the commit before each fix, and it
reported every line the PR changed:
kpi-ua/schedule.kpi.ua#631, emilyeserven/servenupphotos#531, cowprotocol/bff#278 (all 6 yarn sites),
mctlhq/mctl-design#201, alma-oss/spirit-design-system#3085, GURYOU/neon#3, Trapar-waves/website#69 and
TuanOnta/OntaPulse#18. On the current default branches of expressjs/express, fastify/fastify and vitejs/vite it
reports no errors or warnings. The table, the commands and the false positives I fixed along the way are in
[examples/LOGS.md](examples/LOGS.md).

[examples/node26-runtime-check.sh](examples/node26-runtime-check.sh) checks the claims behind the rules on the
official Node 26.13.0 and 25.9.0 Linux builds, without Docker. On 26, `bin/` holds only `node`, `npm` and `npx`.
corepack 0.36.0 installs from npm (with an EBADENGINE warning on 25, since its engines skip 25). A global Yarn 1
refuses a `packageManager: yarn@4` project. `--experimental-transform-types` gives `bad option`, and each listed
API fails as the deprecations page says.

## Limits

- It reads files. It doesn't build images or run your CI, so a finding means "this line will run on Node 26
  without the tool it needs", not a reproduced failure.
- Shell parsing is simple: it splits on `&&`, `||`, `;`, `|`, newlines and `$(…)`, follows `sh -c` and
  `docker run`, and skips comments. Commands built at runtime (`eval`, variables holding a command) aren't seen.
  Neither are `execSync("corepack enable")` calls in Node code.
- Base images other than official `node` (and Playwright) count as "unknown Node", so findings there are warnings.
  Netlify's and Vercel's own default Node versions aren't assumed. Only `NODE_VERSION` and the repo pins count.
- The API rules match patterns, with no type information. `writeHeader` is only reported in files that use
  `node:http` / `express` or on `res.` / `response.`, and `terminate(cb)` only in files that import `worker_threads`.
  Deprecations that depend on values at runtime (DEP0118 falsy `dns.lookup` host, DEP0170 bad URL ports and others)
  are not checked.
- `native-addon-rebuild` reads `package-lock.json` only (pnpm lockfiles don't record install scripts the same way).
  Node-API addons (`node-addon-api` alone) are ABI-stable and aren't listed.
- The corepack and Yarn versions that `--fix` writes (0.36.0, 1.22.22) are the latest on npm as of 2026-11-10. So
  is "lts means 26". Both are constants in `src/rules.ts` and `src/node-version.ts`.

## Development

```bash
npm ci
npm run check                              # tsc --noEmit, esbuild bundles, vitest
node examples/check-sources.mjs            # every rule's source page and anchor still exists
examples/node26-runtime-check.sh /tmp/n26  # the runtime claims, on the real Node 26 and 25 builds
```

TypeScript (strict) on Node 22 ESM, Vitest, esbuild. The committed bundles (`action/index.mjs`,
`skills/node26-lts-upgrade/scripts/node26check.mjs`) are rebuilt by `npm run build`. [ci/test.yml](ci/test.yml) is
the repo's test workflow (Node 22, 24, 26 and the action on the sample app). Copy it to `.github/workflows/` to run it.

## License

MIT
