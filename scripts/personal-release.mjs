import assert from "node:assert/strict";
import { readFileSync, writeFileSync, appendFileSync } from "node:fs";

// Keep upstream's version files untouched so release merges stay simple.
const config = JSON.parse(readFileSync("src-tauri/tauri.conf.json", "utf8"));
const personal = JSON.parse(readFileSync("src-tauri/tauri.personal.conf.json", "utf8"));
const build = process.env.GITHUB_RUN_ID;
assert.match(config.version, /^\d+\.\d+\.\d+$/);
assert.match(build || "", /^[1-9]\d*$/);
const version = `${config.version}-personal.${build}`;
const tag = `personal-${version}`;
const repository = "Yeman-sker/monocode";
assert.equal(process.env.GITHUB_REPOSITORY, repository);
assert.deepEqual(personal.plugins.updater.endpoints, [
  `https://github.com/${repository}/releases/latest/download/latest.json`,
]);
assert.ok(personal.plugins.updater.pubkey);

if (process.argv[2] === "prepare") {
  writeFileSync("src-tauri/tauri.personal.build.json", JSON.stringify({ ...personal, version }));
  if (process.env.GITHUB_OUTPUT) {
    appendFileSync(process.env.GITHUB_OUTPUT, `version=${version}\ntag=${tag}\n`);
  }
  console.log(`Personal release: ${version}`);
} else if (process.argv[2] === "manifest") {
  const signature = readFileSync(process.argv[3], "utf8").trim();
  assert.ok(signature, "Missing updater signature");
  writeFileSync("latest.json", JSON.stringify({
    version,
    notes: `MonoCode ${config.version} with personal improvements (Pi background session retention and activity feedback).`,
    pub_date: new Date().toISOString(),
    platforms: {
      "darwin-aarch64": {
        signature,
        url: `https://github.com/${repository}/releases/download/${tag}/MonoCode.app.tar.gz`,
      },
    },
  }, null, 2) + "\n");
} else {
  throw new Error("Usage: node scripts/personal-release.mjs prepare|manifest [signature file]");
}
