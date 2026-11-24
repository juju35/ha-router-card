// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------
import { RATE_UNITS } from "./pictures.js";
import { STRINGS } from "./i18n/strings.js";

export const esc = (v) =>
  String(v ?? "").replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[c]);

export const lang = (hass, config) => {
  const l = config?.language || (hass && (hass.locale?.language || hass.language)) || "en";
  return STRINGS[l] ? l : STRINGS[l.split("-")[0]] ? l.split("-")[0] : "en";
};

export const t = (hass, config, key) => STRINGS[lang(hass, config)][key] ?? STRINGS.en[key] ?? key;

/** Text agreeing with the count n: the `key_one/_few/_many` variant picked by Intl.PluralRules when the
 *  language defines it, else the plain key (which serves as the `_other` form). */
export const tn = (hass, config, key, n) => {
  const l = lang(hass, config);
  let form = "other";
  try {
    // The Portuguese texts are European Portuguese: 0 takes the plural there (pt alone means pt-BR to Intl).
    form = new Intl.PluralRules(l === "pt" ? "pt-PT" : l).select(n);
  } catch (_) {}
  return STRINGS[l][`${key}_${form}`] ?? t(hass, config, key);
};

export const num = (s) => {
  if (!s) return null;
  const v = parseFloat(s.state);
  return Number.isFinite(v) ? v : null;
};

/** True when Home Assistant has no value for the entity (unavailable, e.g. while the router restarts, or unknown):
 *  the card then shows it as unavailable, never as a real state (Wi-Fi off, 0 clients, offline). */
export const noValue = (s) => !s || s.state === "unavailable" || s.state === "unknown";

export const RATE_FACTORS = {
  "b/s": 1, "bit/s": 1 / 8, "kbit/s": 125, "mbit/s": 125e3, "gbit/s": 125e6,
  "kb/s": 1e3, "mb/s": 1e6, "gb/s": 1e9, "kib/s": 1024, "mib/s": 1024 ** 2, "gib/s": 1024 ** 3,
};

/** Data rate of a sensor in bytes per second, whatever the unit chosen in Home Assistant. */
export const toBps = (s) => {
  const v = num(s);
  if (v === null) return null;
  const unit = String(s.attributes?.unit_of_measurement || "kB/s").toLowerCase();
  return v * (RATE_FACTORS[unit] ?? 1e3);
};

/** Locale for numbers: the card's language, refined by Home Assistant's own locale when they agree ("fr-CA"). The
 *  Portuguese texts are European Portuguese (pt alone means pt-BR to Intl). */
export const numLang = (hass, config) => {
  const l = lang(hass, config);
  const ha = hass && (hass.locale?.language || hass.language);
  const loc = ha && ha.split("-")[0] === l ? ha : l;
  return loc === "pt" ? "pt-PT" : loc;
};

/** Rate with the language's units and decimal separator ("1,5 Mo/s" in French): base 1000, one decimal below 100. */
export const fmtRate = (bps, hass, config) => {
  if (bps === null || bps === undefined) return "—";
  const bits = config.rate_unit === "bits";
  const units = RATE_UNITS[lang(hass, config)][bits ? "bits" : "bytes"];
  let v = bits ? bps * 8 : bps;
  let i = 0;
  while (v >= 1000 && i < units.length - 1) {
    v /= 1000;
    i++;
  }
  const d = v >= 100 || i === 0 ? 0 : 1;
  const n = new Intl.NumberFormat(numLang(hass, config), { minimumFractionDigits: d, maximumFractionDigits: d, useGrouping: false }).format(v);
  return `${n} ${units[i]}`;
};

/** A number in the card's language ("0,42"), with at most `d` decimals. */
export const fmtNum = (v, hass, config, d = 0) =>
  new Intl.NumberFormat(numLang(hass, config), { maximumFractionDigits: d, useGrouping: false }).format(v);

export const fmtUptime = (sec, hass, config) => {
  if (sec === null) return "—";
  const d = Math.floor(sec / 86400);
  const h = Math.floor((sec % 86400) / 3600);
  const m = Math.floor((sec % 3600) / 60);
  if (d > 0) return `${d} ${t(hass, config, "days")} ${h} ${t(hass, config, "hours")}`;
  if (h > 0) return `${h} ${t(hass, config, "hours")} ${m} ${t(hass, config, "minutes")}`;
  return `${m} ${t(hass, config, "minutes")}`;
};

/** Seconds since the device started, from an uptime sensor: a boot date (device_class timestamp / uptime), or a
 *  duration (seconds, or the sensor's own time unit); null while it has no value. */
export const bootSec = (s) => {
  if (noValue(s)) return null;
  const unit = String(s.attributes?.unit_of_measurement || "").toLowerCase();
  const v = Number(s.state);
  if (unit && Number.isFinite(v)) return Math.max(0, v * ({ ms: 1e-3, s: 1, min: 60, h: 3600, d: 86400 }[unit] ?? 1));
  const ms = Date.parse(s.state);
  return Number.isFinite(ms) ? Math.max(0, (Date.now() - ms) / 1000) : null;
};

/**
 * Temperature sensor value: `raw` in the sensor's own unit (Home Assistant converts temperature sensors to the
 * user's unit system), `c` the same value in °C for the thresholds and the gauge, `unit` the unit to display.
 */
export const temperature = (s) => {
  const raw = num(s);
  const unit = s?.attributes?.unit_of_measurement || "°C";
  if (raw === null) return { raw, c: null, unit };
  const u = unit.replace(/^°/, "").toUpperCase();
  const c = u === "F" ? ((raw - 32) * 5) / 9 : u === "K" ? raw - 273.15 : raw;
  return { raw, c, unit };
};

/** Online state of a connectivity entity: true, false, or null when it has no value or says neither. A binary
 *  sensor is on / off; a status sensor names its state (UniFi "connected", Omada "disconnected", GL.iNet "online"). */
export const ONLINE = /^(on|online|connected|up|ok|true|active|adopted|running|internet|home)$/i;
export const OFFLINE = /^(off|offline|disconnected|down|error|failed|failure|isolated|lost|false|inactive|no_internet|not_home|disabled)$/i;
export const onlineOf = (s) => {
  if (noValue(s)) return null;
  const v = String(s.state).trim();
  return ONLINE.test(v) ? true : OFFLINE.test(v) ? false : null;
};

// The unit of a count of clients: none, or the counted thing (OpenWrt ubus "clients", others "devices"…).
export const COUNT_UNIT = /^(clients?|devices?|hosts?|stations?|users?)?$/i;
export const isCountUnit = (s) => COUNT_UNIT.test(String(s?.attributes?.unit_of_measurement || "").trim());

export const level = (v, warn, crit) => (v === null ? "" : v >= crit ? "crit" : v >= warn ? "warn" : "ok");

// Default warning / critical thresholds: CPU, RAM and disk in % used, temperatures in °C. Each can be set in the card
// options, named as on the other cards (system monitor, NAS, internet box).
export const THRESHOLDS = { cpu_warning: 80, cpu_critical: 95, ram_warning: 80, ram_critical: 90, disk_warning: 80, disk_critical: 90, temp_warning: 75, temp_critical: 90 };

/** A threshold option as a number, or its default when unset or not a number. */
export const threshold = (config, key) => {
  const v = config?.[key];
  const n = v === "" || v === null || v === undefined ? Number.NaN : Number(v);
  return Number.isFinite(n) ? n : THRESHOLDS[key];
};

// Same values, compared by identity: used to skip a render when nothing the card shows has changed.
export const sameSig = (a, b) => !!a && !!b && a.length === b.length && a.every((v, i) => v === b[i]);

// Patch the shadow DOM in place from the new HTML: nodes whose tag is unchanged are kept, so keyboard
// focus, hover, embedded pictures and CSS transitions survive an update, and only the changed text and
// attributes are written. Rows of a list carry a data-key (their entity or row id) and are matched by it,
// wherever they moved, so a focused row keeps its own data when the list is reordered (a node matched by
// position would be rewritten with the row taking its place, and Enter would act on that row). Nodes
// without a data-key are matched by position.
export const patchAttrs = (cur, next) => {
  for (const { name } of [...cur.attributes]) if (!next.hasAttribute(name)) cur.removeAttribute(name);
  for (const { name, value } of next.attributes) if (cur.getAttribute(name) !== value) cur.setAttribute(name, value);
};
export const keyOf = (n) => (n.nodeType === 1 ? n.getAttribute("data-key") : null);
export const sameNode = (a, b) => !!a && a.nodeType === b.nodeType && a.nodeName === b.nodeName;
// Moves a kept node. moveBefore (where supported) keeps its focus; insertBefore drops it, which is safe:
// Enter then does nothing rather than act on another row.
export const place = (parent, node, ref) => {
  if (node === ref) return;
  try {
    if (parent.moveBefore && node.parentNode === parent) return parent.moveBefore(node, ref);
  } catch (_e) {
    /* fall back to insertBefore */
  }
  parent.insertBefore(node, ref);
};
export const patchChildren = (cur, next) => {
  const old = [...cur.childNodes];
  const fresh = [...next.childNodes];
  const byKey = new Map();
  for (const o of old) {
    const k = keyOf(o);
    if (k !== null && !byKey.has(k)) byKey.set(k, o);
  }
  const used = new Set();
  fresh.forEach((n, i) => {
    const k = keyOf(n);
    let o = k !== null ? byKey.get(k) : old[i];
    if (!sameNode(o, n) || used.has(o) || (k === null && keyOf(o) !== null)) o = null;
    const ref = cur.childNodes[i] ?? null;
    if (!o) {
      cur.insertBefore(n, ref);
      return;
    }
    used.add(o);
    place(cur, o, ref);
    if (n.nodeType === 1) {
      patchAttrs(o, n);
      patchChildren(o, n);
    } else if (o.nodeValue !== n.nodeValue) o.nodeValue = n.nodeValue;
  });
  while (cur.childNodes.length > fresh.length) cur.removeChild(cur.lastChild);
};
export const morph = (root, html) => {
  const tpl = document.createElement("template");
  tpl.innerHTML = html;
  patchChildren(root, tpl.content);
};

// After the confirmation popup closes, clicks on the card are ignored for this long: the second click of a double
// click on its button would otherwise land on what lies under it.
export const CONFIRM_GUARD_MS = 400;

// A click inside a dialog (more-info opened from the card, say) is not a click outside the card.
export const inDialog = (path) => path.some((n) => ["ha-more-info-dialog", "ha-dialog", "dialog"].includes(n.localName));

// "A click elsewhere" is caught on the pointer, not only on the click event: on iOS (Safari and the companion app)
// a tap on something that is not clickable (the background, an empty spot, a card with no action) sends no click to
// the page. The handler runs when the press and the release are both outside the card (a slider dragged out of the
// card does not count), and a scroll does not count (the browser cancels the pointer); keyboard clicks still go
// through the click event. The handler keeps its own checks (outside of the card, not in a dialog).
export const watchOutside = (card, handler) => {
  let downOutside = false;
  const onDown = (ev) => {
    downOutside = !ev.composedPath().includes(card);
  };
  const onUp = (ev) => {
    if (downOutside) handler(ev);
    downOutside = false;
  };
  const onClick = (ev) => {
    if (ev.detail === 0) handler(ev);
  };
  return {
    on() {
      document.addEventListener("pointerdown", onDown, true);
      document.addEventListener("pointerup", onUp, true);
      document.addEventListener("click", onClick, true);
    },
    off() {
      document.removeEventListener("pointerdown", onDown, true);
      document.removeEventListener("pointerup", onUp, true);
      document.removeEventListener("click", onClick, true);
    },
    // A tap (press and release at the same spot), for the tests.
    tap(ev) {
      onDown(ev);
      onUp(ev);
    },
  };
};

export const fireMoreInfo = (node, entityId) => {
  if (!entityId) return;
  node.dispatchEvent(new CustomEvent("hass-more-info", { detail: { entityId }, bubbles: true, composed: true }));
};
