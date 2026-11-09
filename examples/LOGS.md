# Logs

Real output, nothing edited except local paths (shown as `<work>`, `<repo>` and `~`). Re-run with
`examples/node26-runtime-check.sh` (needs curl, tar and xz; no Docker) and the commands below.

Node versions as of 2026-11-10: nodejs.org/dist/index.json lists v26.13.0 (2026-10-28) as the first Node 26
release with `"lts": "Lithium"`, so `node:lts`, `lts/*` and setup-node `lts/*` give Node 26 now.

## Runtime checks on the official Linux x64 builds (2026-11-09)

### 1. Node 26 ships npm but no corepack, pnpm or yarn

```console
$ node --version && npm --version
v26.13.0
11.20.0
[exit 0]
$ ls "<work>/node-v26.13.0-linux-x64/bin"
node
npm
npx
[exit 0]
$ corepack enable
bash: line 1: corepack: command not found
[exit 127]
$ yarn --version
bash: line 1: yarn: command not found
[exit 127]
```

### 2. npm install -g corepack@0.36.0 brings corepack back (global prefix in a temp dir)

```console
$ npm install -g corepack@0.36.0 --no-fund --no-audit

added 1 package in 365ms
[exit 0]
$ corepack --version
0.36.0
[exit 0]
$ corepack enable && ls "<work>/prefix26/bin"
corepack
pnpm
pnpx
yarn
yarnpkg
[exit 0]
$ cd "<work>/pnpm-app" && COREPACK_ENABLE_DOWNLOAD_PROMPT=0 pnpm --version
10.34.9
[exit 0]
```

### 3. On Node 25, corepack 0.36.0 installs with an EBADENGINE warning (its engines skip 25)

```console
$ node --version && ls "<work>/node-v25.9.0-linux-x64/bin"
v25.9.0
node
npm
npx
[exit 0]
$ npm install -g corepack@0.36.0 --no-fund --no-audit
npm warn EBADENGINE Unsupported engine {
npm warn EBADENGINE   package: 'corepack@0.36.0',
npm warn EBADENGINE   required: { node: '^22.22.2 || ^24.15.0 || >=26.0.0' },
npm warn EBADENGINE   current: { node: 'v25.9.0', npm: '11.12.1' }
npm warn EBADENGINE }

added 1 package in 364ms
[exit 0]
$ corepack --version
0.36.0
[exit 0]
```

### 4. Yarn 1 from npm, and packageManager pointing at Yarn 4

```console
$ npm install -g yarn@1.22.22 --no-fund --no-audit && yarn --version

added 1 package in 564ms
npm warn install-scripts 1 package has install scripts not yet covered by allowScripts:
npm warn install-scripts   yarn@1.22.22 (preinstall: :; (node ./preinstall.js > /dev/null 2>&1 || true))
npm warn install-scripts
npm warn install-scripts Run `npm install -g --allow-scripts=yarn` to allow these scripts once, or `npm config set allow-scripts=yarn --location=user` to allow them for all global installs.
1.22.22
[exit 0]
$ cd "<work>/berry-app" && yarn install
error This project's package.json defines "packageManager": "yarn@4.10.3". However the current global version of Yarn is 1.22.22.

Presence of the "packageManager" field indicates that the project is meant to be used with Corepack, a tool included by default with all official Node.js distributions starting from 16.9 and 14.19.
Corepack must currently be enabled by running corepack enable in your terminal. For more information, check out https://yarnpkg.com/corepack.
[exit 1]
```

### 5. --experimental-transform-types is gone in 26 (and still accepted in 25)

```console
$ node --experimental-transform-types "<work>/erasable.ts"
node: bad option: --experimental-transform-types
[exit 9]
$ NODE_OPTIONS=--experimental-transform-types node "<work>/erasable.ts"
node: --experimental-transform-types is not allowed in NODE_OPTIONS
[exit 9]
$ node "<work>/erasable.ts"
strip ok 1
[exit 0]
$ node "<work>/enum.ts"
file://<work>/enum.ts:1
enum Color { Red }
^^^^^^^^^^^^^^^^^^
console.log(Color.Red);

SyntaxError [ERR_UNSUPPORTED_TYPESCRIPT_SYNTAX]: TypeScript enum is not supported in strip-only mode
    at parseTypeScript (node:internal/modules/typescript:57:40)
    at processTypeScriptCode (node:internal/modules/typescript:129:37)
    at Object.stripTypeScriptModuleTypes (node:internal/modules/typescript:172:22)
    at Module._compile (node:internal/modules/cjs/loader:1922:32)
    at Object..js (node:internal/modules/cjs/loader:2108:10)
    at Module.load (node:internal/modules/cjs/loader:1690:32)
    at Module._load (node:internal/modules/cjs/loader:1480:12)
    at wrapModuleLoad (node:internal/modules/cjs/loader:261:19)
    at Module.executeUserEntryPoint [as runMain] (node:internal/modules/run_main:171:5)
    at node:internal/main/run_main_module:33:47 {
  code: 'ERR_UNSUPPORTED_TYPESCRIPT_SYNTAX'
}

Node.js v26.13.0
[exit 1]
$ "<work>/node-v25.9.0-linux-x64/bin/node" --experimental-transform-types "<work>/enum.ts"
0
(node:948821) ExperimentalWarning: Transform Types is an experimental feature and might change at any time
(Use `node --trace-warnings ...` to show where the warning was created)
[exit 0]
```

### 6. NODE_MODULE_VERSION

```console
$ node -p process.versions.modules
147
[exit 0]
$ "<work>/node-v25.9.0-linux-x64/bin/node" -p process.versions.modules
141
[exit 0]
```

### 7. APIs at End-of-Life in 25 and 26

```console
$ node "<work>/apis.cjs"
DEP0193 require('_stream_transform'): throws MODULE_NOT_FOUND: Cannot find module '_stream_transform'
DEP0193 require('node:_stream_readable'): throws ERR_UNKNOWN_BUILTIN_MODULE: No such built-in module: node:_stream_readable
DEP0125 require('_stream_wrap'): throws MODULE_NOT_FOUND: Cannot find module '_stream_wrap'
DEP0063 typeof ServerResponse.prototype.writeHeader: undefined
DEP0030 typeof require('buffer').SlowBuffer: undefined
DEP0176 fs.R_OK: undefined
DEP0176 fs.constants.R_OK: 4
DEP0173 typeof assert.CallTracker: undefined
DEP0077 typeof Module._debug: undefined
DEP0185 repl.REPLServer() without new: throws TypeError: Class constructor REPLServer cannot be invoked without 'new'
DEP0094 assert.fail(1, 2): throws ERR_ASSERTION: 1
DEP0154 generateKeyPairSync('rsa-pss', { hash }): throws ERR_INVALID_ARG_VALUE: The property 'options.hash' is no longer supported. Received 'sha256'
DEP0147 fs.rmdirSync(nonEmptyDir, { recursive: true }): throws ERR_INVALID_ARG_VALUE: The property 'options.recursive' is no longer supported. Received true
DEP0160 multipleResolves handler fired: false
[exit 0]
$ node "<work>/worker.cjs"
DEP0132 terminate(callback) returned a promise
[exit 0]
$ node "<work>/deprecations.mjs"
(node:948885) [DEP0198] DeprecationWarning: Creating SHAKE128/256 digests without an explicit options.outputLength is deprecated.
(Use `node --trace-deprecation ...` to show where the warning was created)
(node:948885) [DEP0205] DeprecationWarning: `module.register()` is deprecated. Use `module.registerHooks()` instead.
[exit 0]
$ "<work>/node-v25.9.0-linux-x64/bin/node" -e 'console.log(typeof require("_stream_transform"), typeof require("node:http").ServerResponse.prototype.writeHeader)'
function function
(node:948898) [DEP0193] DeprecationWarning: The _stream_transform module is deprecated. Use `node:stream` instead.
(Use `node --trace-deprecation ...` to show where the warning was created)
[exit 0]
```

### 8. engines.node that leaves out 26

```console
$ cd "<work>/engines-app" && npm install --no-fund --no-audit
npm warn EBADENGINE Unsupported engine {
npm warn EBADENGINE   package: 'engines-app@1.0.0',
npm warn EBADENGINE   required: { node: '^20 || ^22 || ^24' },
npm warn EBADENGINE   current: { node: 'v26.13.0', npm: '11.20.0' }
npm warn EBADENGINE }

added 1 package in 358ms
[exit 0]
$ cd "<work>/engines-app" && npm install --engine-strict --no-fund --no-audit
npm error code EBADENGINE
npm error engine Unsupported engine
npm error engine Not compatible with your version of node/npm: engines-app@1.0.0
npm error notsup Not compatible with your version of node/npm: engines-app@1.0.0
npm error notsup Required: {"node":"^20 || ^22 || ^24"}
npm error notsup Actual:   {"node":"v26.13.0","npm":"11.20.0"}
npm error A complete log of this run can be found in: ~/.npm/_logs/2026-11-09T23_26_57_123Z-debug-0.log
[exit 1]
$ cd "<work>/engines-app" && rm -rf node_modules package-lock.json && yarn install --no-lockfile
yarn install v1.22.22
[1/5] Validating package.json...
error engines-app@1.0.0: The engine "node" is incompatible with this module. Expected version "^20 || ^22 || ^24". Got "26.13.0"
error Found incompatible module.
info Visit https://yarnpkg.com/en/docs/cli/install for documentation about this command.
[exit 1]
```

### 9. The --fix output runs on Node 26: RUN lines rewritten by the scanner, executed as-is

```console
$ node "<repo>/skills/node26-lts-upgrade/scripts/node26check.mjs" "<work>/fix-app" --fix --fail-on none --no-color | sed -n '/^---/,/^Fixed/p'
--- a/Dockerfile
+++ b/Dockerfile
@@ -1,3 +1,3 @@
 FROM node:lts-alpine
-RUN corepack enable && corepack prepare pnpm@10.34.9 --activate && pnpm --version
+RUN npm install -g corepack@0.36.0 && corepack enable && corepack prepare pnpm@10.34.9 --activate && pnpm --version
 
--- a/Dockerfile.yarn
+++ b/Dockerfile.yarn
@@ -1,3 +1,3 @@
 FROM node:26-slim
-RUN yarn --version
+RUN npm install -g yarn@1.22.22 && yarn --version
 
Fixed 2 finding(s) in 2 file(s). Remaining:
[exit 0]
$ cd "<work>/fix-app" && npm install -g corepack@0.36.0 && corepack enable && corepack prepare pnpm@10.34.9 --activate && pnpm --version

added 1 package in 359ms
Preparing pnpm@10.34.9 for immediate activation...
10.34.9
[exit 0]
$ cd "<work>/fix-app" && npm install -g yarn@1.22.22 && yarn --version

added 1 package in 544ms
npm warn install-scripts 1 package has install scripts not yet covered by allowScripts:
npm warn install-scripts   yarn@1.22.22 (preinstall: :; (node ./preinstall.js > /dev/null 2>&1 || true))
npm warn install-scripts
npm warn install-scripts Run `npm install -g --allow-scripts=yarn` to allow these scripts once, or `npm config set allow-scripts=yarn --location=user` to allow them for all global installs.
1.22.22
[exit 0]
```

## The scanner on the sample app

`examples/sample-app` is a made-up repo with the shapes from the public issues listed below.

```console
$ node skills/node26-lts-upgrade/scripts/node26check.mjs examples/sample-app --no-color
Scanned 1 workflow, 1 gitlab, 1 node-version, 1 agent-doc, 2 dockerfile, 1 package, 1 shell, 2 source. Repo pin: .nvmrc 22 (Node 22).

.github/workflows/ci.yml:8  error   setup-node-cache-before-pm
  setup-node has cache: pnpm but pnpm is not installed yet in job "test": the step fails with "Unable to locate executable file: pnpm". Put pnpm/action-setup before actions/setup-node.
  > - uses: actions/setup-node@v5
.github/workflows/ci.yml:10  note    floating-node-version
  lts/* floats: setup-node lts/* (Node 26 LTS since 2026-10-28). Pin a major (26) so the next Node release does not change your build; --fix --pin 26 does it.
  > node-version: lts/*
.github/workflows/ci.yml:10  warning node-version-mismatch
  The repo pins Node 22 (.nvmrc 22), but this runs setup-node lts/* (Node 26 LTS since 2026-10-28). Pin it to 22, or move the repo pin to 26 after testing on it.
  > node-version: lts/*
.github/workflows/ci.yml:12  error   corepack-not-bundled [fixable]
  corepack enable runs on setup-node lts/* (Node 26 LTS since 2026-10-28): Node 25+ has no corepack binary, so this fails with "corepack: not found". Install it first with npm install -g corepack@0.36.0.
  > - run: corepack enable
.github/workflows/ci.yml:14  warning node-modules-cache-key
  This cache restores node_modules with key ${{ runner.os }}-modules-${{ hashFiles('pnpm-lock.yaml') }}, which has no Node version in it; the job runs setup-node lts/*, so after the move to 26 it restores addons built for another NODE_MODULE_VERSION (147 on Node 26). Add the Node version to the key or cache the package manager store instead.
  > - uses: actions/cache@v4
.gitlab-ci.yml:1  note    floating-node-version
  node:lts floats: node:lts (Node 26 LTS since 2026-10-28). Pin a major (node:26) so the next Node release does not change your build; --fix --pin 26 does it.
  > image: node:lts
.gitlab-ci.yml:1  warning node-version-mismatch
  The repo pins Node 22 (.nvmrc 22), but this runs node:lts (Node 26 LTS since 2026-10-28). Pin it to 22, or move the repo pin to 26 after testing on it.
  > image: node:lts
.gitlab-ci.yml:8  error   corepack-not-bundled [fixable]
  corepack enable runs on node:lts (Node 26 LTS since 2026-10-28): Node 25+ has no corepack binary, so this fails with "corepack: not found". Install it first with npm install -g corepack@0.36.0.
  > - corepack enable
AGENTS.md:3  note    corepack-not-bundled
  corepack enable works on .nvmrc 22 (Node 22), but breaks with "corepack: not found" on Node 25+ (node:lts is 26 now). Install corepack from npm before moving.
  > Install dependencies with `corepack enable && pnpm install`, then run `pnpm test`.
Dockerfile:1  note    floating-node-version
  node:lts-alpine floats: node:lts-alpine (Node 26 LTS since 2026-10-28). Pin a major (node:26-alpine) so the next Node release does not change your build; --fix --pin 26 does it.
  > FROM node:lts-alpine AS build
Dockerfile:1  warning node-version-mismatch
  The repo pins Node 22 (.nvmrc 22), but this runs node:lts-alpine (Node 26 LTS since 2026-10-28). Pin it to 22, or move the repo pin to 26 after testing on it.
  > FROM node:lts-alpine AS build
Dockerfile:4  error   corepack-not-bundled [fixable]
  corepack enable runs on node:lts-alpine (Node 26 LTS since 2026-10-28): Node 25+ has no corepack binary, so this fails with "corepack: not found". Install it first with npm install -g corepack@0.36.0.
  > RUN corepack enable && pnpm install --frozen-lockfile
Dockerfile:8  note    floating-node-version
  node:lts-alpine floats: node:lts-alpine (Node 26 LTS since 2026-10-28). Pin a major (node:26-alpine) so the next Node release does not change your build; --fix --pin 26 does it.
  > FROM node:lts-alpine
Dockerfile:8  warning node-version-mismatch
  The repo pins Node 22 (.nvmrc 22), but this runs node:lts-alpine (Node 26 LTS since 2026-10-28). Pin it to 22, or move the repo pin to 26 after testing on it.
  > FROM node:lts-alpine
Dockerfile.docs:1  note    floating-node-version
  lts floats: node:lts-slim (Node 26 LTS since 2026-10-28). Pin a major (26) so the next Node release does not change your build; --fix --pin 26 does it.
  > ARG NODE_VERSION=lts
Dockerfile.docs:1  warning node-version-mismatch
  The repo pins Node 22 (.nvmrc 22), but this runs node:lts-slim (Node 26 LTS since 2026-10-28). Pin it to 22, or move the repo pin to 26 after testing on it.
  > ARG NODE_VERSION=lts
Dockerfile.docs:5  error   yarn-not-in-node26-image [fixable]
  yarn install --frozen-lockfile runs in node:lts-slim (Node 26 LTS since 2026-10-28), and node images no longer bundle Yarn 1 as of Node 26 ("yarn: not found"); install it first with npm install -g yarn@1.22.22.
  > RUN yarn install --frozen-lockfile && yarn build
package.json:6  warning engines-exclude-node26
  engines.node "^20 || ^22 || ^24" does not allow Node 26.13.0, but setup-node lts/* (Node 26 LTS since 2026-10-28) runs this repo: npm warns EBADENGINE, engine-strict installs fail. Add 26 when the tests pass on it.
  > "node": "^20 || ^22 || ^24"
package.json:9  note    corepack-not-bundled
  corepack enable works on .nvmrc 22 (Node 22), but breaks with "corepack: not found" on Node 25+ (node:lts is 26 now). Install corepack from npm before moving.
  > "setup": "corepack enable && pnpm install",
package.json:10  note    removed-transform-types-flag
  --experimental-transform-types was removed in Node 26, which exits with "bad option" (here: .nvmrc 22 (Node 22)). Drop it; enums, namespaces and parameter properties then need tsc or tsx.
  > "dev": "node --experimental-transform-types src/server.ts",
scripts/bootstrap.sh:4  note    corepack-not-bundled
  corepack enable works on .nvmrc 22 (Node 22), but breaks with "corepack: not found" on Node 25+ (node:lts is 26 now). Install corepack from npm before moving.
  > corepack enable
src/legacy-stream.js:1  error   dep0193-stream-internals
  '_stream_transform' was removed in Node 26 (DEP0193), so require/import fails with MODULE_NOT_FOUND. Use require('node:stream').Transform or import { Transform } from 'node:stream'.
  > const Transform = require("_stream_transform");
src/server.ts:6  error   dep0176-fs-access-constants
  fs.R_OK was removed in Node 25 (DEP0176) and is undefined now. Use fs.constants.*_OK (codemod: npx codemod@latest @nodejs/fs-access-mode-constants).
  > const ok = await access("./public", fs.R_OK).then(() => true, () => false);
src/server.ts:7  error   dep0063-writeheader
  ServerResponse.writeHeader() was removed in Node 26 (DEP0063) and throws writeHeader is not a function. Call writeHead() with the same arguments.
  > res.writeHeader(ok ? 200 : 503, { "content-type": "text/plain" });

8 error(s), 7 warning(s), 9 note(s); 4 can be rewritten with --fix.
[exit 1]
```

```console
$ node skills/node26-lts-upgrade/scripts/node26check.mjs examples/sample-app --diff --pin 26 --no-color --fail-on none | sed -n '1,/would fix/p'
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
       - uses: actions/cache@v4
         with:
--- a/.gitlab-ci.yml
+++ b/.gitlab-ci.yml
@@ -1,11 +1,11 @@
-image: node:lts
+image: node:26
 
 stages: [test]
 
 test:
   stage: test
   script:
-    - corepack enable
+    - npm install -g corepack@0.36.0 && corepack enable
     - pnpm install --frozen-lockfile
     - pnpm test
 
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
 
-FROM node:lts-alpine
+FROM node:26-alpine
 WORKDIR /app
 COPY --from=build /app/dist ./dist
 CMD ["node", "dist/server.js"]
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
 
--fix would fix 9 finding(s) in 4 file(s).
```

## Real repos: the commit before a public fix

For each public pull request below, the scanner ran on the PR's base commit (before the fix) with default
settings. Shown: the corepack / yarn / setup-node / package-manager findings at error and warning level. Each
PR's changed lines are in the scanner's list.

| Pull request | Base commit | What the PR changed | Scanner on the base commit |
| --- | --- | --- | --- |
| kpi-ua/schedule.kpi.ua#631 | 6d5e7ba14d | `corepack enable` in Dockerfile, line 5 | error corepack-not-bundled Dockerfile:5 |
| emilyeserven/servenupphotos#531 | 6ad1133580 | `corepack enable` in 2 Dockerfiles | error corepack-not-bundled apps/bff-pipeline/Dockerfile:6, Dockerfile.dev:6 |
| cowprotocol/bff#278 | 6a5cf6b3ce | yarn install added in 6 places, 3 Dockerfiles (node:lts-alpine) | error yarn-not-in-node26-image at the same 6 places |
| mctlhq/mctl-design#201 | a9a86dda6a | `corepack enable` inside `docker create … playwright … bash -c '…'` | warning corepack-not-bundled scripts/browser-tests-docker.sh:28 |
| alma-oss/spirit-design-system#3085 | 99e9febd52 | `sh -c "corepack install …"` in a `docker run` of the Playwright image | warning corepack-not-bundled .github/workflows/e2e.yml:52, plus 2 warnings in composite actions whose Node comes from the caller |
| GURYOU/neon#3 | 83f46f1823 | pnpm/action-setup moved above setup-node `cache: pnpm` | error setup-node-cache-before-pm .github/workflows/main.yml:25 |
| Trapar-waves/website#69 | fc16d9cb37 | same | error setup-node-cache-before-pm .github/workflows/deploy.yml:25 |
| TuanOnta/OntaPulse#18 | 961312792b | same | error setup-node-cache-before-pm .github/workflows/worker-infrastructure.yml:30 |

The Playwright findings are warnings, not errors: the tag (`v1.64.1-noble`) doesn't say whether the image was
built before or after microsoft/playwright 38fb53bf4c (2026-10-29), which moved its Dockerfile from Node 24 to 26.

False-positive check on current default branches (2026-11-10), all rules: expressjs/express, fastify/fastify and
vitejs/vite gave 0 errors and 0 warnings (notes only). vitejs/vite at first gave 2 warnings, because the scanner
didn't know `pnpm/setup` (it installs pnpm and Node) and checked Netlify builds, which install pnpm themselves.
Both were fixed, and each has a test now.

## Rule sources

```console
$ node examples/check-sources.mjs
ok   corepack-not-bundled               200 https://github.com/nodejs/node/commit/f31c88021b5b815bf776066c8eca510696b8c744
ok   yarn-not-in-node26-image           200 https://github.com/nodejs/docker-node#yarn-v1-classic-bundling
ok   package-manager-not-installed      200 https://github.com/nodejs/node/commit/f31c88021b5b815bf776066c8eca510696b8c744
ok   setup-node-cache-before-pm         200 https://github.com/actions/setup-node/blob/main/docs/advanced-usage.md#caching-packages-data
ok   setup-node-v5-auto-cache           200 https://github.com/actions/setup-node#breaking-changes-in-v5
ok   removed-transform-types-flag       200 https://nodejs.org/api/typescript.html#modules-typescript
ok   floating-node-version              200 https://github.com/nodejs/docker-node#nodelts
ok   engines-exclude-node26             200 https://docs.npmjs.com/cli/v11/configuring-npm/package-json#engines
ok   node-version-mismatch              200 https://github.com/nodejs/docker-node#nodelts
ok   dependency-engines-exclude-node26  200 https://docs.npmjs.com/cli/v11/configuring-npm/package-json#engines
ok   native-addon-rebuild               200 https://nodejs.org/en/blog/release/v26.0.0
ok   node-modules-cache-key             200 https://nodejs.org/en/blog/release/v26.0.0
ok   dep0193-stream-internals           200 https://nodejs.org/api/deprecations.html#dep0193-requirenode_stream_
ok   dep0063-writeheader                200 https://nodejs.org/api/deprecations.html#dep0063-serverresponseprototypewriteheader
ok   dep0030-slowbuffer                 200 https://nodejs.org/api/deprecations.html#dep0030-slowbuffer
ok   dep0176-fs-access-constants        200 https://nodejs.org/api/deprecations.html#dep0176-fsf_ok-fsr_ok-fsw_ok-fsx_ok
ok   dep0147-rmdir-recursive            200 https://nodejs.org/api/deprecations.html#-recursive-true
ok   dep0173-calltracker                200 https://nodejs.org/api/deprecations.html#dep0173-the-assertcalltracker-class
ok   dep0094-assert-fail-args           200 https://nodejs.org/api/deprecations.html#dep0094-using-assertfail-with-more-than-one-argument
ok   dep0160-multiple-resolves          200 https://nodejs.org/api/deprecations.html#dep0160-processonmultipleresolves-handler
ok   dep0185-repl-without-new           200 https://nodejs.org/api/deprecations.html#dep0185-instantiating-noderepl-classes-without-new
ok   dep0077-module-debug               200 https://nodejs.org/api/deprecations.html#dep0077-module_debug
ok   dep0154-rsa-pss-hash               200 https://nodejs.org/api/deprecations.html#dep0154-rsa-pss-generate-key-pair-options
ok   dep0132-worker-terminate-callback  200 https://nodejs.org/api/deprecations.html#dep0132-workerterminate-with-callback
ok   dep0182-gcm-auth-tag               200 https://nodejs.org/api/deprecations.html#dep0182-short-gcm-authentication-tags-without-explicit-authtaglength
ok   dep0205-module-register            200 https://nodejs.org/api/deprecations.html#dep0205-moduleregister
ok   dep0198-shake-output-length        200 https://nodejs.org/api/deprecations.html#dep0198-creating-shake-128-and-shake-256-digests-without-an-explicit-optionsoutputlength
ok   dep0031-ecdh-setpublickey          200 https://nodejs.org/api/deprecations.html#dep0031-ecdhsetpublickey
all 28 sources reachable, anchors present
```
