// Bundles src/router-card.js into the single Marketplace file dist/router-card.js, inlining the brand logos
// ("__IMG_FILE:<file>__", SVG or PNG) from images/<file> when that file is there, else leaving them out (empty: the header then
// shows the device icon without a logo badge), so the card needs no extra resource.
// Usage: node scripts/build.mjs  (dist/ is not committed: CI and the release workflow build it)
import { existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { splitDist } from "./i18n-split.mjs";

const root = fileURLToPath(new URL("..", import.meta.url));
const pkg = JSON.parse(readFileSync(`${root}package.json`, "utf8"));
const b64 = (file) => readFileSync(`${root}images/${file}`).toString("base64");
const mime = (file) => (file.endsWith(".png") ? "image/png" : "image/svg+xml");

const out = readFileSync(`${root}src/router-card.js`, "utf8")
  .replace("__VERSION__", pkg.version)
  .replace(/__IMG_FILE:([\w.-]+)__/g, (_, file) => (existsSync(`${root}images/${file}`) ? `data:${mime(file)};base64,${b64(file)}` : ""));

mkdirSync(`${root}dist`, { recursive: true });
writeFileSync(`${root}dist/router-card.js`, out);
console.log(`Built dist/router-card.js (${(out.length / 1024).toFixed(1)} KB)`);

// Translations: English stays in the bundle, each other language goes to dist/router-card.i18n.<lang>.js, fetched
// when a card needs it (scripts/i18n-split.mjs).
if (process.argv[1] === fileURLToPath(import.meta.url)) splitDist(`${root}dist`, "router-card.js", { version: pkg.version });
