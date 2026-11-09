#!/usr/bin/env bash
# Checks the claims behind the rules on the official Node.js 26 (and 25) Linux builds, without Docker:
# downloads the release tarballs, verifies them against SHASUMS256.txt, and runs each probe.
# Usage: examples/node26-runtime-check.sh [work-dir]   (default: a new temp dir; needs curl, tar, xz)
set -uo pipefail

SCANNER="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)/skills/node26-lts-upgrade/scripts/node26check.mjs"
WORK="${1:-$(mktemp -d)}"
mkdir -p "$WORK"
cd "$WORK" || exit 1
V26=v26.13.0
V25=v25.9.0

fetch() {
  local v=$1 tarball="node-$1-linux-x64.tar.xz"
  [ -f "$tarball" ] || curl -sSfLO "https://nodejs.org/dist/$v/$tarball"
  curl -sSfL "https://nodejs.org/dist/$v/SHASUMS256.txt" | grep " $tarball\$" | sha256sum -c - >/dev/null || { echo "checksum failed for $tarball"; exit 1; }
  [ -d "node-$v-linux-x64" ] || tar -xJf "$tarball"
}
fetch "$V26"
fetch "$V25"
N26="$WORK/node-$V26-linux-x64/bin"
N25="$WORK/node-$V25-linux-x64/bin"
# Only the downloaded Node on PATH, like a fresh node:26 image (plus coreutils).
BASE_PATH=/usr/bin:/bin

step() { printf '\n### %s\n\n```console\n' "$1"; }
end() { printf '```\n'; }
REPO="$(dirname "$(dirname "$(dirname "$(dirname "$SCANNER")")")")"
mask() { sed -e "s#$WORK#<work>#g" -e "s#$REPO#<repo>#g" -e "s#$HOME#~#g"; }
run() { printf '$ %s\n' "$*" | mask; bash -c "$*" 2>&1 | mask; printf '[exit %s]\n' "${PIPESTATUS[0]}"; }

echo "## Runtime checks on the official Linux x64 builds ($(date -u +%Y-%m-%d))"

step "1. Node 26 ships npm but no corepack, pnpm or yarn"
export PATH="$N26:$BASE_PATH"
run "node --version && npm --version"
run "ls \"$N26\""
run "corepack enable"
run "yarn --version"
end

step "2. npm install -g corepack@0.36.0 brings corepack back (global prefix in a temp dir)"
export npm_config_prefix="$WORK/prefix26"
export PATH="$WORK/prefix26/bin:$N26:$BASE_PATH"
run "npm install -g corepack@0.36.0 --no-fund --no-audit"
run "corepack --version"
run "corepack enable && ls \"$WORK/prefix26/bin\""
mkdir -p "$WORK/pnpm-app" && printf '{ "name": "pnpm-app", "private": true, "packageManager": "pnpm@10.34.9" }\n' > "$WORK/pnpm-app/package.json"
run "cd \"$WORK/pnpm-app\" && COREPACK_ENABLE_DOWNLOAD_PROMPT=0 pnpm --version"
unset npm_config_prefix
end

step "3. On Node 25, corepack 0.36.0 installs with an EBADENGINE warning (its engines skip 25)"
export npm_config_prefix="$WORK/prefix25"
export PATH="$WORK/prefix25/bin:$N25:$BASE_PATH"
run "node --version && ls \"$N25\""
run "npm install -g corepack@0.36.0 --no-fund --no-audit"
run "corepack --version"
unset npm_config_prefix
end

export PATH="$N26:$BASE_PATH"
step "4. Yarn 1 from npm, and packageManager pointing at Yarn 4"
export npm_config_prefix="$WORK/prefix-yarn"
export PATH="$WORK/prefix-yarn/bin:$N26:$BASE_PATH"
run "npm install -g yarn@1.22.22 --no-fund --no-audit && yarn --version"
mkdir -p "$WORK/berry-app" && printf '{ "name": "berry-app", "private": true, "packageManager": "yarn@4.10.3" }\n' > "$WORK/berry-app/package.json"
run "cd \"$WORK/berry-app\" && yarn install"
unset npm_config_prefix
export PATH="$N26:$BASE_PATH"
end

step "5. --experimental-transform-types is gone in 26 (and still accepted in 25)"
printf 'enum Color { Red }\nconsole.log(Color.Red);\n' > "$WORK/enum.ts"
printf 'const n: number = 1;\nconsole.log("strip ok", n);\n' > "$WORK/erasable.ts"
run "node --experimental-transform-types \"$WORK/erasable.ts\""
run "NODE_OPTIONS=--experimental-transform-types node \"$WORK/erasable.ts\""
run "node \"$WORK/erasable.ts\""
run "node \"$WORK/enum.ts\""
run "\"$N25/node\" --experimental-transform-types \"$WORK/enum.ts\""
end

step "6. NODE_MODULE_VERSION"
run "node -p process.versions.modules"
run "\"$N25/node\" -p process.versions.modules"
end

step "7. APIs at End-of-Life in 25 and 26"
cat > "$WORK/apis.cjs" <<'EOF'
const show = (label, fn) => {
  try { console.log(`${label}: ${fn()}`); } catch (e) { console.log(`${label}: throws ${e.code ?? e.name}: ${e.message.split("\n")[0]}`); }
};
const fs = require("node:fs");
const http = require("node:http");
const assert = require("node:assert");
const repl = require("node:repl");
const Module = require("node:module");
const crypto = require("node:crypto");
const path = require("node:path");
const os = require("node:os");
show("DEP0193 require('_stream_transform')", () => typeof require("_stream_transform"));
show("DEP0193 require('node:_stream_readable')", () => typeof require("node:_stream_readable"));
show("DEP0125 require('_stream_wrap')", () => typeof require("_stream_wrap"));
show("DEP0063 typeof ServerResponse.prototype.writeHeader", () => typeof http.ServerResponse.prototype.writeHeader);
show("DEP0030 typeof require('buffer').SlowBuffer", () => typeof require("node:buffer").SlowBuffer);
show("DEP0176 fs.R_OK", () => String(fs.R_OK));
show("DEP0176 fs.constants.R_OK", () => String(fs.constants.R_OK));
show("DEP0173 typeof assert.CallTracker", () => typeof assert.CallTracker);
show("DEP0077 typeof Module._debug", () => typeof Module._debug);
show("DEP0185 repl.REPLServer() without new", () => typeof repl.REPLServer({ input: process.stdin, output: new (require("node:stream").PassThrough)(), terminal: false }));
show("DEP0094 assert.fail(1, 2)", () => assert.fail(1, 2));
show("DEP0154 generateKeyPairSync('rsa-pss', { hash })", () => {
  const { privateKey } = crypto.generateKeyPairSync("rsa-pss", { modulusLength: 1024, hash: "sha256", mgf1Hash: "sha256" });
  return JSON.stringify(privateKey.asymmetricKeyDetails);
});
show("DEP0147 fs.rmdirSync(nonEmptyDir, { recursive: true })", () => {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), "rmdir-"));
  fs.writeFileSync(path.join(dir, "f.txt"), "x");
  fs.rmdirSync(dir, { recursive: true });
  return `dir still exists: ${fs.existsSync(dir)}`;
});
let fired = false;
process.on("multipleResolves", () => { fired = true; });
new Promise((resolve) => { resolve(1); resolve(2); });
setTimeout(() => console.log(`DEP0160 multipleResolves handler fired: ${fired}`), 10);
EOF
cat > "$WORK/worker.cjs" <<'EOF'
const { Worker } = require("node:worker_threads");
const w = new Worker("setInterval(() => {}, 1000)", { eval: true });
try {
  const r = w.terminate(() => console.log("DEP0132 terminate callback ran"));
  console.log(`DEP0132 terminate(callback) returned ${r && typeof r.then === "function" ? "a promise" : typeof r}`);
  r?.then?.(() => setTimeout(() => process.exit(0), 50));
} catch (e) {
  console.log(`DEP0132 terminate(callback): throws ${e.code ?? e.name}: ${e.message}`);
  w.terminate();
}
EOF
cat > "$WORK/deprecations.mjs" <<'EOF'
import { createHash } from "node:crypto";
import { register } from "node:module";
createHash("shake256").update("x").digest("hex");
register("data:text/javascript,export {}", import.meta.url);
EOF
run "node \"$WORK/apis.cjs\""
run "node \"$WORK/worker.cjs\""
run "node \"$WORK/deprecations.mjs\""
run "\"$N25/node\" -e 'console.log(typeof require(\"_stream_transform\"), typeof require(\"node:http\").ServerResponse.prototype.writeHeader)'"
end

step "8. engines.node that leaves out 26"
mkdir -p "$WORK/engines-app" && printf '{ "name": "engines-app", "version": "1.0.0", "private": true, "engines": { "node": "^20 || ^22 || ^24" }, "dependencies": { "ms": "2.1.3" } }\n' > "$WORK/engines-app/package.json"
run "cd \"$WORK/engines-app\" && npm install --no-fund --no-audit"
run "cd \"$WORK/engines-app\" && npm install --engine-strict --no-fund --no-audit"
export npm_config_prefix="$WORK/prefix-yarn"
export PATH="$WORK/prefix-yarn/bin:$N26:$BASE_PATH"
run "cd \"$WORK/engines-app\" && rm -rf node_modules package-lock.json && yarn install --no-lockfile"
unset npm_config_prefix
end

step "9. The --fix output runs on Node 26: RUN lines rewritten by the scanner, executed as-is"
mkdir -p "$WORK/fix-app"
printf '{ "name": "fix-app", "private": true, "packageManager": "pnpm@10.34.9" }\n' > "$WORK/fix-app/package.json"
printf 'FROM node:lts-alpine\nRUN corepack enable && corepack prepare pnpm@10.34.9 --activate && pnpm --version\n' > "$WORK/fix-app/Dockerfile"
printf 'FROM node:26-slim\nRUN yarn --version\n' > "$WORK/fix-app/Dockerfile.yarn"
run "node \"$SCANNER\" \"$WORK/fix-app\" --fix --fail-on none --no-color | sed -n '/^---/,/^Fixed/p'"
for df in Dockerfile Dockerfile.yarn; do
  line=$(grep '^RUN ' "$WORK/fix-app/$df" | sed 's/^RUN //')
  export npm_config_prefix="$WORK/prefix-fix-$df"
  export PATH="$WORK/prefix-fix-$df/bin:$N26:$BASE_PATH"
  export COREPACK_ENABLE_DOWNLOAD_PROMPT=0
  run "cd \"$WORK/fix-app\" && $line"
  unset npm_config_prefix
done
export PATH="$N26:$BASE_PATH"
end
