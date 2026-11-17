// Renders the cards with mock data (a UniFi gateway as the reference router, then each other integration of
// scripts/mock-states.mjs) and saves the README screenshots.
// The animated header is recorded as GIFs too (needs ffmpeg on PATH).
// Usage: npm run build && npm run screenshots
import { chromium } from "playwright";
import { execFileSync } from "node:child_process";
import { mkdtempSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { fileURLToPath } from "node:url";
import { states, entities, devices, integrations, NOW } from "./mock-states.mjs";
import { load } from "../test/load.mjs";
import { freezeAnimations, saveIfChanged } from "./capture.mjs";

const root = fileURLToPath(new URL("..", import.meta.url));
const cardJs = readFileSync(`${root}dist/router-card.js`, "utf8");

// README copies of the drawn pictures, one per kind of device: images/device-<kind>.svg.
const { IMG_DEVICE } = load("router-card.js", ["IMG_DEVICE"]);
for (const [kind, uri] of Object.entries(IMG_DEVICE))
  writeFileSync(`${root}images/device-${kind}.svg`, `${decodeURIComponent(uri.slice("data:image/svg+xml,".length))}\n`);

const THEMES = {
  light: {
    "--primary-background-color": "#e8eaed",
    "--secondary-background-color": "#ececec",
    "--card-background-color": "#ffffff",
    "--primary-text-color": "#212121",
    "--secondary-text-color": "#727272",
    "--divider-color": "rgba(0,0,0,.12)",
  },
  dark: {
    "--primary-background-color": "#111111",
    "--secondary-background-color": "#282828",
    "--card-background-color": "#1c1c1c",
    "--primary-text-color": "#e1e1e1",
    "--secondary-text-color": "#9b9b9b",
    "--divider-color": "rgba(225,225,225,.12)",
  },
};

// Minimal stand-in for Home Assistant's <ha-card>.
const HA_CARD = `customElements.define("ha-card", class extends HTMLElement {
  constructor() {
    super();
    this.attachShadow({ mode: "open" }).innerHTML =
      "<style>:host{display:block;background:var(--card-background-color);border-radius:12px;" +
      "border:1px solid var(--divider-color);color:var(--primary-text-color);overflow:hidden}</style><slot></slot>";
  }
});`;

const page_html = (theme, width) => `<!doctype html><html><head><meta charset="utf-8">
<style>
  :root { ${Object.entries(THEMES[theme]).map(([k, v]) => `${k}:${v};`).join("")} }
  body { margin: 0; padding: 16px; background: var(--primary-background-color); color: var(--primary-text-color);
         font-family: Roboto, "Segoe UI", Helvetica, Arial, sans-serif; width: ${width}px; }
</style></head><body><div id="root"></div></body></html>`;

const shots = [];
for (const theme of ["light", "dark"]) {
  const dark = theme === "dark" ? "-dark" : "";
  shots.push(
    { file: `card${dark}`, type: "router-card", theme, width: 460, config: {} },
    { file: `mini-card${dark}`, type: "router-mini-card", theme, width: 380, config: {} },
    // The mini card after a click on its detail button: the full card in its place.
    { file: `mini-card-zoom${dark}`, type: "router-mini-card", theme, width: 460, config: {}, zoom: true },
  );
  // The full card of each other integration, with the entities it exposes.
  for (const [name, mock] of Object.entries(integrations)) {
    if (name === "unifi") continue;
    shots.push({ file: `card-${name}${dark}`, type: "router-card", theme, width: 460, config: {}, mock });
  }
}

// Animated header, one GIF per animated state, light and dark: WAN up, the WAN cable flows into the device, packets
// travel to the clients and the Wi-Fi waves blink (WAN down or unavailable, the scene stands still: stills only).
const gifs = ["light", "dark"].map((theme) => ({
  file: `header-online${theme === "dark" ? "-dark" : ""}`,
  type: "router-card",
  theme,
  width: 460,
  config: {},
}));

// Mount one card on a fresh page and return it (shared by the stills and the GIF). Keeps the fixed clock and the
// UTC time zone so the card's uptime and times render the same every run.
async function openCard(browser, s) {
  // A fresh page for each capture: the card script declares its classes and custom elements once per page.
  const page = await browser.newPage({ deviceScaleFactor: 2, viewport: { width: 1000, height: 2000 } });
  page.on("pageerror", (err) => console.error(`${s.file}: ${err.message}`));
  await page.clock.setFixedTime(new Date(NOW));
  await page.setContent(page_html(s.theme, s.width));
  await page.addScriptTag({ content: HA_CARD });
  await page.addScriptTag({ content: cardJs });
  await page.evaluate(
    ({ type, config, zoom, dark, states, entities, devices }) => {
      const el = document.createElement(type);
      el.setConfig({ type: `custom:${type}`, ...config });
      // Recorder statistics: a plausible 24 h rate curve for each rate sensor (busy evening, quiet night), 5-minute
      // rows from the requested start, with an hour without data in the early morning (the curve breaks there).
      const callWS = async (msg) =>
        Object.fromEntries(
          (msg.statistic_ids || []).map((id, k) => [
            id,
            Array.from({ length: 288 }, (_, i) => ({
              start: Date.parse(msg.start_time) + i * 300000,
              // Percentages (CPU, RAM, disk) stay well under 100.
              mean:
                (/cpu|memory|ram|filesystem|disk/.test(id) ? 0.35 : 1) *
                (20 + 80 * Math.exp(-((i - 230 + k * 20) ** 2) / 900) + 35 * Math.exp(-((i - 110) ** 2) / 400) + 8 * Math.sin(i * 0.12 + k) ** 2),
            })).filter((_, i) => i < 60 || i >= 72),
          ])
        );
      el.hass = { states, entities, devices, language: "en", locale: { language: "en" }, config: { time_zone: "UTC" }, themes: { darkMode: dark }, callWS };
      document.getElementById("root").appendChild(el);
      // A mouse click (click count 1), not .click(): no focus ring on the button.
      if (zoom)
        el.shadowRoot.querySelector(".zoom").dispatchEvent(new MouseEvent("click", { bubbles: true, composed: true, detail: 1 }));
    },
    { type: s.type, config: s.config, zoom: !!s.zoom, dark: s.theme === "dark", ...(s.mock || { states, entities, devices }) }
  );
  return page;
}

const browser = await chromium.launch(
  process.env.CHROMIUM_PATH ? { executablePath: process.env.CHROMIUM_PATH } : {}
);
for (const s of shots) {
  const page = await openCard(browser, s);
  await page.waitForTimeout(800);
  const box = await page.locator("#root").boundingBox();
  // Written to a temporary file first: the screenshot is only replaced when its pixels change.
  const tmp = join(tmpdir(), `rc-${process.pid}-${s.file}.png`);
  await page.screenshot({
    path: tmp,
    clip: { x: 0, y: 0, width: s.width + 32, height: Math.ceil(box.height) + 32 },
    animations: "disabled",
  });
  console.log(`screenshots/${s.file}.png${saveIfChanged(tmp, `${root}screenshots/${s.file}.png`) ? "" : " (unchanged)"}`);
  await page.close();
}

// Records the card's header (the banner, cropped) as a looping GIF. Every animation is paused and stepped frame by
// frame, so the GIF is identical whatever the machine's speed.
async function recordGif(browser, g, { fps = 15, seconds = 3 } = {}) {
  const page = await openCard(browser, g);
  await page.waitForTimeout(300);
  const box = await page.evaluate(() => {
    const r = document.querySelector("#root").firstElementChild.shadowRoot.querySelector(".banner").getBoundingClientRect();
    return { y: r.y, bottom: r.bottom };
  });
  const clip = { x: 8, y: 8, width: g.width + 16, height: Math.ceil(box.bottom) - 8 };
  const dir = mkdtempSync(join(tmpdir(), "rc-frames-"));
  for (let i = 0; i < fps * seconds; i++) {
    // A header with nothing to step would record frames at the machine's speed again.
    if (!(await freezeAnimations(page, (i * 1000) / fps))) throw new Error(`${g.file}: no animation found to step`);
    await page.screenshot({ path: join(dir, `f${String(i).padStart(3, "0")}.png`), clip });
  }
  await page.close();
  const tmp = join(dir, "out.gif");
  // Halve the retina capture, one palette computed from all the frames and an ordered (Bayer) dither: deterministic.
  execFileSync("ffmpeg", [
    "-y", "-loglevel", "error", "-framerate", String(fps), "-i", join(dir, "f%03d.png"),
    "-vf", `scale=${clip.width}:-1:flags=lanczos,split[a][b];[a]palettegen=max_colors=128[p];[b][p]paletteuse=dither=bayer:bayer_scale=4`,
    "-loop", "0", tmp,
  ]);
  console.log(`screenshots/${g.file}.gif${saveIfChanged(tmp, `${root}screenshots/${g.file}.gif`) ? "" : " (unchanged)"}`);
  rmSync(dir, { recursive: true });
}

for (const g of gifs) await recordGif(browser, g);

await browser.close();
