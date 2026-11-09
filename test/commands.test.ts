import { describe, expect, it } from "vitest";
import { findCommands, provides } from "../src/commands.ts";

const progs = (text: string, quotesSplit = false) => findCommands(text, 0, text.length, { quotesSplit }).map((c) => c.program);

describe("findCommands", () => {
  it("splits on shell operators and skips env prefixes and sudo", () => {
    expect(progs("corepack enable && pnpm i; CI=1 sudo -E yarn build | tee log")).toEqual(["corepack", "pnpm", "yarn", "tee"]);
    expect(progs("if [ -f x ]; then corepack enable; fi")).toEqual(["corepack", "fi"]);
    expect(progs("echo $(corepack --version)")).toEqual(["echo", "corepack"]);
  });

  it("does not treat arguments or comments as commands", () => {
    expect(progs("npm i -g corepack # then corepack enable")).toEqual(["npm"]);
    expect(progs("echo 'corepack enable'")).toEqual(["echo"]);
    expect(progs("npx corepack enable")).toEqual(["npx"]);
  });

  it("follows backslash continuations and Makefile prefixes", () => {
    const text = "corepack enable \\\n  && pnpm install";
    expect(progs(text)).toEqual(["corepack", "pnpm"]);
    const make = "\t@corepack enable";
    const [c] = findCommands(make, 0, make.length);
    expect(c!.program).toBe("corepack");
    expect(make.slice(c!.start)).toBe("corepack enable");
  });

  it("splits on quotes for Jenkins sh steps", () => {
    expect(progs("sh 'corepack enable'", true)).toEqual(["sh", "corepack"]);
  });
});

describe("provides", () => {
  const one = (t: string) => [...provides(findCommands(t, 0, t.length)[0]!)].sort();
  it("knows the ways to install corepack, pnpm and yarn", () => {
    expect(one("npm install -g corepack@0.36.0")).toEqual(["corepack"]);
    expect(one("npm i --global pnpm@10")).toEqual(["pnpm"]);
    expect(one("corepack enable")).toEqual(["pnpm", "yarn"]);
    expect(one("corepack enable pnpm")).toEqual(["pnpm"]);
    expect(one("apk add --no-cache yarn")).toEqual(["yarn"]);
    expect(one("curl -fsSL https://get.pnpm.io/install.sh")).toEqual(["pnpm"]);
    expect(one("npm install corepack")).toEqual([]);
  });
});

describe("GitHub expressions", () => {
  it("keeps ${{ … }} in one word and ignores operators inside it", () => {
    const t = "docker run -e X=${{ vars.A || 'b' }} img:v${{ steps.v.outputs.version }}-noble sh -c \"corepack enable\"";
    const [c] = findCommands(t, 0, t.length);
    expect(c!.program).toBe("docker");
    expect(c!.words.map((w) => w.raw)).toEqual(["run", "-e", "X=${{ vars.A || 'b' }}", "img:v${{ steps.v.outputs.version }}-noble", "sh", "-c", "\"corepack enable\""]);
  });
});

describe("continuations", () => {
  it("drops backslash-newlines from the words", () => {
    const t = "docker run --rm \\\n  -w /app \\\n  node:26 \\\n  sh -c 'corepack enable'";
    const [c] = findCommands(t, 0, t.length);
    expect(c!.words.map((w) => w.raw)).toEqual(["run", "--rm", "-w", "/app", "node:26", "sh", "-c", "'corepack enable'"]);
  });
});
