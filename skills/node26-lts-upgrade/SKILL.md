---
name: node26-lts-upgrade
description: Finds and fixes what breaks when a project moves to Node.js 26 LTS (node:lts, lts/* and setup-node lts/* point at 26 since 2026-10-28). Covers "corepack - not found" and "corepack - command not found" (Node 25+ ships no corepack), "yarn - not found" in node:26 images, setup-node "Unable to locate executable file - pnpm", engines ranges that leave out 26, native addons that need NODE_MODULE_VERSION 147, the removed --experimental-transform-types flag and JS/TS APIs removed in Node 25 and 26 (DEP0193 _stream_*, DEP0063 writeHeader, DEP0176 fs.F_OK and more). Use when a Docker build or CI job broke after node:lts moved to 26, or when the user asks to upgrade a repo to Node 26.
license: MIT
---

# node26-lts-upgrade

A zero-dependency Node 22+ scanner ships in `scripts/node26check.mjs` next to this file. It reads files only: it
doesn't run Docker, Node 26 or the network. Every rule cites the official source (Node.js release notes, the
deprecations page, docker-node, setup-node) and the report links to it.

## Steps

1. From the project root, see what breaks:

   ```bash
   node ${CLAUDE_SKILL_DIR}/scripts/node26check.mjs . --format json --fail-on none
   ```

   In agents that don't set `${CLAUDE_SKILL_DIR}`, use this skill folder's path. Each finding has `rule`,
   `severity` (error, warning, note), `file`, `line`, `message`, `fixable`, `source` and, for API rules, `dep`.
   `repoPin` says which Node the repo pins (.nvmrc, .node-version, volta).

2. Preview and apply the safe rewrites:

   ```bash
   node ${CLAUDE_SKILL_DIR}/scripts/node26check.mjs . --diff
   node ${CLAUDE_SKILL_DIR}/scripts/node26check.mjs . --fix
   ```

   `--fix` only inserts install lines in front of the first command that needs them
   (`npm install -g corepack@0.36.0 && corepack enable`, `npm install -g yarn@1.22.22 && yarn …`,
   `npm install -g pnpm@<packageManager version> && pnpm …`). It prints the diff, then reports what is left.
   Show the user the diff.

3. Ask the user before pinning. `--fix --pin 26` also rewrites floating versions (`node:lts-alpine` to
   `node:26-alpine`, `lts/*` to `26`). Pinning is a policy choice, so don't add `--pin` on your own.

4. Bring the rest to the user, one line each:
   - `setup-node-cache-before-pm`: move pnpm/action-setup above actions/setup-node (show the two steps swapped).
   - `engines-exclude-node26`, `node-version-mismatch`: should the repo move to 26 now, or should CI pin the old major?
   - `dep…` rules: apply the replacement in the message. Where it names an official codemod
     (`npx codemod@latest @nodejs/…`), offer to run it and review its diff.
   - `native-addon-rebuild`: reinstall on Node 26 and run the tests; check each listed addon has a Node 26 build.

5. Run it again until no errors are left, then tell the user which workflow or image build to watch.

## Rules for you

- Don't push, publish or rebuild production images to "test" a fix. The fixes are text changes; the user's CI runs them.
- A Dockerfile stage that runs as a non-root `USER` gets no rewrite: put the install before the `USER` line by hand.
- Findings on `mcr.microsoft.com/playwright` images are warnings: their Node depends on when the image was built.
- The scanner doesn't read Node code that shells out (`execSync("corepack enable")`). Search for those by hand:
  `grep -rn "corepack" --include=*.{js,mjs,cjs,ts} .`

## Exit codes

0 nothing at the `--fail-on` level (default `error`), 1 findings at that level, 2 bad usage.
