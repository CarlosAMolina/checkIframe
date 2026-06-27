import { readFileSync, writeFileSync, cpSync, mkdirSync, rmSync } from "fs";
import { dirname, join } from "path";
import { fileURLToPath } from "url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = join(__dirname, "..");
const SRC = join(ROOT, "src");
const DIST = join(ROOT, "dist");

function cleanDist() {
  rmSync(DIST, { recursive: true, force: true });
}

function buildFirefox() {
  const dest = join(DIST, "firefox");
  cpSync(SRC, dest, { recursive: true });
}

function buildChrome() {
  const dest = join(DIST, "chrome");
  cpSync(SRC, dest, { recursive: true });
  const manifestPath = join(dest, "manifest.json");
  const manifest = JSON.parse(readFileSync(manifestPath, "utf-8"));
  const backgroundScript = manifest.background.scripts[0];
  manifest.background = {
    service_worker: backgroundScript,
    type: "module",
  };
  delete manifest.browser_specific_settings;
  writeFileSync(manifestPath, JSON.stringify(manifest, null, 2) + "\n");
}

cleanDist();
mkdirSync(DIST, { recursive: true });
buildFirefox();
buildChrome();
console.log("Build complete: dist/firefox/ and dist/chrome/");
