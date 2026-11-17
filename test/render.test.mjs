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
      // A tap: press and release (on iOS a tap on something not clickable sends no click at all).
      window.tap = (down, up = down) => {
        down.dispatchEvent(new PointerEvent("pointerdown", { bubbles: true, composed: true }));
        up.dispatchEvent(new PointerEvent("pointerup", { bubbles: true, composed: true }));
      };
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

test("the detail button shows the full card and goes back to the mini card; a tap outside folds it", async (t) => {
  if (skip) return t.skip(skip);
  const { page, errors } = await open("router-mini-card", integrations.unifi);
  const res = await page.evaluate(() => {
    const view = () => ({ full: !!window.card.shadowRoot.querySelector(".section-title"), size: window.card.getCardSize() });
    const outside = document.getElementById("outside");
    const before = view();
    window.click(window.card.shadowRoot.querySelector(".zoom"));
    const zoomed = view();
    const sections = [...window.card.shadowRoot.querySelectorAll(".section-title")].map((n) => n.textContent);
    // Pressed in the card and released outside of it (a slider dragged out): nothing folds.
    window.tap(window.card, outside);
    const dragged = view();
    // A tap elsewhere with no click (iOS): the pointer alone folds it.
    window.tap(outside);
    const tapped = view();
    // Left zoomed and back on the page: compact.
    window.click(window.card.shadowRoot.querySelector(".zoom"));
    const root = document.getElementById("root");
    root.removeChild(window.card);
    root.appendChild(window.card);
    return { before, zoomed, sections, dragged, tapped, back: view() };
  });
  assert.deepEqual(res.before, { full: false, size: 3 });
  assert.deepEqual(res.zoomed, { full: true, size: 7 });
  assert.deepEqual(res.sections, ["Network", "System", "Network devices", "Local network"]);
  assert.deepEqual(res.dragged, { full: true, size: 7 });
  assert.deepEqual(res.tapped, { full: false, size: 3 });
  assert.deepEqual(res.back, { full: false, size: 3 });
  assert.deepEqual(errors, []);
  await page.close();
});

test("no rewrite under a press: drawn by the click, or once released", async (t) => {
  if (skip) return t.skip(skip);
  const { page, errors } = await open("router-card", integrations.unifi);
  const res = await page.evaluate(async () => {
    const card = window.card;
    const title = () => !!card.shadowRoot.querySelector(".section-title");
    const press = (node) => node.dispatchEvent(new PointerEvent("pointerdown", { bubbles: true, composed: true }));
    const release = (node) => node.dispatchEvent(new PointerEvent("pointerup", { bubbles: true, composed: true }));
    const before = card.shadowRoot.innerHTML;
    const node = card.shadowRoot.querySelector(".section-title");
    press(node);
    // An update arrives while the pointer is down: held.
    card.setConfig({ type: "custom:router-card", title: "Held under the pointer", show_network: false });
    const held = card.shadowRoot.innerHTML === before;
    // Released with its click: drawn.
    release(node);
    window.click(node);
    await new Promise((r) => setTimeout(r, 20));
    const drawn = card.shadowRoot.innerHTML !== before;
    return { had: title() || before.length > 0, held, drawn, pressing: card._pressing };
  });
  assert.deepEqual(res, { had: true, held: true, drawn: true, pressing: false });
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

// In-page audit of the header (string spliced into page.evaluate): every title block with a status pill —
// the pill on the title row only beside a whole title, its label whole or its dot alone (≤ 200 px: dot alone),
// nothing of the title block below the banner's ground strip or outside the banner.
const pillAudit = (r, width, pillSel, nameSel, groundSel, bannerSel = ".banner") => {
  const res = [];
  const shown = (e) => e && e.getClientRects().length && getComputedStyle(e).visibility !== "hidden";
  const cut = (e) => [e, ...e.querySelectorAll("*")].some((x) => shown(x) && x.clientWidth > 1 && getComputedStyle(x).overflow !== "visible" && x.scrollWidth > x.clientWidth + 1);
  const pills = [...r.querySelectorAll(pillSel)].filter(shown);
  if (!pills.length) return ["no pill"];
  for (const pill of pills) {
    const pb = pill.getBoundingClientRect();
    const dot = pb.width < 30;
    if (width <= 200 && !dot) res.push(`pill "${pill.textContent.trim()}" not a dot at ${width}px`);
    if (!dot && cut(pill)) res.push(`pill "${pill.textContent.trim()}" label cut`);
    const name = pill.parentElement.querySelector(nameSel) || pill.closest(".titles")?.querySelector(nameSel);
    if (shown(name)) {
      const nb = name.getBoundingClientRect();
      const onRow = Math.abs(pb.top + pb.height / 2 - (nb.top + nb.height / 2)) < nb.height / 2;
      const range = document.createRange();
      range.selectNodeContents(name);
      if (onRow && range.getBoundingClientRect().width > nb.width + 0.01) res.push(`title "${name.textContent.trim()}" ellipsised beside the pill`);
    }
    const banner = pill.closest(bannerSel);
    if (!banner) continue;
    const bb = banner.getBoundingClientRect();
    const floor = banner.querySelector(groundSel)?.getBoundingClientRect().top ?? bb.bottom;
    const block = pill.closest(".titles") || pill.parentElement;
    for (const x of [block, ...block.children, ...block.querySelectorAll(":scope > .trow > *")]) {
      if (!shown(x)) continue;
      const xb = x.getBoundingClientRect();
      if (!xb.width || !xb.height) continue;
      if (xb.bottom > floor + 0.5 || xb.top < bb.top - 0.5 || xb.right > bb.right + 0.5 || xb.left < bb.left - 0.5) {
        res.push(`${x.className || x.tagName} outside the banner above its ground strip`);
        break;
      }
    }
  }
  return res;
};

// en, fr, de, hu, el and ru from 190 to 500 px, the device's own title and a long one, full card, mini card and zoomed
// mini card (UniFi: an update waiting, so the full card also has its second pill).
test("status pill: beside a whole title or under the subtitle, label whole or dot alone, inside the banner", async (t) => {
  if (skip) return t.skip(skip);
  const failures = [];
  for (const type of ["router-card", "router-mini-card"])
    for (const zoom of type === "router-mini-card" ? [false, true] : [false]) {
      const { page, errors } = await open(type, integrations.unifi, { width: 500 });
      const out = await page.evaluate(
        async ({ type, zoom, audit }) => {
          const pillAudit = new Function(`return (${audit})`)();
          const frame = () => new Promise((r) => requestAnimationFrame(() => requestAnimationFrame(r)));
          const hass = window.card.hass;
          const res = [];
          for (const language of ["en", "fr", "de", "hu", "el", "ru"])
            for (const width of [190, 245, 300, 400, 460, 500])
              for (const title of [undefined, "Dream Machine Pro Max Living room"]) {
                const root = document.getElementById("root");
                root.style.width = `${width}px`;
                const el = document.createElement(type);
                el.setConfig({ type: `custom:${type}`, language, ...(title ? { title } : {}) });
                el.hass = { ...hass, language, locale: { language } };
                root.replaceChildren(el);
                if (zoom) window.click(el.shadowRoot.querySelector(".zoom"));
                await frame();
                await frame();
                const what = `${type}${zoom ? " zoomed" : ""} ${language} ${width}px${title ? " long title" : ""}`;
                const pills = ".banner .chip.status, .banner .trow > .chip.upd";
                for (const f of pillAudit(el.shadowRoot, width, pills, ".name", ".rc-ground")) res.push(`${what}: ${f}`);
                const p = el.shadowRoot.querySelector(".banner .chip.status");
                if (p.getAttribute("aria-label") !== { en: "WAN · Online" }[language] && language === "en") res.push(`${what}: label ${p.getAttribute("aria-label")}`);
              }
          return res;
        },
        { type, zoom, audit: pillAudit.toString() }
      );
      failures.push(...out, ...errors);
      await page.close();
    }
  assert.deepEqual(failures, []);
});

test("header buttons: the detail button in the banner's top right corner, the restart button on its left", async (t) => {
  if (skip) return t.skip(skip);
  for (const zoom of [false, true])
    for (const width of [245, 300, 400]) {
      const { page } = await open("router-mini-card", integrations.unifi, { width });
      if (zoom) await page.evaluate(() => window.click(window.card.shadowRoot.querySelector(".zoom")));
      const r = await page.evaluate(() => {
        const root = window.card.shadowRoot;
        const b = root.querySelector(".banner").getBoundingClientRect();
        const z = root.querySelector(".zoom").getBoundingClientRect();
        const a = root.querySelector(".banner .action")?.getBoundingClientRect();
        return { top: z.top - b.top, right: b.right - z.right, w: z.width, h: z.height, a: a && { top: a.top - b.top, gap: z.left - a.right } };
      });
      const at = `${zoom ? "zoomed" : "compact"} ${width}px`;
      assert.deepEqual([r.top, r.right, r.w, r.h], [5, 5, 24, 24], at);
      if (zoom) assert.deepEqual([r.a.top, r.a.gap], [5, 4], `${at}: restart button`);
      await page.close();
    }
});
