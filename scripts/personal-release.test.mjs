import { test } from "node:test";
import assert from "node:assert/strict";
import { spawnSync } from "node:child_process";
import { mkdtempSync, mkdirSync, writeFileSync, readFileSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { join, resolve } from "node:path";

// Exercise the real release script without modifying the working tree.
test("personal feed uses a monotonic version and the fork's signed artifact", () => {
  const cwd = mkdtempSync(join(tmpdir(), "monocode-release-"));
  try {
    mkdirSync(join(cwd, "src-tauri"));
    writeFileSync(join(cwd, "src-tauri/tauri.conf.json"), JSON.stringify({ version: "0.10.0" }));
    writeFileSync(join(cwd, "src-tauri/tauri.personal.conf.json"), readFileSync("src-tauri/tauri.personal.conf.json"));
    writeFileSync(join(cwd, "update.sig"), "signed-artifact\n");
    const script = resolve("scripts/personal-release.mjs");
    const env = { ...process.env, GITHUB_REPOSITORY: "Yeman-sker/monocode", GITHUB_RUN_ID: "123", GITHUB_OUTPUT: "" };
    const run = (...args) => spawnSync(process.execPath, [script, ...args], { cwd, env, encoding: "utf8" });
    assert.equal(run("prepare").status, 0);
    assert.equal(JSON.parse(readFileSync(join(cwd, "src-tauri/tauri.personal.build.json"))).version, "0.10.0-personal.123");
    assert.equal(run("manifest", "update.sig").status, 0);
    const feed = JSON.parse(readFileSync(join(cwd, "latest.json")));
    assert.equal(feed.version, "0.10.0-personal.123");
    assert.deepEqual(feed.platforms["darwin-aarch64"], {
      signature: "signed-artifact",
      url: "https://github.com/Yeman-sker/monocode/releases/download/personal-0.10.0-personal.123/MonoCode.app.tar.gz",
    });
    assert.notEqual(run("manifest", "missing.sig").status, 0);
    env.GITHUB_RUN_ID = "invalid";
    assert.notEqual(run("prepare").status, 0);
    env.GITHUB_RUN_ID = "124";
    assert.equal(run("prepare").status, 0);
    assert.equal(JSON.parse(readFileSync(join(cwd, "src-tauri/tauri.personal.build.json"))).version, "0.10.0-personal.124");
    env.GITHUB_REPOSITORY = "hardbeat920/monocode";
    assert.notEqual(run("prepare").status, 0);
  } finally {
    rmSync(cwd, { recursive: true, force: true });
  }
});
