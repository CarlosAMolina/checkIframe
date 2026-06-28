import { readFileSync } from "fs";
import { dirname, join } from "path";
import { fileURLToPath } from "url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = join(__dirname, "..");

const packageVersion = readVersion(join(ROOT, "package.json"));
const manifestVersion = readVersion(join(ROOT, "src", "manifest.json"));

if (packageVersion !== manifestVersion) {
  console.error(
    `Version mismatch: package.json (${packageVersion}) !== src/manifest.json (${manifestVersion})`,
  );
  process.exit(1);
}

console.log(`Version check passed: ${packageVersion}`);

function readVersion(filePath) {
  return JSON.parse(readFileSync(filePath, "utf-8")).version;
}

