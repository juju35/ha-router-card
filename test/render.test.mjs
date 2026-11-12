// Browser tests (Chromium through Playwright) of the rendered cards: every mock integration renders in both cards
// without error, at the narrowest width they declare and in the longest translations nothing leaves the card, no
// control sits inside an element with role="button", the detail button switches the mini card to the full card and
// back, and the Wi-Fi switch and the restart button ask before acting. Skipped when Playwright or Chromium is not
// installed, except in CI, where it must run. CHROMIUM_PATH points to a local Chromium if needed.
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { after, before, test } from "node:test";
import { integrations } from "../scripts/mock-states.mjs";

const src = readFileSync(new URL("../src/router-card.js", import.meta.url), "utf8");

let browser;
let skip = false;
before(async () => {
  try {
    const { chromium } = await import("playwright");
    browser = await chromium.launch(process.env.CHROMIUM_PATH ? { executablePath: process.env.CHROMIUM_PATH } : {});
  } catch (err) {
    if (process.env.CI) throw err;
    skip = `Chromium not available: ${err.message.split("\n")[0]}`;
  }
});
after(() => browser?.close());

// A page with one card of `type`, `width` px wide, on the mock `hass`; window.calls records the service calls.
const open = async (type, mock, { width = 460, language = "en", config = {} } = {}) => {
  const page = await browser.newPage({ viewport: { width: 1000, height: 1600 } });
  const errors = [];
  page.on("pageerror", (e) => errors.push(e.message));
  await page.setContent(`<!doctype html><body style="margin:0;font-family:sans-serif"><div id=root style="width:${width}px"></div><p id=outside>outside</p></body>`);
  await page.addScriptTag({ content: 'customElements.define("ha-card", class extends HTMLElement { constructor() { super(); this.attachShadow({ mode: "open" }).innerHTML = "<style>:host{display:block;overflow:hidden}</style><slot></slot>"; } });' });
  await page.addScriptTag({ content: src });
  await page.evaluate(
    ({ type, config, language, states, entities, devices }) => {
      const el = document.createElement(type);
      el.setConfig({ type: `custom:${type}`, ...config });
      window.calls = [];
      el.hass = {
        states, entities, devices, language, locale: { language }, config: { time_zone: "UTC" },
        callService: (domain, service, data) => window.calls.push([domain, service, data.entity_id]),
      };
      document.getElementById("root").appendChild(el);
      window.card = el;
      window.click = (node) => node.dispatchEvent(new MouseEvent("click", { bubbles: true, composed: true, detail: 1 }));
    },
    { type, config, language, ...mock }
  );
  return { page, errors };
};

for (const [name, mock] of Object.entries(integrations)) {
  for (const type of ["router-card", "router-mini-card"]) {
    test(`${name}: ${type} renders, no control inside a role="button", nothing overflows`, async (t) => {
      if (skip) return t.skip(skip);
      for (const [language, width] of [["en", 460], ["en", type === "router-card" ? 240 : 160], ["pl", 240], ["el", 240], ["sr-Latn", 240]]) {
        const { page, errors } = await open(type, mock, { width, language });
        const res = await page.evaluate(() => {
          const root = window.card.shadowRoot;
          const card = root.querySelector("ha-card").getBoundingClientRect();
          const out = [...root.querySelectorAll(".header *, .content > *, .tile, .node, .gauge")]
            .filter((n) => {
              const r = n.getBoundingClientRect();
              return r.width && (r.left < card.left - 0.5 || r.right > card.right + 0.5);
            })
            .map((n) => n.className.baseVal ?? n.className);
          const nested = [...root.querySelectorAll('[role="button"] button, [role="button"] [role="button"], [role="button"] a')].length;
          const name = root.querySelector(".name");
          return { warning: !!root.querySelector(".warning"), out, nested, titleWidth: name ? name.getBoundingClientRect().width : 0 };
        });
        assert.deepEqual(errors, [], `${language} ${width}px`);
        assert.equal(res.warning, false, `${language} ${width}px: no router found`);
        assert.deepEqual(res.out, [], `${language} ${width}px: out of the card`);
        assert.equal(res.nested, 0, `${language} ${width}px: control inside a role="button"`);
        assert.ok(res.titleWidth >= 30, `${language} ${width}px: title squeezed to ${res.titleWidth}px`);
        await page.close();
      }
    });
  }
}

test("the detail button shows the full card and goes back to the mini card; a click outside folds it", async (t) => {
  if (skip) return t.skip(skip);
  const { page, errors } = await open("router-mini-card", integrations.unifi);
  const res = await page.evaluate(() => {
    const view = () => ({ full: !!window.card.shadowRoot.querySelector(".section-title"), size: window.card.getCardSize() });
    const before = view();
    window.click(window.card.shadowRoot.querySelector(".zoom"));
    const zoomed = view();
    const sections = [...window.card.shadowRoot.querySelectorAll(".section-title")].map((n) => n.textContent);
    window.click(document.getElementById("outside"));
    return { before, zoomed, sections, after: view() };
  });
  assert.deepEqual(res.before, { full: false, size: 3 });
  assert.deepEqual(res.zoomed, { full: true, size: 7 });
  assert.deepEqual(res.sections, ["Network", "System", "Network devices", "Local network"]);
  assert.deepEqual(res.after, { full: false, size: 3 });
  assert.deepEqual(errors, []);
  await page.close();
});

test("a Wi-Fi network goes off and the router restarts only once confirmed; Wi-Fi goes on at once", async (t) => {
  if (skip) return t.skip(skip);
  const { page, errors } = await open("router-card", integrations.unifi);
  // Each step waits out the guard that follows a closed popup (the rest of a double click is ignored).
  const step = async (fn) => {
    const out = await page.evaluate(fn);
    await page.waitForTimeout(450);
    return out;
  };
  const sel = (id) => `.toggle[data-id="${id}"]`;
  const asked = await step(() => {
    window.click(window.card.shadowRoot.querySelector('.toggle[data-id="switch.home_wifi"]'));
    const title = window.card.shadowRoot.querySelector(".modal h3")?.textContent;
    window.click(window.card.shadowRoot.querySelector('[data-action="dialog-cancel"]'));
    return title;
  });
  assert.equal(asked, "Turn the Wi-Fi off");
  assert.deepEqual(await page.evaluate(() => window.calls), []);
  await step(() => {
    window.click(window.card.shadowRoot.querySelector('.toggle[data-id="switch.home_wifi"]'));
    window.click(window.card.shadowRoot.querySelector('[data-action="dialog-ok"]'));
  });
  await step(() => {
    window.click(window.card.shadowRoot.querySelector('[data-action="restart"]'));
    window.click(window.card.shadowRoot.querySelector('[data-action="dialog-ok"]'));
  });
  await step(() => window.click(window.card.shadowRoot.querySelector('.toggle[data-id="switch.guest_wifi"]')));
  assert.equal(await page.evaluate((s) => !!window.card.shadowRoot.querySelector(s), sel("switch.guest_wifi")), true);
  assert.deepEqual(await page.evaluate(() => window.calls), [
    ["switch", "turn_off", "switch.home_wifi"],
    ["button", "press", "button.dream_machine_pro_restart"],
    ["switch", "turn_on", "switch.guest_wifi"],
  ]);
  assert.deepEqual(errors, []);
  await page.close();
});
