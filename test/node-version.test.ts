import { describe, expect, it } from "vitest";
import { fromDockerImage, fromSpec, pinnedTag } from "../src/node-version.ts";

describe("fromSpec", () => {
  it.each([
    ["lts/*", 26, "lts"],
    ["node", 26, "current"],
    ["latest", 26, "current"],
    [">=22", 26, "current"],
    ["26", 26, undefined],
    ["26.x", 26, undefined],
    ["v24.11.0", 24, undefined],
    ["lts/jod", 22, undefined],
    ["lts/krypton", 24, undefined],
    ["lithium", 26, undefined],
    ["lts/-1", 24, undefined],
    ["^20 || ^22", 22, undefined],
    ["'22'", 22, undefined],
  ])("%s -> %s", (spec, major, floating) => {
    const r = fromSpec(spec)!;
    expect(r.major).toBe(major);
    expect(r.floating).toBe(floating);
  });

  it("does not guess expressions", () => {
    expect(fromSpec("${{ matrix.node }}")).toBeUndefined();
    expect(fromSpec("")).toBeUndefined();
  });
});

describe("fromDockerImage", () => {
  it.each([
    ["node", 26, "current"],
    ["node:lts", 26, "lts"],
    ["node:lts-alpine3.22", 26, "lts"],
    ["node:alpine", 26, "current"],
    ["node:current-slim", 26, "current"],
    ["node:26-bookworm-slim", 26, undefined],
    ["node:24.11-alpine", 24, undefined],
    ["node:lts-krypton", 24, undefined],
    ["node:jod-alpine", 22, undefined],
    ["docker.io/library/node:lts", 26, "lts"],
    ["public.ecr.aws/docker/library/node:22", 22, undefined],
    ["cimg/node:26.1", 26, undefined],
  ])("%s -> %s", (ref, major, floating) => {
    const r = fromDockerImage(ref)!;
    expect(r.runtime.major).toBe(major);
    expect(r.runtime.floating).toBe(floating);
  });

  it("ignores other images and keeps digests", () => {
    expect(fromDockerImage("python:3.13")).toBeUndefined();
    expect(fromDockerImage("mcr.microsoft.com/devcontainers/javascript-node:22")).toBeUndefined();
    expect(fromDockerImage("node:lts@sha256:abc")!.digest).toBe(true);
  });
});

describe("pinnedTag", () => {
  it.each([
    [undefined, "26"],
    ["latest", "26"],
    ["lts", "26"],
    ["lts-alpine", "26-alpine"],
    ["lts-bookworm-slim", "26-bookworm-slim"],
    ["current-alpine3.22", "26-alpine3.22"],
    ["alpine", "26-alpine"],
    ["slim", "26-slim"],
  ])("%s -> %s", (tag, want) => expect(pinnedTag(tag, 26)).toBe(want));
});
