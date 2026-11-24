// ---------------------------------------------------------------------------
// Entity discovery
// ---------------------------------------------------------------------------
import { DRAWINGS, PROFILES, profileOf } from "./pictures.js";
import { RATE_FACTORS, isCountUnit, noValue, onlineOf } from "./helpers.js";

export const deviceName = (dev) => dev && (dev.name_by_user || dev.name);
export const isEntityId = (v) => typeof v === "string" && /^[a-z_]+\.[a-z0-9_]+$/.test(v);

/** Friendly name of an entity without its device name ("Deco Salon Deco CPU usage" -> "CPU usage"). */
export const shortName = (hass, id, dev) => {
  const name = hass.states[id]?.attributes?.friendly_name || id.split(".")[1];
  for (const prefix of [dev?.name_by_user, dev?.name]) {
    if (prefix && name.startsWith(`${prefix} `)) return name.slice(prefix.length + 1);
  }
  return name;
};

// A slot can be read from an attribute of an entity (Firewalla's system status): its reference is
// "<entity id>|<attribute>|<unit>", read back as a state of its own.
export const refId = (ref) => (ref ? String(ref).split("|")[0] : ref);
export const _attrStates = new WeakMap();
export const attrState = (base, attr, unit) => {
  let byKey = _attrStates.get(base);
  if (!byKey) _attrStates.set(base, (byKey = new Map()));
  const key = `${attr}|${unit}`;
  if (!byKey.has(key)) {
    const v = base.attributes?.[attr];
    const state = base.state === "unavailable" ? "unavailable" : v === null || v === undefined ? "unknown" : typeof v === "object" ? JSON.stringify(v) : String(v);
    byKey.set(key, { entity_id: base.entity_id, state, attributes: unit ? { unit_of_measurement: unit } : {}, last_changed: base.last_changed });
  }
  return byKey.get(key);
};
export const stateOf = (hass, ref) => {
  if (!ref) return undefined;
  const [id, attr, unit] = String(ref).split("|");
  const base = hass.states[id];
  if (!base || attr === undefined) return base;
  return attrState(base, attr, unit);
};

// The words of an entity: its translation key and the object id of its entity id, lower case, split on anything
// that is not a letter or a digit and padded with spaces, so that " rx " or " cpu " match whole words only. Most
// integrations without translation keys name their entities in English, which gives English entity ids whatever the
// user's language; those with translation keys give them in any language, the key staying English.
export const _words = new WeakMap();
export const words = (e) => {
  let w = _words.get(e);
  if (w === undefined) {
    w = ` ${`${e.translation_key || ""} ${e.entity_id.slice(e.entity_id.indexOf(".") + 1)}`.toLowerCase().replace(/[^a-z0-9]+/g, " ").trim()} `;
    _words.set(e, w);
  }
  return w;
};
export const has = (w, ...list) => list.some((x) => w.includes(` ${x} `));

export const DOWN = ["rx", "down", "download", "downloads", "in", "inbytes", "received", "receive", "recv", "downstream", "ingress", "dl", "downlink"];
export const UP = ["tx", "up", "upload", "uploads", "out", "outbytes", "sent", "send", "upstream", "egress", "ul", "uplink"];
/** "down" / "up" for a sensor named after a direction of traffic, else null. */
export const direction = (w) => (has(w, ...DOWN) || /download|receiv/.test(w) ? "down" : has(w, ...UP) || /upload/.test(w) ? "up" : null);

export const isRateUnit = (u) => !!u && Object.hasOwn(RATE_FACTORS, String(u).toLowerCase());
// A speed test result or a line / link speed is not traffic.
export const SPEEDTEST = /speed ?test|speedtest/;
export const NOT_TRAFFIC = ["backhaul", "link", "max", "mesh", "client", "clients", "wired", "phy", "negotiated", "capacity", "limit", "qos"];
export const NOT_WAN = ["lan", "guest", "vpn", "wg", "wireguard", "ovpn", "openvpn", "tailscale", "lo", "loopback", "iot", "dmz"];
export const IPV4 = /^\d{1,3}(\.\d{1,3}){3}$/;
// Entities a profile keeps out of the discovery, by translation key, or "<domain>.<translation key>".
export const excluded = (profile, e) =>
  !!e.translation_key && !!profile.exclude?.some((x) => x === e.translation_key || x === `${e.entity_id.slice(0, e.entity_id.indexOf("."))}.${e.translation_key}`);

/**
 * What an entity of the router (or of one of its child devices, `own` false) tells: { slot, score }, or null. The
 * integration's own translation keys win (score 20), then its attributes (handled by the caller), then the kind of
 * entity and its words. A slot keeps its best-scored entity.
 */
export const classify = (hass, profile, e, own) => {
  const id = e.entity_id;
  const domain = id.slice(0, id.indexOf("."));
  const s = hass.states[id];
  const a = s?.attributes || {};
  const k = e.translation_key;
  if (excluded(profile, e)) return null;
  for (const [slot, keys] of Object.entries(profile.keys || {})) {
    if (k && (Array.isArray(keys) ? keys.includes(k) : keys === k)) return own || slot.startsWith("rate_") ? { slot, score: 20 } : null;
  }
  const w = words(e);
  const unit = String(a.unit_of_measurement || "");
  const dc = a.device_class;
  const bonus = (own ? 1 : -1) + (has(w, "wan", "mwan", "internet", "isp") ? 4 : 0) - (has(w, ...NOT_WAN) ? 3 : 0);
  if (domain === "sensor") {
    if (dc === "data_rate" || isRateUnit(unit)) {
      const dir = direction(w);
      if (SPEEDTEST.test(w)) return own && dir ? { slot: dir === "down" ? "st_down" : "st_up", score: 5 } : null;
      // NETGEAR's downlink / uplink bandwidth is its speed test (keys above); the bare words elsewhere are links.
      if (has(w, ...NOT_TRAFFIC) || (has(w, "bandwidth") && has(w, "downlink", "uplink"))) return null;
      if (!dir) return null;
      return { slot: dir === "down" ? "rate_down" : "rate_up", score: 5 + bonus + (has(w, "total") ? 2 : 0) };
    }
    if (!own) return null;
    if (dc === "temperature") return has(w, "smart", "ups", "battery", "disk", "hdd", "nvme", "ssd", "outdoor") ? null : { slot: "temp", score: 1 };
    if (/^(rpm|tr\/min)$/i.test(unit)) return { slot: "fan", score: 1 };
    if (unit === "%") {
      const raw = has(w, "raw") ? -2 : 0;
      if (has(w, "cpu", "processor") && !has(w, "temperature", "temp", "frequency", "freq", "count")) return { slot: "cpu", score: 5 + raw - (has(w, "core") ? 3 : 0) + (has(w, "usage", "load", "utilization", "used", "total") ? 1 : 0) };
      if (has(w, "memory", "mem", "ram") && !has(w, "swap", "buffers", "buffer", "mbuf", "flash", "free")) return { slot: "ram", score: 5 + raw + (has(w, "usage", "used", "utilization") ? 1 : 0) };
      if (has(w, "disk", "hdd", "flash", "filesystem", "storage", "usb")) return { slot: "disk", score: 3 + (has(w, "root") ? 1 : 0) };
      if (has(w, "loss")) return { slot: "loss", score: 3 + bonus };
      return null;
    }
    if (dc === "timestamp" || dc === "uptime") {
      if (has(w, "uptime", "boot", "boottime", "started", "restart", "restarted") && !has(w, "wan", "vpn", "client", "update", "successful", "speedtest", "check", "checked", "scheduled", "next")) return { slot: "boot", score: 4 + (has(w, "system") ? 1 : 0) };
      return null;
    }
    if (dc === "duration" || /^(ms|s|min|h|d)$/.test(unit)) {
      if (has(w, "latency", "ping", "delay", "rtt")) return SPEEDTEST.test(w) ? { slot: "st_ping", score: 5 } : { slot: "latency", score: 3 + bonus };
      if (has(w, "uptime") && !has(w, "wan", "vpn", "client", "ipv4", "ipv6")) return { slot: "boot", score: 3 };
      return null;
    }
    if (has(w, "load") && /( 1 | 1m | 1min | one | avg1 | load1 | minute )/.test(w) && !/( 5| 15|five|fifteen)/.test(w)) return { slot: "load", score: 3 };
    if (has(w, "ip", "ipv4", "address", "addr") && has(w, "wan", "public", "external", "internet")) {
      if (has(w, "ipv6")) return { slot: "ip6", score: 3 };
      return IPV4.test(String(s?.state || "")) || noValue(s) ? { slot: "ip", score: 3 + (has(w, "public", "external") ? 1 : 0) } : null;
    }
    if (has(w, "status", "state") && has(w, "wan", "mwan", "internet", "gateway")) return { slot: "wan", score: 3 + bonus };
    if ((has(w, "clients", "devices", "hosts") || has(w, "client", "count")) && isCountUnit(s)) {
      // A count of mesh units (Cudy "Mesh devices connected") is not one of clients.
      if (has(w, "offline", "blocked", "reservations", "reserved", "dhcp", "captive", "vpn", "openvpn", "pptpvpn", "iot", "mesh")) return null;
      if (has(w, "guest")) return { slot: "guest", score: 2 };
      if (has(w, "wired")) return { slot: "wired", score: 2 };
      if (has(w, "wireless", "wifi", "wlan")) return { slot: "wireless", score: 2 };
      return { slot: "clients", score: 3 + (has(w, "connected", "online", "total") ? 1 : 0) };
    }
    return null;
  }
  if (domain === "binary_sensor") {
    if (own && (dc === "update" || has(w, "update", "available"))) return has(w, "update") ? { slot: "update", score: 1 } : null;
    if (dc !== "connectivity") return null;
    // The WAN link, on the router or on its WAN interface's device (MikroTik).
    if (has(w, "wan", "mwan", "internet", "gateway", "isp"))
      return has(w, ...NOT_WAN) ? null : { slot: "wan", score: 6 + (own ? 0 : -1) + (has(w, "secondary", "backup", "failover") ? -2 : 0) };
    return null;
  }
  if (!own) return null;
  if (domain === "button") {
    if (has(w, "firewall", "httpd", "wired", "wireless", "service", "mesh", "polling", "refresh", "sync", "wan", "reconnect", "cycle", "port", "scan", "speedtest", "check")) return null;
    if (has(w, "reboot", "restart") || dc === "restart") return { slot: "reboot", score: 3 + (k === "reboot" ? 1 : 0) };
    return null;
  }
  if (domain === "switch") {
    // The settings of a Wi-Fi network (Cudy "hidden network", "separate clients") are not the network itself.
    if (has(w, "polling", "led", "parental", "block", "vpn", "qos", "port", "poe", "access", "smart", "traffic", "homekit", "wps", "rule", "forwarding", "schedule", "service", "upnp", "hidden", "separate", "isolate", "isolation")) return null;
    if (has(w, "wifi", "wi", "wlan", "ssid", "wireless", "radio", "guest") || /wifi/.test(w)) return { slot: "wifi", score: 1 };
    return null;
  }
  if (domain === "update") return { slot: "update", score: 2 + (has(w, "firmware") ? 1 : 0) };
  return null;
};

// Registry entries that have a state, by device and by integration. Cached on the identity of hass.entities (replaced
// when the registry changes) and the number of states, not on hass.states, which is replaced on every state change.
// The states are counted once per hass.states object (shared by every card on the page), without building a key array.
export let _index;
export const countStates = (states) => {
  let n = 0;
  for (const _ in states) n++;
  return n;
};
export const index = (hass) => {
  const states = hass.states || {};
  if (_index && _index.entities === hass.entities && _index.states === states) return _index;
  const nStates = countStates(states);
  if (_index && _index.entities === hass.entities && _index.nStates === nStates) {
    _index.states = states;
    return _index;
  }
  const byDevice = new Map();
  const byPlatform = new Map();
  for (const e of Object.values(hass.entities || {})) {
    if (e.hidden || !hass.states[e.entity_id]) continue;
    if (e.device_id) {
      if (!byDevice.has(e.device_id)) byDevice.set(e.device_id, []);
      byDevice.get(e.device_id).push(e);
    }
    if (!byPlatform.has(e.platform)) byPlatform.set(e.platform, []);
    byPlatform.get(e.platform).push(e);
  }
  for (const list of [...byDevice.values(), ...byPlatform.values()]) list.sort((a, b) => a.entity_id.localeCompare(b.entity_id));
  _index = { entities: hass.entities, states, nStates, byDevice, byPlatform };
  return _index;
};

/** The integration of a device: the supported platform of most of its entities, else the platform of most of them. */
export const platformOf = (entries) => {
  const count = new Map();
  for (const e of entries) count.set(e.platform, (count.get(e.platform) || 0) + (PROFILES[e.platform] ? 1000 : 1) - (e.entity_id.startsWith("device_tracker.") ? 0.5 : 0));
  return [...count.entries()].sort((a, b) => b[1] - a[1])[0]?.[0];
};

export const sharesEntry = (a, b) => !a?.config_entries?.length || !b?.config_entries?.length || a.config_entries.some((c) => b.config_entries.includes(c));

// Slots that make a device a router, a firewall or a mesh unit, with their weight in the default choice.
export const MAIN_SLOTS = { rate_down: 3, wan: 3, cpu: 1, ram: 1, boot: 1, reboot: 1, clients: 1, ip: 1 };

/** Slots found on a device's own entities, with their best entity, and its score as the main device. */
export const scanDevice = (hass, profile, entries) => {
  const best = {};
  for (const e of entries) {
    if (e.platform !== profile.platform) continue;
    const c = classify(hass, profile, e, true);
    if (c && (!best[c.slot] || c.score > best[c.slot].score)) best[c.slot] = { id: e.entity_id, score: c.score };
    for (const [slot, [attr]] of Object.entries(profile.attrs?.[e.translation_key] || {}))
      if (!best[slot] || best[slot].score < 10) best[slot] = { id: e.entity_id, score: 10, attr };
  }
  return best;
};

/** Devices of the supported integrations that look like a router (rates, WAN, system sensors…), best first, as
 *  { value, label } for the editor; plus, for an integration with trackers only and no device (LuCI, Ruckus),
 *  the integration itself ("platform:<integration>"). */
export let _list;
export const listDevices = (hass) => {
  const idx = index(hass);
  if (_list && _list.idx === idx && _list.devices === hass.devices) return _list.out;
  const found = [];
  for (const [deviceId, entries] of idx.byDevice) {
    const platform = platformOf(entries);
    if (!PROFILES[platform]) continue;
    const dev = hass.devices?.[deviceId];
    // The child devices of an integration whose children are parts of the router (MikroTik interfaces) are not routers.
    if (dev?.via_device_id && PROFILES[platform].nodes === false) continue;
    const slots = scanDevice(hass, profileOf(platform), entries);
    let score = 0;
    for (const [slot, w] of Object.entries(MAIN_SLOTS)) if (slots[slot]) score += w;
    if (!score) continue;
    if (!dev?.via_device_id) score += 2;
    found.push({ value: deviceId, label: deviceName(dev) || deviceId, score });
  }
  found.sort((a, b) => b.score - a.score || a.label.localeCompare(b.label));
  const out = found.map(({ value, label }) => ({ value, label }));
  for (const [platform, entries] of idx.byPlatform) {
    if (!PROFILES[platform] || found.some((f) => idx.byDevice.get(f.value)?.some((e) => e.platform === platform))) continue;
    if (entries.some((e) => e.entity_id.startsWith("device_tracker."))) out.push({ value: `platform:${platform}`, label: PROFILES[platform].name });
  }
  _list = { idx, devices: hass.devices, out };
  return out;
};

export const emptyBox = () => ({ id: null, device: null, profile: null, kind: null, scalars: {}, temps: [], fans: [], wifi: [], nodes: [], trackers: [] });

/** Kind of the device (firewall, router, mesh, ap): the `kind` option, else from its model for an integration
 *  with several kinds of devices (UniFi, Omada), else the integration's. */
export const kindOf = (profile, dev, config) => {
  if (DRAWINGS[config?.kind]) return config.kind;
  const ids = [dev?.model, dev?.model_id, dev?.name].filter(Boolean).join(" ");
  return profile.kinds?.find((x) => x.re.test(ids))?.kind || profile.kind;
};

/** A network device of the router (mesh unit, access point, switch): { id, name, model, online, clients, entity }, or
 *  null when its entities tell neither its state nor its clients. */
export const nodeOf = (hass, profile, dev, entries) => {
  let online = null;
  let clients = null;
  let first = null;
  for (const e of entries) {
    if (e.platform !== profile.platform) continue;
    const id = e.entity_id;
    const k = e.translation_key;
    // A device with a tracker is a client of the network, not one of its units.
    if (id.startsWith("device_tracker.")) return null;
    if (excluded(profile, e)) continue;
    const s = hass.states[id];
    const w = words(e);
    first ??= id;
    const attrs = profile.nodeAttrs?.[k];
    if (attrs?.clients) clients ??= `${id}|${attrs.clients}|`;
    const keys = profile.keys?.node_state;
    if ((k && (profile.nodeOnline?.includes(k) || keys === k)) || (id.startsWith("binary_sensor.") && s.attributes?.device_class === "connectivity" && !has(w, "wan", "internet"))) {
      online ??= id;
    } else if (id.startsWith("sensor.") && ((k && k === profile.keys?.clients) || has(w, "clients", "devices") || has(w, "client", "count")) && !has(w, "offline", "guest", "blocked", "wired", "wireless")) {
      // A count: no unit or a count unit (OpenWrt ubus "clients"), and a number when it has a value (not a BSSID).
      if (isCountUnit(s) && (noValue(s) || Number.isFinite(Number(s.state)))) clients ??= id;
    } else if (id.startsWith("sensor.") && has(w, "state", "status") && onlineOf(s) !== null) online ??= id;
  }
  if (!online && !clients) return null;
  return { id: dev.id, name: deviceName(dev), model: dev.model || "", online, clients, entity: online || clients || first };
};

export const _boxes = new WeakMap();

/**
 * Map the entities of one router (and its child devices) to a structured object of entity references. Cached on the
 * index (hass.entities, hass.states) and hass.devices.
 */
export const discover = (hass, deviceId, config) => {
  const idx = index(hass);
  let cache = _boxes.get(idx);
  if (!cache || cache.devices !== hass.devices) _boxes.set(idx, (cache = { devices: hass.devices, map: new Map() }));
  const key = `${deviceId || ""}|${config?.kind || ""}`;
  if (cache.map.has(key)) return cache.map.get(key);
  const box = emptyBox();
  cache.map.set(key, box);
  const listed = listDevices(hass);
  const target = deviceId || listed[0]?.value;
  if (!target) return box;
  if (target.startsWith("platform:")) {
    // An integration with trackers only: the integration is the router, its connected devices are counted.
    const platform = target.slice("platform:".length);
    const entries = idx.byPlatform.get(platform);
    if (!entries) return box;
    box.id = target;
    box.profile = profileOf(platform);
    box.kind = kindOf(box.profile, null, config);
    box.trackers = entries.filter((e) => e.entity_id.startsWith("device_tracker.")).map((e) => e.entity_id);
    return box;
  }
  const entries = idx.byDevice.get(target);
  const dev = hass.devices?.[target];
  if (!entries || !dev) return box;
  const profile = profileOf(platformOf(entries));
  box.id = target;
  box.device = dev;
  box.profile = profile;
  box.kind = kindOf(profile, dev, config);
  const best = scanDevice(hass, profile, entries);
  // Rates of the child devices (MikroTik interfaces, Deco units): taken when the router itself has none, the WAN
  // interface first.
  const children = Object.values(hass.devices || {}).filter((d) => d.via_device_id === target && sharesEntry(d, dev));
  for (const child of children) {
    for (const e of idx.byDevice.get(child.id) || []) {
      if (e.platform !== profile.platform) continue;
      const c = classify(hass, profile, e, false);
      if (c && /^(rate_|wan$)/.test(c.slot) && (!best[c.slot] || c.score > best[c.slot].score)) best[c.slot] = { id: e.entity_id, score: c.score };
    }
  }
  // Download and upload of the same interface: the upload sensor named like the download one wins.
  if (best.rate_down && best.rate_up) {
    const stem = (id) => ` ${id.split(".")[1].replace(/_/g, " ")} `.replace(new RegExp(` (${[...DOWN, ...UP].join("|")}) `, "g"), " ");
    const pair = entries
      .concat(...children.map((c) => idx.byDevice.get(c.id) || []))
      .find((e) => e.entity_id !== best.rate_down.id && classify(hass, profile, e, e.device_id === target)?.slot === "rate_up" && stem(e.entity_id) === stem(best.rate_down.id));
    if (pair) best.rate_up = { id: pair.entity_id };
  }
  for (const [slot, b] of Object.entries(best)) {
    if (["temp", "fan", "wifi"].includes(slot)) continue;
    const attr = profile.attrs?.[hass.entities[b.id]?.translation_key]?.[slot];
    box.scalars[slot] = b.attr && attr ? `${b.id}|${attr[0]}|${attr[1] || ""}` : b.id;
  }
  for (const e of entries) {
    if (e.platform !== profile.platform) continue;
    const c = classify(hass, profile, e, true);
    if (c?.slot === "temp" && box.temps.length < 6) box.temps.push({ id: e.entity_id, name: shortName(hass, e.entity_id, dev) });
    else if (c?.slot === "fan") box.fans.push({ id: e.entity_id, name: shortName(hass, e.entity_id, dev) });
    else if (c?.slot === "wifi") box.wifi.push({ id: e.entity_id, name: shortName(hass, e.entity_id, dev) });
  }
  // Network devices: the router's child devices and the other devices of its integration entry (UniFi access points
  // and switches, Deco and eero units), with the router first for a mesh system.
  if (profile.nodes !== false) {
    const others = Object.values(hass.devices || {}).filter(
      (d) => d.id !== target && (d.via_device_id === target || (d.config_entries?.length && sharesEntry(d, dev))) && idx.byDevice.has(d.id)
    );
    const nodes = others
      .map((d) => nodeOf(hass, profile, d, idx.byDevice.get(d.id)))
      .filter(Boolean)
      .sort((a, b) => (a.name || "").localeCompare(b.name || "", undefined, { numeric: true }));
    if (nodes.length) {
      const self = box.kind === "mesh" ? nodeOf(hass, profile, dev, entries) : null;
      box.nodes = self ? [{ ...self, main: true }, ...nodes] : nodes;
    }
  }
  // Clients: the integration's trackers on this router's entry; a tracker without device belongs to the integration's
  // main router (the first one listed).
  const first = listed.find((l) => !l.value.startsWith("platform:") && idx.byDevice.get(l.value)?.some((e) => e.platform === profile.platform));
  const single = first?.value === target;
  for (const e of idx.byPlatform.get(profile.platform) || []) {
    if (!e.entity_id.startsWith("device_tracker.") || e.device_id === target) continue;
    const d = e.device_id ? hass.devices?.[e.device_id] : null;
    if (d ? d.config_entries?.length && sharesEntry(d, dev) : single) box.trackers.push(e.entity_id);
  }
  return box;
};

// The last speed test: the router's own speed test sensors, else the Speedtest.net integration's (else Fast.com's,
// download only). The `entities` option's `speedtest` sets the sensors of another speed test (LibreSpeed…).
export const SPEEDTEST_KEYS = ["download", "upload", "ping"];
export const SPEEDTEST_PLATFORMS = ["speedtestdotnet", "fastdotcom"];
// The Speedtest.net (else Fast.com) sensors, looked up once per index (registry and set of states), not on every
// state change: the render signature reads them.
export const _speedtests = new WeakMap();
export const speedtestFound = (hass) => {
  const idx = index(hass);
  if (_speedtests.has(idx)) return _speedtests.get(idx);
  const byPlatform = {};
  for (const platform of SPEEDTEST_PLATFORMS) {
    for (const e of idx.byPlatform.get(platform) || []) {
      if (!e.entity_id.startsWith("sensor.") || !SPEEDTEST_KEYS.includes(e.translation_key)) continue;
      (byPlatform[platform] ??= {})[e.translation_key] = e.entity_id;
    }
  }
  const out = byPlatform.speedtestdotnet || byPlatform.fastdotcom || {};
  _speedtests.set(idx, out);
  return out;
};
export const speedtestOf = (hass, box, config) => {
  const sc = box?.scalars || {};
  let found = sc.st_down || sc.st_up ? { download: sc.st_down, upload: sc.st_up, ping: sc.st_ping } : null;
  if (!found) found = { ...speedtestFound(hass) };
  const own = config?.entities?.speedtest;
  if (own && typeof own === "object") {
    const chosen = SPEEDTEST_KEYS.filter((k) => isEntityId(own[k]));
    // Sensors of another speed test: theirs only, not mixed with those found.
    if (chosen.length) for (const k of SPEEDTEST_KEYS) found[k] = isEntityId(own[k]) ? own[k] : undefined;
  }
  for (const k of SPEEDTEST_KEYS) if (!found[k]) delete found[k];
  return found.download || found.upload ? found : null;
};

// The `entities` option: sensors of the user's choice, replacing those found on the router.
export const OWN_KEYS = ["rate_down", "rate_up", "wan", "ip", "boot", "cpu", "ram", "clients"];
export const _withOwn = new WeakMap();
export const withEntities = (box, entities) => {
  if (!box || !entities || typeof entities !== "object") return box;
  const own = OWN_KEYS.filter((k) => isEntityId(entities[k]));
  if (!own.length) return box;
  const key = own.map((k) => `${k}=${entities[k]}`).join(",");
  const hit = _withOwn.get(box);
  if (hit?.key === key) return hit.result;
  const result = { ...box, scalars: { ...box.scalars, ...Object.fromEntries(own.map((k) => [k, entities[k]])) } };
  _withOwn.set(box, { key, result });
  return result;
};
// The editor's pickers of `entities`, and the option without the ones left empty (none: no option).
export const EDITOR_ENTITIES = new Set([...OWN_KEYS, ...SPEEDTEST_KEYS]);
export const cleanEntities = (entities) => {
  if (!entities || typeof entities !== "object") return undefined;
  const out = {};
  for (const [k, v] of Object.entries(entities)) {
    const value = v && typeof v === "object" ? cleanEntities(v) : v;
    if (value !== "" && value !== undefined && value !== null) out[k] = value;
  }
  return Object.keys(out).length ? out : undefined;
};
// The router a card shows: the one found, with the sensors of the `entities` option.
export const boxFor = (hass, config) => withEntities(discover(hass, config?.device, config), config?.entities);
