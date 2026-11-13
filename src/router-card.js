/*
 * Router Card for Home Assistant
 * https://github.com/juju35/ha-router-card
 *
 * Lovelace cards for firewalls, routers and mesh Wi-Fi systems: Firewalla, OPNsense, pfSense, UniFi Network, TP-Link
 * Deco, Omada and routers, MikroTik, ASUS, Netgear, Keenetic, OpenWrt, GL.iNet, Xiaomi Mi Wi-Fi, eero, Linksys Velop,
 * Ruckus Unleashed. Entities are discovered from the entity and device registries: each integration's known
 * translation keys and attributes first, then the kind of each entity (device class, unit) and the words of its
 * translation key and entity id, so that an integration the card does not know is shown too.
 */

const VERSION = "__VERSION__";

// ---------------------------------------------------------------------------
// Pictures: neutral drawings of a kind of device (not of a given product), in the brand's accent colour
// ---------------------------------------------------------------------------

const svgDoc = (w, h, defs, body) => `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${w} ${h}"><defs>${defs}</defs>${body}</svg>`;
const grad = (id, stops, x2 = 0, y2 = 1) =>
  `<linearGradient id="${id}" x1="0" y1="0" x2="${x2}" y2="${y2}">${stops.map(([o, c]) => `<stop offset="${o}" stop-color="${c}"/>`).join("")}</linearGradient>`;

// Firewall appliance: a low, wide dark box seen from the front and slightly above, a row of network ports, a column
// of status lights in the accent colour and a vented right side.
const firewallSvg = ({ accent } = {}) => {
  const w = 236;
  const x = (300 - w) / 2;
  const yTop = 82;
  const topH = 16;
  const frontH = 46;
  const fy = yTop + topH;
  const bottom = fy + frontH;
  const led = accent || "#3ad64f";
  const defs = grad("fwt", [[0, "#5b6068"], [1, "#3c4046"]], 1, 0) + grad("fwf", [[0, "#43474e"], [1, "#2a2d32"]]);
  let s = `<ellipse cx="150" cy="${bottom + 8}" rx="${Math.round(w * 0.5)}" ry="7" opacity=".3"/>`;
  s += `<path d="M${x + 10} ${yTop} H${x + w - 10} L${x + w} ${fy} H${x} Z" fill="url(#fwt)"/>`;
  s += `<rect x="${x}" y="${fy}" width="${w}" height="${frontH}" rx="4" fill="url(#fwf)"/>`;
  s += `<rect x="${x + 6}" y="${fy + 3}" width="${w - 12}" height="2" rx="1" fill="#fff" opacity=".06"/>`;
  // Status lights.
  for (let i = 0; i < 3; i++) s += `<circle cx="${x + 14}" cy="${fy + 12 + i * 11}" r="2.2" fill="${i === 2 ? "#54575c" : led}"/>`;
  // Network ports: dark sockets with a light tab, the first two with a link light.
  for (let i = 0; i < 6; i++) {
    const px = x + 30 + i * 22;
    s += `<rect x="${px}" y="${fy + 13}" width="17" height="15" rx="1.5" fill="#0b0b0c" stroke="#45484d" stroke-width=".8"/>`;
    s += `<rect x="${px + 5}" y="${fy + 24}" width="7" height="4" fill="#45484d"/>`;
    if (i < 2) s += `<rect x="${px + 1}" y="${fy + 31}" width="5" height="2" rx="1" fill="${led}"/>`;
  }
  // Vents.
  for (let i = 0; i < 8; i++) s += `<rect x="${x + w - 64 + i * 7}" y="${fy + 10}" width="2.4" height="${frontH - 20}" rx="1.2" fill="#000" fill-opacity=".45"/>`;
  return svgDoc(300, 168, defs, s);
};

// Desktop router with three antennas at the back and a row of status lights.
const routerSvg = ({ accent } = {}) => {
  const w = 176;
  const h = 34;
  const x = (300 - w) / 2;
  const top = 108;
  const bottom = top + h;
  const defs = grad("rtb", [[0, "#2b2c30"], [1, "#141518"]]) + grad("rta", [[0, "#3a3b40"], [1, "#1c1d20"]], 1, 0);
  let s = `<ellipse cx="150" cy="${bottom + 9}" rx="${Math.round(w * 0.52)}" ry="7" opacity=".28"/>`;
  for (const ax of [x + 22, 150, x + w - 22]) s += `<rect x="${ax - 4}" y="${top - 82}" width="8" height="86" rx="4" fill="url(#rta)"/>`;
  s += `<rect x="${x}" y="${top}" width="${w}" height="${h}" rx="10" fill="url(#rtb)"/>`;
  s += `<rect x="${x + 6}" y="${top + 3}" width="${w - 12}" height="3" rx="1.5" fill="#fff" opacity=".08"/>`;
  if (accent) s += `<rect x="${x + 12}" y="${bottom - 4}" width="${w - 24}" height="2" rx="1" fill="${accent}"/>`;
  for (let i = 0; i < 5; i++) s += `<circle cx="${x + 30 + i * 13}" cy="${top + 21}" r="2.4" fill="${accent || (i < 4 ? "#3ad64f" : "#4f8fe6")}"/>`;
  return svgDoc(300, 160, defs, s);
};

// Mesh Wi-Fi unit: a light rounded cylinder seen slightly from above, with a light ring at its foot.
const meshSvg = ({ accent } = {}) => {
  const w = 96;
  const x = (300 - w) / 2;
  const top = 30;
  const h = 120;
  const ry = 14;
  const ring = accent || "#3ad64f";
  const defs = grad("msb", [[0, "#d9dce1"], [0.45, "#f7f8fa"], [1, "#c3c7ce"]], 1, 0) + grad("mst", [[0, "#ffffff"], [1, "#eceef1"]]);
  let s = `<ellipse cx="150" cy="${top + h + ry + 6}" rx="${Math.round(w * 0.62)}" ry="8" opacity=".25"/>`;
  s += `<path d="M${x} ${top} V${top + h} A${w / 2} ${ry} 0 0 0 ${x + w} ${top + h} V${top} Z" fill="url(#msb)"/>`;
  s += `<ellipse cx="150" cy="${top}" rx="${w / 2}" ry="${ry}" fill="url(#mst)" stroke="#000" stroke-opacity=".08"/>`;
  // Vent ring on the top and the light at the foot.
  s += `<ellipse cx="150" cy="${top}" rx="${w / 2 - 14}" ry="${ry - 5}" fill="none" stroke="#000" stroke-opacity=".1" stroke-dasharray="2 3"/>`;
  s += `<path d="M${x + 18} ${top + h + 6} A${w / 2 - 6} ${ry - 4} 0 0 0 ${x + w - 18} ${top + h + 6}" fill="none" stroke="${ring}" stroke-width="3" stroke-linecap="round"/>`;
  s += `<rect x="${x + 7}" y="${top + 14}" width="5" height="${h - 30}" rx="2.5" fill="#fff" opacity=".55"/>`;
  return svgDoc(300, 180, defs, s);
};

// Ceiling access point: a light flat disc seen from below at an angle, with a status light ring in the middle.
const apSvg = ({ accent } = {}) => {
  const cx = 150;
  const cy = 86;
  const rx = 118;
  const ry = 40;
  const ring = accent || "#4f8fe6";
  const defs = grad("apb", [[0, "#f5f6f8"], [1, "#d3d6dc"]]) + grad("aps", [[0, "#c9ccd2"], [1, "#a9adb5"]]);
  let s = `<ellipse cx="${cx}" cy="${cy + ry + 22}" rx="${rx - 10}" ry="8" opacity=".22"/>`;
  s += `<ellipse cx="${cx}" cy="${cy + 10}" rx="${rx}" ry="${ry}" fill="url(#aps)"/>`;
  s += `<ellipse cx="${cx}" cy="${cy}" rx="${rx}" ry="${ry}" fill="url(#apb)" stroke="#000" stroke-opacity=".08"/>`;
  s += `<ellipse cx="${cx}" cy="${cy}" rx="22" ry="7.5" fill="none" stroke="${ring}" stroke-width="3"/>`;
  s += `<ellipse cx="${cx - 40}" cy="${cy - 18}" rx="34" ry="6" fill="#fff" opacity=".6"/>`;
  return svgDoc(300, 160, defs, s);
};

const DRAWINGS = { firewall: firewallSvg, router: routerSvg, mesh: meshSvg, ap: apSvg };
const svgUri = (svg) => `data:image/svg+xml,${encodeURIComponent(svg)}`;
// Pictures by kind of device, neutral (the README pictures), and in the brand's accent colour, each built once.
const IMG_DEVICE = Object.fromEntries(Object.entries(DRAWINGS).map(([k, f]) => [k, svgUri(f())]));
const _tinted = new Map();
const devicePic = (kind, accent) => {
  if (!DRAWINGS[kind]) return undefined;
  if (!accent) return IMG_DEVICE[kind];
  const key = `${kind}|${accent}`;
  if (!_tinted.has(key)) _tinted.set(key, svgUri(DRAWINGS[kind]({ accent })));
  return _tinted.get(key);
};

const ICONS = {
  down: "M9,4H15V12H19.84L12,19.84L4.16,12H9V4Z",
  up: "M15,20H9V12H4.16L12,4.16L19.84,12H15V20Z",
  temp: "M15 13V5A3 3 0 0 0 9 5V13A5 5 0 1 0 15 13M12 4A1 1 0 0 1 13 5V8H11V5A1 1 0 0 1 12 4Z",
  fan: "M12,11A1,1 0 0,0 11,12A1,1 0 0,0 12,13A1,1 0 0,0 13,12A1,1 0 0,0 12,11M12.5,2C17,2 17.11,5.57 14.75,6.75C13.76,7.24 13.32,8.29 13.13,9.22C13.61,9.42 14.03,9.73 14.35,10.13C18.05,8.13 22.03,8.92 22.03,12.5C22.03,17 18.46,17.1 17.28,14.73C16.78,13.74 15.72,13.3 14.79,13.11C14.59,13.59 14.28,14 13.88,14.34C15.87,18.03 15.08,22 11.5,22C7,22 6.91,18.42 9.27,17.24C10.25,16.75 10.69,15.71 10.89,14.79C10.4,14.59 9.97,14.27 9.65,13.87C5.96,15.85 2,15.07 2,11.5C2,7 5.56,6.89 6.74,9.26C7.24,10.25 8.29,10.68 9.22,10.87C9.41,10.39 9.73,9.97 10.14,9.65C8.15,5.96 8.94,2 12.5,2Z",
  speedtest: "M12,16A3,3 0 0,1 9,13C9,11.88 9.61,10.9 10.5,10.39L20.21,4.77L14.68,14.35C14.18,15.33 13.17,16 12,16M12,3C13.81,3 15.5,3.5 16.97,4.32L14.87,5.53C14,5.19 13,5 12,5A8,8 0 0,0 4,13C4,15.21 4.89,17.21 6.34,18.65H6.35C6.74,19.04 6.74,19.67 6.35,20.06C5.96,20.45 5.32,20.45 4.93,20.07V20.07C3.12,18.26 2,15.76 2,13A10,10 0 0,1 12,3M22,13C22,15.76 20.88,18.26 19.07,20.07V20.07C18.68,20.45 18.05,20.45 17.66,20.06C17.27,19.67 17.27,19.04 17.66,18.65V18.65C19.11,17.2 20,15.21 20,13C20,12 19.81,11 19.46,10.1L20.67,8C21.5,9.5 22,11.18 22,13Z",
  timer: "M12,20A7,7 0 0,1 5,13A7,7 0 0,1 12,6A7,7 0 0,1 19,13A7,7 0 0,1 12,20M19.03,7.39L20.45,5.97C20,5.46 19.55,5 19.04,4.56L17.62,6C16.07,4.74 14.12,4 12,4A9,9 0 0,0 3,13A9,9 0 0,0 12,22C17,22 21,17.97 21,13C21,10.88 20.26,8.93 19.03,7.39M11,14H13V8H11M15,1H9V3H15V1Z",
  network: "M13,19H14A1,1 0 0,1 15,20H22V22H15A1,1 0 0,1 14,23H10A1,1 0 0,1 9,22H2V20H9A1,1 0 0,1 10,19H11V17H4A1,1 0 0,1 3,16V12A1,1 0 0,1 4,11H20A1,1 0 0,1 21,12V16A1,1 0 0,1 20,17H13V19M4,3H20A1,1 0 0,1 21,4V8A1,1 0 0,1 20,9H4A1,1 0 0,1 3,8V4A1,1 0 0,1 4,3M9,7H10V5H9V7M9,15H10V13H9V15M5,5V7H7V5H5M5,13V15H7V13H5Z",
  ip: "M16.36,14C16.44,13.34 16.5,12.68 16.5,12C16.5,11.32 16.44,10.66 16.36,10H19.74C19.9,10.64 20,11.31 20,12C20,12.69 19.9,13.36 19.74,14M14.59,19.56C15.19,18.45 15.65,17.25 15.97,16H18.92C17.96,17.65 16.43,18.93 14.59,19.56M14.34,14H9.66C9.56,13.34 9.5,12.68 9.5,12C9.5,11.32 9.56,10.65 9.66,10H14.34C14.43,10.65 14.5,11.32 14.5,12C14.5,12.68 14.43,13.34 14.34,14M12,19.96C11.17,18.76 10.5,17.43 10.09,16H13.91C13.5,17.43 12.83,18.76 12,19.96M8,8H5.08C6.03,6.34 7.57,5.06 9.4,4.44C8.8,5.55 8.35,6.75 8,8M5.08,16H8C8.35,17.25 8.8,18.45 9.4,19.56C7.57,18.93 6.03,17.65 5.08,16M4.26,14C4.1,13.36 4,12.69 4,12C4,11.31 4.1,10.64 4.26,10H7.64C7.56,10.66 7.5,11.32 7.5,12C7.5,12.68 7.56,13.34 7.64,14M12,4.03C12.83,5.23 13.5,6.57 13.91,8H10.09C10.5,6.57 11.17,5.23 12,4.03M18.92,8H15.97C15.65,6.75 15.19,5.55 14.59,4.44C16.43,5.07 17.96,6.34 18.92,8M12,2C6.47,2 2,6.5 2,12A10,10 0 0,0 12,22A10,10 0 0,0 22,12A10,10 0 0,0 12,2Z",
  devices: "M3,6H21V4H3C1.9,4 1,4.9 1,6V18A2,2 0 0,0 3,20H7V18H3V6M13,12H9V13.78C8.39,14.33 8,15.11 8,16C8,16.89 8.39,17.67 9,18.22V20H13V18.22C13.61,17.67 14,16.88 14,16C14,15.12 13.61,14.33 13,13.78V12M11,17.5A1.5,1.5 0 0,1 9.5,16A1.5,1.5 0 0,1 11,14.5A1.5,1.5 0 0,1 12.5,16A1.5,1.5 0 0,1 11,17.5M22,8H16A1,1 0 0,0 15,9V19A1,1 0 0,0 16,20H22A1,1 0 0,0 23,19V9A1,1 0 0,0 22,8M21,18H17V10H21V18Z",
  wifi: "M12,21L15.6,16.2C14.6,15.45 13.35,15 12,15C10.65,15 9.4,15.45 8.4,16.2L12,21M12,3C7.95,3 4.21,4.34 1.2,6.6L3,9C5.5,7.12 8.62,6 12,6C15.38,6 18.5,7.12 21,9L22.8,6.6C19.79,4.34 16.05,3 12,3M12,9C9.3,9 6.81,9.89 4.8,11.4L6.6,13.8C8.1,12.67 9.97,12 12,12C14.03,12 15.9,12.67 17.4,13.8L19.2,11.4C17.19,9.89 14.7,9 12,9Z",
  wifi_off: "M2.28,3L1,4.27L2.47,5.74C2.04,6 1.61,6.29 1.2,6.6L3,9C3.39,8.7 3.82,8.42 4.26,8.16L6.5,10.4C5.9,10.68 5.33,11 4.8,11.4L6.6,13.8C7.14,13.4 7.73,13.06 8.35,12.79L10.88,15.32C10,15.5 9.13,15.79 8.4,16.2L12,21L14.88,17.17L19.73,22L21,20.72L3.28,3H2.28M12,3C10.08,3 8.24,3.3 6.5,3.85L8.97,6.32C9.95,6.11 10.96,6 12,6C15.38,6 18.5,7.12 21,9L22.8,6.6C19.79,4.34 16.05,3 12,3M12,9C11.62,9 11.25,9 10.88,9.05L14.15,12.32C15.32,12.6 16.43,13.09 17.4,13.8L19.2,11.4C17.19,9.89 14.7,9 12,9Z",
  restart: "M12,4C14.1,4 16.1,4.8 17.6,6.3C20.7,9.4 20.7,14.5 17.6,17.6C15.8,19.5 13.3,20.2 10.9,19.9L11.4,17.9C13.1,18.1 14.9,17.5 16.2,16.2C18.5,13.9 18.5,10.1 16.2,7.7C15.1,6.6 13.5,6 12,6V10.6L7,5.6L12,0.6V4M6.3,17.6C3.7,15 3.3,11 5.1,7.9L6.6,9.4C5.5,11.6 5.9,14.4 7.8,16.2C8.3,16.7 8.9,17.1 9.6,17.4L9,19.4C8,19 7.1,18.4 6.3,17.6Z",
  // mdi:chip, for the system section.
  chip: "M6,4H18V5H21V7H18V9H21V11H18V13H21V15H18V17H21V19H18V20H6V19H3V17H6V15H3V13H6V11H3V9H6V7H3V5H6V4M11,15V18H12V15H11M13,15V18H14V15H13M15,15V18H16V15H15Z",
  // mdi:access-point-network, for the mesh / network devices section.
  mesh: "M4.93,2.93C3.12,4.74 2,7.24 2,10C2,12.76 3.12,15.26 4.93,17.07L6.34,15.66C4.89,14.22 4,12.22 4,10C4,7.79 4.89,5.78 6.34,4.34L4.93,2.93M19.07,2.93L17.66,4.34C19.11,5.78 20,7.79 20,10C20,12.22 19.11,14.22 17.66,15.66L19.07,17.07C20.88,15.26 22,12.76 22,10C22,7.24 20.88,4.74 19.07,2.93M7.76,5.76C6.67,6.85 6,8.35 6,10C6,11.65 6.67,13.15 7.76,14.24L9.17,12.83C8.45,12.11 8,11.11 8,10C8,8.89 8.45,7.89 9.17,7.17L7.76,5.76M16.24,5.76L14.83,7.17C15.55,7.89 16,8.89 16,10C16,11.11 15.55,12.11 14.83,12.83L16.24,14.24C17.33,13.15 18,11.65 18,10C18,8.35 17.33,6.85 16.24,5.76M12,8A2,2 0 0,0 10,10A2,2 0 0,0 12,12A2,2 0 0,0 14,10A2,2 0 0,0 12,8M11,14V18H10A1,1 0 0,0 9,19H2V21H9A1,1 0 0,0 10,22H14A1,1 0 0,0 15,21H22V19H15A1,1 0 0,0 14,18H13V14H11Z",
  // mdi:update, the firmware update chip.
  update: "M21,10.12H14.22L16.96,7.3C14.23,4.6 9.81,4.5 7.08,7.2C4.35,9.91 4.35,14.28 7.08,17C9.81,19.7 14.23,19.7 16.96,17C18.32,15.65 19,14.08 19,12.1H21C21,14.08 20.12,16.65 18.36,18.39C14.85,21.87 9.15,21.87 5.64,18.39C2.14,14.92 2.11,9.28 5.62,5.81C9.13,2.34 14.76,2.34 18.27,5.81L21,3V10.12M12.5,8V12.25L16,14.33L15.28,15.54L11,13V8H12.5Z",
  // mdi:arrow-expand / mdi:arrow-collapse: the detail button of the mini card.
  expand: "M10,21V19H6.41L10.91,14.5L9.5,13.09L5,17.59V14H3V21H10M14.5,10.91L19,6.41V10H21V3H14V5H17.59L13.09,9.5L14.5,10.91Z",
  collapse: "M19.5,3.09L15,7.59V4H13V11H20V9H16.41L20.91,4.5L19.5,3.09M4,13V15H7.59L3.09,19.5L4.5,20.91L9,16.41V20H11V13H4Z",
};

// Header icon of the kind of device, drawn with strokes like the other cards' line icons: a firewall shield, a router
// with its antennas, a mesh of three units, an access point with its waves.
const KIND_ICONS = {
  firewall: '<path class="ln" d="M12 2.5 4.5 5.5V11c0 4.6 3.2 8.6 7.5 10 4.3-1.4 7.5-5.4 7.5-10V5.5Z"/><path class="ln" d="m8.5 12 2.5 2.5 4.5-5"/>',
  router: '<rect x="3" y="13" width="18" height="7" rx="2"/><circle class="led" cx="7" cy="16.5" r="1.1"/><circle class="led" cx="10.5" cy="16.5" r="1.1"/><path class="ln" d="M7 13V5M17 13V5M12 13V8"/>',
  mesh: '<circle cx="12" cy="5.5" r="2.6"/><circle cx="5" cy="17.5" r="2.6"/><circle cx="19" cy="17.5" r="2.6"/><path class="ln" d="M10.6 7.8 6.4 15.2M13.4 7.8l4.2 7.4M7.6 17.5h8.8"/>',
  ap: '<ellipse cx="12" cy="17" rx="8" ry="3"/><path class="ln" d="M8.5 9.5a5 5 0 0 1 7 0M6 7a8.5 8.5 0 0 1 12 0"/><circle cx="12" cy="12.2" r="1.3"/>',
};
const kindIcon = (kind) => `<svg class="icon type" viewBox="0 0 24 24" aria-hidden="true">${KIND_ICONS[kind] || KIND_ICONS.router}</svg>`;
const svgIcon = (path, cls = "") => `<svg class="icon ${cls}" viewBox="0 0 24 24"><path d="${path}"/></svg>`;

const STRINGS = {
  en: {
    network: "Network",
    system: "System",
    mesh: "Mesh",
    network_devices: "Network devices",
    lan: "Local network",
    download: "Download",
    upload: "Upload",
    uptime: "Uptime",
    firmware: "Firmware",
    wan: "WAN",
    online: "Online",
    offline: "Offline",
    unavailable: "Unavailable",
    unknown: "Unknown",
    latency: "Latency and packet loss",
    loss: "loss",
    load: "Load",
    cpu: "CPU",
    ram: "RAM",
    disk: "Disk",
    temperature: "Temp.",
    rpm: "rpm",
    main: "main",
    clients: "Clients",
    clients_n: "clients",
    clients_n_one: "client",
    wired: "Wired",
    wireless: "Wi-Fi",
    guest: "Guest",
    wifi: "Wi-Fi",
    on: "On",
    off: "Off",
    update_available: "Update available",
    restart: "Restart the device",
    restart_confirm: "Restart the device now? The network and the internet connection will be interrupted for a few minutes.",
    restart_btn: "Restart",
    cancel: "Cancel",
    wifi_turn_on: "Turn the Wi-Fi on",
    wifi_turn_off: "Turn the Wi-Fi off",
    wifi_off_confirm: "Turn this Wi-Fi network off now? Its wireless devices will lose their connection; wired devices are not affected.",
    wifi_off_btn: "Turn off",
    hours: "h",
    days: "d",
    minutes: "min",
    no_device: "No firewall, router or mesh system found. Is a supported integration (Firewalla, OPNsense, pfSense, UniFi, TP-Link Deco, Omada, MikroTik, ASUS, NETGEAR, OpenWrt, GL.iNet, eero, Linksys Velop…) installed?",
    unknown_device: "Device not found",
    zoom_in: "Show the full card",
    zoom_out: "Back to the compact view",
    speedtest: "Speed test",
    admin: "Open the admin interface",
    kind_firewall: "Firewall",
    kind_router: "Router",
    kind_mesh: "Mesh Wi-Fi",
    kind_ap: "Access point",
    // Editor
    device: "Device (firewall, router or mesh unit)",
    title: "Title (optional, defaults to the device name)",
    kind: "Kind of device (icon and picture)",
    kind_auto: "Automatic",
    admin_url: "Admin address (optional, opened when clicking the picture)",
    show_title: "Show title",
    show_subtitle: "Show subtitle",
    show_image: "Show the device picture",
    show_logo: "Show the brand logo",
    show_network: "Show network",
    show_history: "Show 24 h history",
    show_speedtest: "Show the last speed test",
    show_system: "Show system (CPU, RAM, temperatures)",
    show_nodes: "Show mesh and network devices",
    show_lan: "Show local network (clients, Wi-Fi)",
    entities: "Sensors of your choice",
    ent_rate_down: "Download rate",
    ent_rate_up: "Upload rate",
    ent_wan: "WAN state",
    ent_ip: "WAN IP address",
    ent_boot: "Uptime",
    ent_cpu: "CPU usage",
    ent_ram: "RAM usage",
    ent_clients: "Connected clients",
    ent_download: "Speed test: download",
    ent_upload: "Speed test: upload",
    ent_ping: "Speed test: ping",
    zoom: "Detail button",
    zoom_helper: "Button at the top right that shows the full card in place of the mini card, and back",
    rate_unit: "Rate unit",
    unit_bytes: "Bytes (kB/s, MB/s)",
    unit_bits: "Bits (kb/s, Mb/s)",
    language: "Language",
    lang_auto: "Automatic",
    cpu_warning: "CPU warning (%)",
    cpu_critical: "CPU critical (%)",
    ram_warning: "RAM warning (%)",
    ram_critical: "RAM critical (%)",
    disk_warning: "Disk warning (% used)",
    disk_critical: "Disk critical (% used)",
    temp_warning: "Temperature warning (°C)",
    temp_critical: "Temperature critical (°C)",
  },
  fr: {
    network: "Réseau",
    system: "Système",
    mesh: "Réseau maillé",
    network_devices: "Équipements réseau",
    lan: "Réseau local",
    download: "Réception",
    upload: "Envoi",
    uptime: "Allumé depuis",
    firmware: "Firmware",
    wan: "WAN",
    online: "En ligne",
    offline: "Hors ligne",
    unavailable: "Indisponible",
    unknown: "Inconnu",
    latency: "Latence et perte de paquets",
    loss: "perte",
    load: "Charge",
    cpu: "CPU",
    ram: "RAM",
    disk: "Disque",
    temperature: "Temp.",
    rpm: "tr/min",
    main: "principal",
    clients: "Clients",
    clients_n: "clients",
    clients_n_one: "client",
    wired: "Filaire",
    wireless: "Wi-Fi",
    guest: "Invités",
    wifi: "Wi-Fi",
    on: "Activé",
    off: "Désactivé",
    update_available: "Mise à jour disponible",
    restart: "Redémarrer l'appareil",
    restart_confirm: "Redémarrer l'appareil maintenant ? Le réseau et la connexion internet seront interrompus pendant quelques minutes.",
    restart_btn: "Redémarrer",
    cancel: "Annuler",
    wifi_turn_on: "Activer le Wi-Fi",
    wifi_turn_off: "Désactiver le Wi-Fi",
    wifi_off_confirm: "Désactiver ce réseau Wi-Fi maintenant ? Ses appareils sans fil perdront leur connexion ; les appareils filaires ne sont pas concernés.",
    wifi_off_btn: "Désactiver",
    hours: "h",
    days: "j",
    minutes: "min",
    no_device: "Aucun pare-feu, routeur ou système maillé trouvé. Une intégration compatible (Firewalla, OPNsense, pfSense, UniFi, TP-Link Deco, Omada, MikroTik, ASUS, NETGEAR, OpenWrt, GL.iNet, eero, Linksys Velop…) est-elle installée ?",
    unknown_device: "Appareil introuvable",
    zoom_in: "Afficher la carte complète",
    zoom_out: "Revenir à la vue compacte",
    speedtest: "Test de débit",
    admin: "Ouvrir l'interface d'administration",
    kind_firewall: "Pare-feu",
    kind_router: "Routeur",
    kind_mesh: "Wi-Fi maillé",
    kind_ap: "Point d'accès",
    device: "Appareil (pare-feu, routeur ou unité maillée)",
    title: "Titre (facultatif, nom de l'appareil par défaut)",
    kind: "Type d'appareil (icône et illustration)",
    kind_auto: "Automatique",
    admin_url: "Adresse d'administration (facultative, ouverte au clic sur l'illustration)",
    show_title: "Afficher le titre",
    show_subtitle: "Afficher le sous-titre",
    show_image: "Afficher l'illustration de l'appareil",
    show_logo: "Afficher le logo de la marque",
    show_network: "Afficher le réseau",
    show_history: "Afficher l'historique sur 24 h",
    show_speedtest: "Afficher le dernier test de débit",
    show_system: "Afficher le système (CPU, RAM, températures)",
    show_nodes: "Afficher le réseau maillé et les équipements",
    show_lan: "Afficher le réseau local (clients, Wi-Fi)",
    entities: "Capteurs de votre choix",
    ent_rate_down: "Débit de réception",
    ent_rate_up: "Débit d'envoi",
    ent_wan: "État du WAN",
    ent_ip: "Adresse IP WAN",
    ent_boot: "Durée de fonctionnement",
    ent_cpu: "Utilisation du CPU",
    ent_ram: "Utilisation de la RAM",
    ent_clients: "Clients connectés",
    ent_download: "Test de débit : réception",
    ent_upload: "Test de débit : envoi",
    ent_ping: "Test de débit : ping",
    zoom: "Bouton de détail",
    zoom_helper: "Bouton en haut à droite qui affiche la carte complète à la place de la mini-carte, et inversement",
    rate_unit: "Unité de débit",
    unit_bytes: "Octets (ko/s, Mo/s)",
    unit_bits: "Bits (kb/s, Mb/s)",
    language: "Langue",
    lang_auto: "Automatique",
    cpu_warning: "Seuil d'alerte CPU (%)",
    cpu_critical: "Seuil critique CPU (%)",
    ram_warning: "Seuil d'alerte RAM (%)",
    ram_critical: "Seuil critique RAM (%)",
    disk_warning: "Seuil d'alerte disque (% utilisé)",
    disk_critical: "Seuil critique disque (% utilisé)",
    temp_warning: "Seuil d'alerte température (°C)",
    temp_critical: "Seuil critique température (°C)",
  },
  de: {
    network: "Netzwerk",
    system: "System",
    mesh: "Mesh",
    network_devices: "Netzwerkgeräte",
    lan: "Lokales Netzwerk",
    download: "Download",
    upload: "Upload",
    uptime: "Laufzeit",
    firmware: "Firmware",
    wan: "WAN",
    online: "Online",
    offline: "Offline",
    unavailable: "Nicht verfügbar",
    unknown: "Unbekannt",
    latency: "Latenz und Paketverlust",
    loss: "Verlust",
    load: "Last",
    cpu: "CPU",
    ram: "RAM",
    disk: "Datenträger",
    temperature: "Temp.",
    rpm: "U/min",
    main: "Haupt",
    clients: "Clients",
    clients_n: "Clients",
    clients_n_one: "Client",
    wired: "Kabel",
    wireless: "WLAN",
    guest: "Gäste",
    wifi: "WLAN",
    on: "An",
    off: "Aus",
    update_available: "Update verfügbar",
    restart: "Gerät neu starten",
    restart_confirm: "Das Gerät jetzt neu starten? Netzwerk und Internetverbindung werden für einige Minuten unterbrochen.",
    restart_btn: "Neu starten",
    cancel: "Abbrechen",
    wifi_turn_on: "WLAN einschalten",
    wifi_turn_off: "WLAN ausschalten",
    wifi_off_confirm: "Dieses WLAN jetzt ausschalten? Seine drahtlosen Geräte verlieren die Verbindung; kabelgebundene Geräte sind nicht betroffen.",
    wifi_off_btn: "Ausschalten",
    hours: "Std.",
    days: "T",
    minutes: "Min.",
    no_device: "Keine Firewall, kein Router und kein Mesh-System gefunden. Ist eine unterstützte Integration (Firewalla, OPNsense, pfSense, UniFi, TP-Link Deco, Omada, MikroTik, ASUS, NETGEAR, OpenWrt, GL.iNet, eero, Linksys Velop…) installiert?",
    unknown_device: "Gerät nicht gefunden",
    zoom_in: "Vollständige Karte anzeigen",
    zoom_out: "Zurück zur kompakten Ansicht",
    speedtest: "Geschwindigkeitstest",
    admin: "Verwaltungsoberfläche öffnen",
    kind_firewall: "Firewall",
    kind_router: "Router",
    kind_mesh: "Mesh-WLAN",
    kind_ap: "Access Point",
    device: "Gerät (Firewall, Router oder Mesh-Einheit)",
    title: "Titel (optional, standardmäßig der Gerätename)",
    kind: "Geräteart (Symbol und Bild)",
    kind_auto: "Automatisch",
    admin_url: "Verwaltungsadresse (optional, wird beim Klick auf das Bild geöffnet)",
    show_title: "Titel anzeigen",
    show_subtitle: "Untertitel anzeigen",
    show_image: "Gerätebild anzeigen",
    show_logo: "Markenlogo anzeigen",
    show_network: "Netzwerk anzeigen",
    show_history: "24-h-Verlauf anzeigen",
    show_speedtest: "Letzten Geschwindigkeitstest anzeigen",
    show_system: "System anzeigen (CPU, RAM, Temperaturen)",
    show_nodes: "Mesh und Netzwerkgeräte anzeigen",
    show_lan: "Lokales Netzwerk anzeigen (Clients, WLAN)",
    entities: "Sensoren Ihrer Wahl",
    ent_rate_down: "Download-Rate",
    ent_rate_up: "Upload-Rate",
    ent_wan: "WAN-Status",
    ent_ip: "WAN-IP-Adresse",
    ent_boot: "Laufzeit",
    ent_cpu: "CPU-Auslastung",
    ent_ram: "RAM-Auslastung",
    ent_clients: "Verbundene Clients",
    ent_download: "Geschwindigkeitstest: Download",
    ent_upload: "Geschwindigkeitstest: Upload",
    ent_ping: "Geschwindigkeitstest: Ping",
    zoom: "Detail-Schaltfläche",
    zoom_helper: "Schaltfläche oben rechts, die anstelle der Mini-Karte die vollständige Karte anzeigt, und zurück",
    rate_unit: "Einheit der Datenrate",
    unit_bytes: "Bytes (kB/s, MB/s)",
    unit_bits: "Bits (kb/s, Mb/s)",
    language: "Sprache",
    lang_auto: "Automatisch",
    cpu_warning: "CPU-Warnung (%)",
    cpu_critical: "CPU kritisch (%)",
    ram_warning: "RAM-Warnung (%)",
    ram_critical: "RAM kritisch (%)",
    disk_warning: "Datenträger-Warnung (% belegt)",
    disk_critical: "Datenträger kritisch (% belegt)",
    temp_warning: "Temperaturwarnung (°C)",
    temp_critical: "Temperatur kritisch (°C)",
  },
  es: {
    network: "Red",
    system: "Sistema",
    mesh: "Malla",
    network_devices: "Equipos de red",
    lan: "Red local",
    download: "Descarga",
    upload: "Subida",
    uptime: "Encendido desde hace",
    firmware: "Firmware",
    wan: "WAN",
    online: "En línea",
    offline: "Fuera de línea",
    unavailable: "No disponible",
    unknown: "Desconocido",
    latency: "Latencia y pérdida de paquetes",
    loss: "pérdida",
    load: "Carga",
    cpu: "CPU",
    ram: "RAM",
    disk: "Disco",
    temperature: "Temp.",
    rpm: "rpm",
    main: "principal",
    clients: "Clientes",
    clients_n: "clientes",
    clients_n_one: "cliente",
    wired: "Cable",
    wireless: "Wi-Fi",
    guest: "Invitados",
    wifi: "Wi-Fi",
    on: "Activado",
    off: "Desactivado",
    update_available: "Actualización disponible",
    restart: "Reiniciar el equipo",
    restart_confirm: "¿Reiniciar el equipo ahora? La red y la conexión a internet se interrumpirán durante unos minutos.",
    restart_btn: "Reiniciar",
    cancel: "Cancelar",
    wifi_turn_on: "Activar el Wi-Fi",
    wifi_turn_off: "Desactivar el Wi-Fi",
    wifi_off_confirm: "¿Desactivar esta red Wi-Fi ahora? Sus dispositivos inalámbricos perderán la conexión; los dispositivos por cable no se ven afectados.",
    wifi_off_btn: "Desactivar",
    hours: "h",
    days: "d",
    minutes: "min",
    no_device: "No se ha encontrado ningún cortafuegos, router ni sistema en malla. ¿Hay instalada una integración compatible (Firewalla, OPNsense, pfSense, UniFi, TP-Link Deco, Omada, MikroTik, ASUS, NETGEAR, OpenWrt, GL.iNet, eero, Linksys Velop…)?",
    unknown_device: "Equipo no encontrado",
    zoom_in: "Mostrar la tarjeta completa",
    zoom_out: "Volver a la vista compacta",
    speedtest: "Test de velocidad",
    admin: "Abrir la interfaz de administración",
    kind_firewall: "Cortafuegos",
    kind_router: "Router",
    kind_mesh: "Wi-Fi en malla",
    kind_ap: "Punto de acceso",
    device: "Equipo (cortafuegos, router o unidad en malla)",
    title: "Título (opcional, por defecto el nombre del equipo)",
    kind: "Tipo de equipo (icono e imagen)",
    kind_auto: "Automático",
    admin_url: "Dirección de administración (opcional, se abre al pulsar la imagen)",
    show_title: "Mostrar el título",
    show_subtitle: "Mostrar el subtítulo",
    show_image: "Mostrar la imagen del equipo",
    show_logo: "Mostrar el logotipo de la marca",
    show_network: "Mostrar la red",
    show_history: "Mostrar el historial de 24 h",
    show_speedtest: "Mostrar el último test de velocidad",
    show_system: "Mostrar el sistema (CPU, RAM, temperaturas)",
    show_nodes: "Mostrar la malla y los equipos de red",
    show_lan: "Mostrar la red local (clientes, Wi-Fi)",
    entities: "Sensores de su elección",
    ent_rate_down: "Velocidad de descarga",
    ent_rate_up: "Velocidad de subida",
    ent_wan: "Estado de la WAN",
    ent_ip: "Dirección IP WAN",
    ent_boot: "Tiempo encendido",
    ent_cpu: "Uso de CPU",
    ent_ram: "Uso de RAM",
    ent_clients: "Clientes conectados",
    ent_download: "Test de velocidad: descarga",
    ent_upload: "Test de velocidad: subida",
    ent_ping: "Test de velocidad: ping",
    zoom: "Botón de detalle",
    zoom_helper: "Botón arriba a la derecha que muestra la tarjeta completa en lugar de la minitarjeta, y viceversa",
    rate_unit: "Unidad de velocidad",
    unit_bytes: "Bytes (kB/s, MB/s)",
    unit_bits: "Bits (kb/s, Mb/s)",
    language: "Idioma",
    lang_auto: "Automático",
    cpu_warning: "Aviso de CPU (%)",
    cpu_critical: "CPU crítica (%)",
    ram_warning: "Aviso de RAM (%)",
    ram_critical: "RAM crítica (%)",
    disk_warning: "Aviso de disco (% usado)",
    disk_critical: "Disco crítico (% usado)",
    temp_warning: "Aviso de temperatura (°C)",
    temp_critical: "Temperatura crítica (°C)",
  },
  it: {
    network: "Rete",
    system: "Sistema",
    mesh: "Mesh",
    network_devices: "Dispositivi di rete",
    lan: "Rete locale",
    download: "Download",
    upload: "Upload",
    uptime: "Acceso da",
    firmware: "Firmware",
    wan: "WAN",
    online: "Online",
    offline: "Offline",
    unavailable: "Non disponibile",
    unknown: "Sconosciuto",
    latency: "Latenza e perdita di pacchetti",
    loss: "perdita",
    load: "Carico",
    cpu: "CPU",
    ram: "RAM",
    disk: "Disco",
    temperature: "Temp.",
    rpm: "giri/min",
    main: "principale",
    clients: "Client",
    clients_n: "client",
    wired: "Cablati",
    wireless: "Wi-Fi",
    guest: "Ospiti",
    wifi: "Wi-Fi",
    on: "Attivo",
    off: "Disattivo",
    update_available: "Aggiornamento disponibile",
    restart: "Riavvia il dispositivo",
    restart_confirm: "Riavviare il dispositivo ora? La rete e la connessione a internet saranno interrotte per qualche minuto.",
    restart_btn: "Riavvia",
    cancel: "Annulla",
    wifi_turn_on: "Attiva il Wi-Fi",
    wifi_turn_off: "Disattiva il Wi-Fi",
    wifi_off_confirm: "Disattivare ora questa rete Wi-Fi? I suoi dispositivi wireless perderanno la connessione; i dispositivi cablati non sono interessati.",
    wifi_off_btn: "Disattiva",
    hours: "h",
    days: "g",
    minutes: "min",
    no_device: "Nessun firewall, router o sistema mesh trovato. È installata un'integrazione supportata (Firewalla, OPNsense, pfSense, UniFi, TP-Link Deco, Omada, MikroTik, ASUS, NETGEAR, OpenWrt, GL.iNet, eero, Linksys Velop…)?",
    unknown_device: "Dispositivo non trovato",
    zoom_in: "Mostra la scheda completa",
    zoom_out: "Torna alla vista compatta",
    speedtest: "Test di velocità",
    admin: "Apri l'interfaccia di amministrazione",
    kind_firewall: "Firewall",
    kind_router: "Router",
    kind_mesh: "Wi-Fi mesh",
    kind_ap: "Access point",
    device: "Dispositivo (firewall, router o unità mesh)",
    title: "Titolo (facoltativo, per impostazione predefinita il nome del dispositivo)",
    kind: "Tipo di dispositivo (icona e immagine)",
    kind_auto: "Automatico",
    admin_url: "Indirizzo di amministrazione (facoltativo, aperto al clic sull'immagine)",
    show_title: "Mostra il titolo",
    show_subtitle: "Mostra il sottotitolo",
    show_image: "Mostra l'immagine del dispositivo",
    show_logo: "Mostra il logo del marchio",
    show_network: "Mostra la rete",
    show_history: "Mostra la cronologia di 24 h",
    show_speedtest: "Mostra l'ultimo test di velocità",
    show_system: "Mostra il sistema (CPU, RAM, temperature)",
    show_nodes: "Mostra la rete mesh e i dispositivi di rete",
    show_lan: "Mostra la rete locale (client, Wi-Fi)",
    entities: "Sensori a scelta",
    ent_rate_down: "Velocità di download",
    ent_rate_up: "Velocità di upload",
    ent_wan: "Stato della WAN",
    ent_ip: "Indirizzo IP WAN",
    ent_boot: "Tempo di attività",
    ent_cpu: "Uso della CPU",
    ent_ram: "Uso della RAM",
    ent_clients: "Client connessi",
    ent_download: "Test di velocità: download",
    ent_upload: "Test di velocità: upload",
    ent_ping: "Test di velocità: ping",
    zoom: "Pulsante dettagli",
    zoom_helper: "Pulsante in alto a destra che mostra la scheda completa al posto della mini scheda, e viceversa",
    rate_unit: "Unità di velocità",
    unit_bytes: "Byte (kB/s, MB/s)",
    unit_bits: "Bit (kb/s, Mb/s)",
    language: "Lingua",
    lang_auto: "Automatica",
    cpu_warning: "Avviso CPU (%)",
    cpu_critical: "CPU critica (%)",
    ram_warning: "Avviso RAM (%)",
    ram_critical: "RAM critica (%)",
    disk_warning: "Avviso disco (% usato)",
    disk_critical: "Disco critico (% usato)",
    temp_warning: "Avviso temperatura (°C)",
    temp_critical: "Temperatura critica (°C)",
  },
  nl: {
    network: "Netwerk",
    system: "Systeem",
    mesh: "Mesh",
    network_devices: "Netwerkapparaten",
    lan: "Lokaal netwerk",
    download: "Download",
    upload: "Upload",
    uptime: "In bedrijf",
    firmware: "Firmware",
    wan: "WAN",
    online: "Online",
    offline: "Offline",
    unavailable: "Niet beschikbaar",
    unknown: "Onbekend",
    latency: "Latentie en pakketverlies",
    loss: "verlies",
    load: "Belasting",
    cpu: "CPU",
    ram: "RAM",
    disk: "Schijf",
    temperature: "Temp.",
    rpm: "tpm",
    main: "hoofd",
    clients: "Clients",
    clients_n: "clients",
    clients_n_one: "client",
    wired: "Bekabeld",
    wireless: "Wifi",
    guest: "Gasten",
    wifi: "Wifi",
    on: "Aan",
    off: "Uit",
    update_available: "Update beschikbaar",
    restart: "Apparaat herstarten",
    restart_confirm: "Het apparaat nu herstarten? Het netwerk en de internetverbinding worden een paar minuten onderbroken.",
    restart_btn: "Herstarten",
    cancel: "Annuleren",
    wifi_turn_on: "Wifi inschakelen",
    wifi_turn_off: "Wifi uitschakelen",
    wifi_off_confirm: "Dit wifi-netwerk nu uitschakelen? De draadloze apparaten verliezen hun verbinding; bekabelde apparaten merken er niets van.",
    wifi_off_btn: "Uitschakelen",
    hours: "u",
    days: "d",
    minutes: "min",
    no_device: "Geen firewall, router of meshsysteem gevonden. Is er een ondersteunde integratie (Firewalla, OPNsense, pfSense, UniFi, TP-Link Deco, Omada, MikroTik, ASUS, NETGEAR, OpenWrt, GL.iNet, eero, Linksys Velop…) geïnstalleerd?",
    unknown_device: "Apparaat niet gevonden",
    zoom_in: "Volledige kaart tonen",
    zoom_out: "Terug naar de compacte weergave",
    speedtest: "Snelheidstest",
    admin: "Beheerinterface openen",
    kind_firewall: "Firewall",
    kind_router: "Router",
    kind_mesh: "Mesh-wifi",
    kind_ap: "Access point",
    device: "Apparaat (firewall, router of mesh-eenheid)",
    title: "Titel (optioneel, standaard de naam van het apparaat)",
    kind: "Soort apparaat (pictogram en afbeelding)",
    kind_auto: "Automatisch",
    admin_url: "Beheeradres (optioneel, geopend bij een klik op de afbeelding)",
    show_title: "Titel tonen",
    show_subtitle: "Ondertitel tonen",
    show_image: "Afbeelding van het apparaat tonen",
    show_logo: "Merklogo tonen",
    show_network: "Netwerk tonen",
    show_history: "Geschiedenis van 24 uur tonen",
    show_speedtest: "Laatste snelheidstest tonen",
    show_system: "Systeem tonen (CPU, RAM, temperaturen)",
    show_nodes: "Mesh en netwerkapparaten tonen",
    show_lan: "Lokaal netwerk tonen (clients, wifi)",
    entities: "Sensoren naar keuze",
    ent_rate_down: "Downloadsnelheid",
    ent_rate_up: "Uploadsnelheid",
    ent_wan: "WAN-status",
    ent_ip: "WAN-IP-adres",
    ent_boot: "Bedrijfstijd",
    ent_cpu: "CPU-gebruik",
    ent_ram: "RAM-gebruik",
    ent_clients: "Verbonden clients",
    ent_download: "Snelheidstest: download",
    ent_upload: "Snelheidstest: upload",
    ent_ping: "Snelheidstest: ping",
    zoom: "Detailknop",
    zoom_helper: "Knop rechtsboven die de volledige kaart toont in plaats van de minikaart, en terug",
    rate_unit: "Eenheid van snelheid",
    unit_bytes: "Bytes (kB/s, MB/s)",
    unit_bits: "Bits (kb/s, Mb/s)",
    language: "Taal",
    lang_auto: "Automatisch",
    cpu_warning: "CPU-waarschuwing (%)",
    cpu_critical: "CPU kritiek (%)",
    ram_warning: "RAM-waarschuwing (%)",
    ram_critical: "RAM kritiek (%)",
    disk_warning: "Schijfwaarschuwing (% gebruikt)",
    disk_critical: "Schijf kritiek (% gebruikt)",
    temp_warning: "Temperatuurwaarschuwing (°C)",
    temp_critical: "Temperatuur kritiek (°C)",
  },
  pt: {
    network: "Rede",
    system: "Sistema",
    mesh: "Malha",
    network_devices: "Equipamentos de rede",
    lan: "Rede local",
    download: "Transferência",
    upload: "Envio",
    uptime: "Ligado há",
    firmware: "Firmware",
    wan: "WAN",
    online: "Online",
    offline: "Offline",
    unavailable: "Indisponível",
    unknown: "Desconhecido",
    latency: "Latência e perda de pacotes",
    loss: "perda",
    load: "Carga",
    cpu: "CPU",
    ram: "RAM",
    disk: "Disco",
    temperature: "Temp.",
    rpm: "rpm",
    main: "principal",
    clients: "Clientes",
    clients_n: "clientes",
    clients_n_one: "cliente",
    wired: "Cabo",
    wireless: "Wi-Fi",
    guest: "Convidados",
    wifi: "Wi-Fi",
    on: "Ligado",
    off: "Desligado",
    update_available: "Atualização disponível",
    restart: "Reiniciar o equipamento",
    restart_confirm: "Reiniciar o equipamento agora? A rede e a ligação à internet serão interrompidas durante alguns minutos.",
    restart_btn: "Reiniciar",
    cancel: "Cancelar",
    wifi_turn_on: "Ligar o Wi-Fi",
    wifi_turn_off: "Desligar o Wi-Fi",
    wifi_off_confirm: "Desligar esta rede Wi-Fi agora? Os seus dispositivos sem fios perderão a ligação; os dispositivos com cabo não são afetados.",
    wifi_off_btn: "Desligar",
    hours: "h",
    days: "d",
    minutes: "min",
    no_device: "Nenhuma firewall, router ou sistema em malha encontrado. Está instalada uma integração compatível (Firewalla, OPNsense, pfSense, UniFi, TP-Link Deco, Omada, MikroTik, ASUS, NETGEAR, OpenWrt, GL.iNet, eero, Linksys Velop…)?",
    unknown_device: "Equipamento não encontrado",
    zoom_in: "Mostrar o cartão completo",
    zoom_out: "Voltar à vista compacta",
    speedtest: "Teste de velocidade",
    admin: "Abrir a interface de administração",
    kind_firewall: "Firewall",
    kind_router: "Router",
    kind_mesh: "Wi-Fi em malha",
    kind_ap: "Ponto de acesso",
    device: "Equipamento (firewall, router ou unidade em malha)",
    title: "Título (opcional, por omissão o nome do equipamento)",
    kind: "Tipo de equipamento (ícone e imagem)",
    kind_auto: "Automático",
    admin_url: "Endereço de administração (opcional, aberto ao clicar na imagem)",
    show_title: "Mostrar o título",
    show_subtitle: "Mostrar o subtítulo",
    show_image: "Mostrar a imagem do equipamento",
    show_logo: "Mostrar o logótipo da marca",
    show_network: "Mostrar a rede",
    show_history: "Mostrar o histórico de 24 h",
    show_speedtest: "Mostrar o último teste de velocidade",
    show_system: "Mostrar o sistema (CPU, RAM, temperaturas)",
    show_nodes: "Mostrar a malha e os equipamentos de rede",
    show_lan: "Mostrar a rede local (clientes, Wi-Fi)",
    entities: "Sensores à sua escolha",
    ent_rate_down: "Velocidade de transferência",
    ent_rate_up: "Velocidade de envio",
    ent_wan: "Estado da WAN",
    ent_ip: "Endereço IP WAN",
    ent_boot: "Tempo ligado",
    ent_cpu: "Utilização da CPU",
    ent_ram: "Utilização da RAM",
    ent_clients: "Clientes ligados",
    ent_download: "Teste de velocidade: transferência",
    ent_upload: "Teste de velocidade: envio",
    ent_ping: "Teste de velocidade: ping",
    zoom: "Botão de detalhe",
    zoom_helper: "Botão no canto superior direito que mostra o cartão completo em vez do mini cartão, e vice-versa",
    rate_unit: "Unidade de velocidade",
    unit_bytes: "Bytes (kB/s, MB/s)",
    unit_bits: "Bits (kb/s, Mb/s)",
    language: "Idioma",
    lang_auto: "Automático",
    cpu_warning: "Alerta de CPU (%)",
    cpu_critical: "CPU crítica (%)",
    ram_warning: "Alerta de RAM (%)",
    ram_critical: "RAM crítica (%)",
    disk_warning: "Alerta de disco (% utilizado)",
    disk_critical: "Disco crítico (% utilizado)",
    temp_warning: "Alerta de temperatura (°C)",
    temp_critical: "Temperatura crítica (°C)",
  },
  pl: {
    network: "Sieć",
    system: "System",
    mesh: "Mesh",
    network_devices: "Urządzenia sieciowe",
    lan: "Sieć lokalna",
    download: "Pobieranie",
    upload: "Wysyłanie",
    uptime: "Czas pracy",
    firmware: "Oprogramowanie",
    wan: "WAN",
    online: "Online",
    offline: "Offline",
    unavailable: "Niedostępne",
    unknown: "Nieznany",
    latency: "Opóźnienie i utrata pakietów",
    loss: "utraty",
    load: "Obciążenie",
    cpu: "CPU",
    ram: "RAM",
    disk: "Dysk",
    temperature: "Temp.",
    rpm: "obr./min",
    main: "główny",
    clients: "Klienci",
    clients_n: "klientów",
    clients_n_one: "klient",
    clients_n_few: "klientów",
    clients_n_many: "klientów",
    wired: "Przewodowo",
    wireless: "Wi-Fi",
    guest: "Goście",
    wifi: "Wi-Fi",
    on: "Włączone",
    off: "Wyłączone",
    update_available: "Dostępna aktualizacja",
    restart: "Uruchom urządzenie ponownie",
    restart_confirm: "Uruchomić urządzenie ponownie teraz? Sieć i połączenie z internetem zostaną przerwane na kilka minut.",
    restart_btn: "Uruchom ponownie",
    cancel: "Anuluj",
    wifi_turn_on: "Włącz Wi-Fi",
    wifi_turn_off: "Wyłącz Wi-Fi",
    wifi_off_confirm: "Wyłączyć teraz tę sieć Wi-Fi? Jej urządzenia bezprzewodowe utracą połączenie; urządzenia przewodowe nie zostaną dotknięte.",
    wifi_off_btn: "Wyłącz",
    hours: "godz.",
    days: "d",
    minutes: "min",
    no_device: "Nie znaleziono zapory, routera ani systemu mesh. Czy zainstalowano obsługiwaną integrację (Firewalla, OPNsense, pfSense, UniFi, TP-Link Deco, Omada, MikroTik, ASUS, NETGEAR, OpenWrt, GL.iNet, eero, Linksys Velop…)?",
    unknown_device: "Nie znaleziono urządzenia",
    zoom_in: "Pokaż pełną kartę",
    zoom_out: "Wróć do widoku kompaktowego",
    speedtest: "Test prędkości",
    admin: "Otwórz interfejs administracyjny",
    kind_firewall: "Zapora",
    kind_router: "Router",
    kind_mesh: "Wi-Fi mesh",
    kind_ap: "Punkt dostępowy",
    device: "Urządzenie (zapora, router lub jednostka mesh)",
    title: "Tytuł (opcjonalny, domyślnie nazwa urządzenia)",
    kind: "Rodzaj urządzenia (ikona i obrazek)",
    kind_auto: "Automatycznie",
    admin_url: "Adres administracyjny (opcjonalny, otwierany po kliknięciu obrazka)",
    show_title: "Pokaż tytuł",
    show_subtitle: "Pokaż podtytuł",
    show_image: "Pokaż obrazek urządzenia",
    show_logo: "Pokaż logo marki",
    show_network: "Pokaż sieć",
    show_history: "Pokaż historię z 24 h",
    show_speedtest: "Pokaż ostatni test prędkości",
    show_system: "Pokaż system (CPU, RAM, temperatury)",
    show_nodes: "Pokaż mesh i urządzenia sieciowe",
    show_lan: "Pokaż sieć lokalną (klienci, Wi-Fi)",
    entities: "Wybrane czujniki",
    ent_rate_down: "Prędkość pobierania",
    ent_rate_up: "Prędkość wysyłania",
    ent_wan: "Stan WAN",
    ent_ip: "Adres IP WAN",
    ent_boot: "Czas pracy",
    ent_cpu: "Użycie CPU",
    ent_ram: "Użycie RAM",
    ent_clients: "Połączeni klienci",
    ent_download: "Test prędkości: pobieranie",
    ent_upload: "Test prędkości: wysyłanie",
    ent_ping: "Test prędkości: ping",
    zoom: "Przycisk szczegółów",
    zoom_helper: "Przycisk w prawym górnym rogu, który pokazuje pełną kartę zamiast mini karty, i z powrotem",
    rate_unit: "Jednostka prędkości",
    unit_bytes: "Bajty (kB/s, MB/s)",
    unit_bits: "Bity (kb/s, Mb/s)",
    language: "Język",
    lang_auto: "Automatycznie",
    cpu_warning: "Ostrzeżenie CPU (%)",
    cpu_critical: "CPU krytyczne (%)",
    ram_warning: "Ostrzeżenie RAM (%)",
    ram_critical: "RAM krytyczne (%)",
    disk_warning: "Ostrzeżenie dysku (% zajęte)",
    disk_critical: "Dysk krytyczny (% zajęte)",
    temp_warning: "Ostrzeżenie temperatury (°C)",
    temp_critical: "Temperatura krytyczna (°C)",
  },
  sr: {
    network: "Мрежа",
    system: "Систем",
    mesh: "Мешовита мрежа",
    network_devices: "Мрежни уређаји",
    lan: "Локална мрежа",
    download: "Преузимање",
    upload: "Слање",
    uptime: "Ради већ",
    firmware: "Фирмвер",
    wan: "WAN",
    online: "На мрежи",
    offline: "Ван мреже",
    unavailable: "Недоступно",
    unknown: "Непознато",
    latency: "Кашњење и губитак пакета",
    loss: "губитак",
    load: "Оптерећење",
    cpu: "CPU",
    ram: "RAM",
    disk: "Диск",
    temperature: "Темп.",
    rpm: "о/мин",
    main: "главни",
    clients: "Клијенти",
    clients_n: "клијената",
    clients_n_one: "клијент",
    clients_n_few: "клијента",
    wired: "Кабловски",
    wireless: "Wi-Fi",
    guest: "Гости",
    wifi: "Wi-Fi",
    on: "Укључено",
    off: "Искључено",
    update_available: "Доступно ажурирање",
    restart: "Поново покрени уређај",
    restart_confirm: "Поново покренути уређај сада? Мрежа и интернет веза биће прекинути на неколико минута.",
    restart_btn: "Поново покрени",
    cancel: "Откажи",
    wifi_turn_on: "Укључи Wi-Fi",
    wifi_turn_off: "Искључи Wi-Fi",
    wifi_off_confirm: "Искључити ову Wi-Fi мрежу сада? Њени бежични уређаји изгубиће везу; кабловски уређаји нису погођени.",
    wifi_off_btn: "Искључи",
    hours: "ч",
    days: "д",
    minutes: "мин",
    no_device: "Није пронађен ниједан заштитни зид, рутер ни мешовити систем. Да ли је инсталирана подржана интеграција (Firewalla, OPNsense, pfSense, UniFi, TP-Link Deco, Omada, MikroTik, ASUS, NETGEAR, OpenWrt, GL.iNet, eero, Linksys Velop…)?",
    unknown_device: "Уређај није пронађен",
    zoom_in: "Прикажи целу картицу",
    zoom_out: "Назад на сажети приказ",
    speedtest: "Тест брзине",
    admin: "Отвори администраторски интерфејс",
    kind_firewall: "Заштитни зид",
    kind_router: "Рутер",
    kind_mesh: "Мешовити Wi-Fi",
    kind_ap: "Приступна тачка",
    device: "Уређај (заштитни зид, рутер или мешовита јединица)",
    title: "Наслов (опционо, подразумевано назив уређаја)",
    kind: "Врста уређаја (икона и слика)",
    kind_auto: "Аутоматски",
    admin_url: "Администраторска адреса (опционо, отвара се кликом на слику)",
    show_title: "Прикажи наслов",
    show_subtitle: "Прикажи поднаслов",
    show_image: "Прикажи слику уређаја",
    show_logo: "Прикажи лого бренда",
    show_network: "Прикажи мрежу",
    show_history: "Прикажи историју за 24 ч",
    show_speedtest: "Прикажи последњи тест брзине",
    show_system: "Прикажи систем (CPU, RAM, температуре)",
    show_nodes: "Прикажи мешовиту мрежу и мрежне уређаје",
    show_lan: "Прикажи локалну мрежу (клијенти, Wi-Fi)",
    entities: "Сензори по избору",
    ent_rate_down: "Брзина преузимања",
    ent_rate_up: "Брзина слања",
    ent_wan: "Стање WAN-а",
    ent_ip: "WAN IP адреса",
    ent_boot: "Време рада",
    ent_cpu: "Искоришћеност CPU-а",
    ent_ram: "Искоришћеност RAM-а",
    ent_clients: "Повезани клијенти",
    ent_download: "Тест брзине: преузимање",
    ent_upload: "Тест брзине: слање",
    ent_ping: "Тест брзине: пинг",
    zoom: "Дугме за детаље",
    zoom_helper: "Дугме горе десно које приказује целу картицу уместо мини картице, и назад",
    rate_unit: "Јединица брзине",
    unit_bytes: "Бајтови (kB/s, MB/s)",
    unit_bits: "Битови (kb/s, Mb/s)",
    language: "Језик",
    lang_auto: "Аутоматски",
    cpu_warning: "Упозорење за CPU (%)",
    cpu_critical: "Критично за CPU (%)",
    ram_warning: "Упозорење за RAM (%)",
    ram_critical: "Критично за RAM (%)",
    disk_warning: "Упозорење за диск (% заузето)",
    disk_critical: "Критично за диск (% заузето)",
    temp_warning: "Упозорење за температуру (°C)",
    temp_critical: "Критична температура (°C)",
  },
  "sr-Latn": {
    network: "Mreža",
    system: "Sistem",
    mesh: "Mešovita mreža",
    network_devices: "Mrežni uređaji",
    lan: "Lokalna mreža",
    download: "Preuzimanje",
    upload: "Slanje",
    uptime: "Radi već",
    firmware: "Firmver",
    wan: "WAN",
    online: "Na mreži",
    offline: "Van mreže",
    unavailable: "Nedostupno",
    unknown: "Nepoznato",
    latency: "Kašnjenje i gubitak paketa",
    loss: "gubitak",
    load: "Opterećenje",
    cpu: "CPU",
    ram: "RAM",
    disk: "Disk",
    temperature: "Temp.",
    rpm: "o/min",
    main: "glavni",
    clients: "Klijenti",
    clients_n: "klijenata",
    clients_n_one: "klijent",
    clients_n_few: "klijenta",
    wired: "Kablovski",
    wireless: "Wi-Fi",
    guest: "Gosti",
    wifi: "Wi-Fi",
    on: "Uključeno",
    off: "Isključeno",
    update_available: "Dostupno ažuriranje",
    restart: "Ponovo pokreni uređaj",
    restart_confirm: "Ponovo pokrenuti uređaj sada? Mreža i internet veza biće prekinuti na nekoliko minuta.",
    restart_btn: "Ponovo pokreni",
    cancel: "Otkaži",
    wifi_turn_on: "Uključi Wi-Fi",
    wifi_turn_off: "Isključi Wi-Fi",
    wifi_off_confirm: "Isključiti ovu Wi-Fi mrežu sada? Njeni bežični uređaji izgubiće vezu; kablovski uređaji nisu pogođeni.",
    wifi_off_btn: "Isključi",
    hours: "č",
    days: "d",
    minutes: "min",
    no_device: "Nije pronađen nijedan zaštitni zid, ruter ni mešoviti sistem. Da li je instalirana podržana integracija (Firewalla, OPNsense, pfSense, UniFi, TP-Link Deco, Omada, MikroTik, ASUS, NETGEAR, OpenWrt, GL.iNet, eero, Linksys Velop…)?",
    unknown_device: "Uređaj nije pronađen",
    zoom_in: "Prikaži celu karticu",
    zoom_out: "Nazad na sažeti prikaz",
    speedtest: "Test brzine",
    admin: "Otvori administratorski interfejs",
    kind_firewall: "Zaštitni zid",
    kind_router: "Ruter",
    kind_mesh: "Mešoviti Wi-Fi",
    kind_ap: "Pristupna tačka",
    device: "Uređaj (zaštitni zid, ruter ili mešovita jedinica)",
    title: "Naslov (opciono, podrazumevano naziv uređaja)",
    kind: "Vrsta uređaja (ikona i slika)",
    kind_auto: "Automatski",
    admin_url: "Administratorska adresa (opciono, otvara se klikom na sliku)",
    show_title: "Prikaži naslov",
    show_subtitle: "Prikaži podnaslov",
    show_image: "Prikaži sliku uređaja",
    show_logo: "Prikaži logo brenda",
    show_network: "Prikaži mrežu",
    show_history: "Prikaži istoriju za 24 č",
    show_speedtest: "Prikaži poslednji test brzine",
    show_system: "Prikaži sistem (CPU, RAM, temperature)",
    show_nodes: "Prikaži mešovitu mrežu i mrežne uređaje",
    show_lan: "Prikaži lokalnu mrežu (klijenti, Wi-Fi)",
    entities: "Senzori po izboru",
    ent_rate_down: "Brzina preuzimanja",
    ent_rate_up: "Brzina slanja",
    ent_wan: "Stanje WAN-a",
    ent_ip: "WAN IP adresa",
    ent_boot: "Vreme rada",
    ent_cpu: "Iskorišćenost CPU-a",
    ent_ram: "Iskorišćenost RAM-a",
    ent_clients: "Povezani klijenti",
    ent_download: "Test brzine: preuzimanje",
    ent_upload: "Test brzine: slanje",
    ent_ping: "Test brzine: ping",
    zoom: "Dugme za detalje",
    zoom_helper: "Dugme gore desno koje prikazuje celu karticu umesto mini kartice, i nazad",
    rate_unit: "Jedinica brzine",
    unit_bytes: "Bajtovi (kB/s, MB/s)",
    unit_bits: "Bitovi (kb/s, Mb/s)",
    language: "Jezik",
    lang_auto: "Automatski",
    cpu_warning: "Upozorenje za CPU (%)",
    cpu_critical: "Kritično za CPU (%)",
    ram_warning: "Upozorenje za RAM (%)",
    ram_critical: "Kritično za RAM (%)",
    disk_warning: "Upozorenje za disk (% zauzeto)",
    disk_critical: "Kritično za disk (% zauzeto)",
    temp_warning: "Upozorenje za temperaturu (°C)",
    temp_critical: "Kritična temperatura (°C)",
  },
  ro: {
    network: "Rețea",
    system: "Sistem",
    mesh: "Mesh",
    network_devices: "Echipamente de rețea",
    lan: "Rețea locală",
    download: "Descărcare",
    upload: "Încărcare",
    uptime: "Pornit de",
    firmware: "Firmware",
    wan: "WAN",
    online: "Online",
    offline: "Offline",
    unavailable: "Indisponibil",
    unknown: "Necunoscut",
    latency: "Latență și pierdere de pachete",
    loss: "pierdere",
    load: "Încărcare",
    cpu: "CPU",
    ram: "RAM",
    disk: "Disc",
    temperature: "Temp.",
    rpm: "rpm",
    main: "principal",
    clients: "Clienți",
    clients_n: "de clienți",
    clients_n_one: "client",
    clients_n_few: "clienți",
    wired: "Prin cablu",
    wireless: "Wi-Fi",
    guest: "Invitați",
    wifi: "Wi-Fi",
    on: "Pornit",
    off: "Oprit",
    update_available: "Actualizare disponibilă",
    restart: "Repornește echipamentul",
    restart_confirm: "Reporniți echipamentul acum? Rețeaua și conexiunea la internet vor fi întrerupte câteva minute.",
    restart_btn: "Repornește",
    cancel: "Anulează",
    wifi_turn_on: "Pornește Wi-Fi-ul",
    wifi_turn_off: "Oprește Wi-Fi-ul",
    wifi_off_confirm: "Opriți acum această rețea Wi-Fi? Dispozitivele sale wireless își vor pierde conexiunea; dispozitivele prin cablu nu sunt afectate.",
    wifi_off_btn: "Oprește",
    hours: "h",
    days: "z",
    minutes: "min",
    no_device: "Nu s-a găsit niciun firewall, router sau sistem mesh. Este instalată o integrare compatibilă (Firewalla, OPNsense, pfSense, UniFi, TP-Link Deco, Omada, MikroTik, ASUS, NETGEAR, OpenWrt, GL.iNet, eero, Linksys Velop…)?",
    unknown_device: "Echipament negăsit",
    zoom_in: "Afișează cardul complet",
    zoom_out: "Înapoi la vizualizarea compactă",
    speedtest: "Test de viteză",
    admin: "Deschide interfața de administrare",
    kind_firewall: "Firewall",
    kind_router: "Router",
    kind_mesh: "Wi-Fi mesh",
    kind_ap: "Punct de acces",
    device: "Echipament (firewall, router sau unitate mesh)",
    title: "Titlu (opțional, implicit numele echipamentului)",
    kind: "Tipul echipamentului (pictogramă și imagine)",
    kind_auto: "Automat",
    admin_url: "Adresă de administrare (opțională, deschisă la clic pe imagine)",
    show_title: "Afișează titlul",
    show_subtitle: "Afișează subtitlul",
    show_image: "Afișează imaginea echipamentului",
    show_logo: "Afișează sigla mărcii",
    show_network: "Afișează rețeaua",
    show_history: "Afișează istoricul pe 24 h",
    show_speedtest: "Afișează ultimul test de viteză",
    show_system: "Afișează sistemul (CPU, RAM, temperaturi)",
    show_nodes: "Afișează rețeaua mesh și echipamentele de rețea",
    show_lan: "Afișează rețeaua locală (clienți, Wi-Fi)",
    entities: "Senzori la alegere",
    ent_rate_down: "Viteză de descărcare",
    ent_rate_up: "Viteză de încărcare",
    ent_wan: "Starea WAN",
    ent_ip: "Adresă IP WAN",
    ent_boot: "Timp de funcționare",
    ent_cpu: "Utilizare CPU",
    ent_ram: "Utilizare RAM",
    ent_clients: "Clienți conectați",
    ent_download: "Test de viteză: descărcare",
    ent_upload: "Test de viteză: încărcare",
    ent_ping: "Test de viteză: ping",
    zoom: "Buton de detalii",
    zoom_helper: "Buton din dreapta sus care afișează cardul complet în locul mini cardului, și înapoi",
    rate_unit: "Unitate de viteză",
    unit_bytes: "Octeți (kB/s, MB/s)",
    unit_bits: "Biți (kb/s, Mb/s)",
    language: "Limbă",
    lang_auto: "Automat",
    cpu_warning: "Avertizare CPU (%)",
    cpu_critical: "CPU critic (%)",
    ram_warning: "Avertizare RAM (%)",
    ram_critical: "RAM critic (%)",
    disk_warning: "Avertizare disc (% utilizat)",
    disk_critical: "Disc critic (% utilizat)",
    temp_warning: "Avertizare temperatură (°C)",
    temp_critical: "Temperatură critică (°C)",
  },
  da: {
    network: "Netværk",
    system: "System",
    mesh: "Mesh",
    network_devices: "Netværksenheder",
    lan: "Lokalt netværk",
    download: "Download",
    upload: "Upload",
    uptime: "Oppetid",
    firmware: "Firmware",
    wan: "WAN",
    online: "Online",
    offline: "Offline",
    unavailable: "Utilgængelig",
    unknown: "Ukendt",
    latency: "Latenstid og pakketab",
    loss: "tab",
    load: "Belastning",
    cpu: "CPU",
    ram: "RAM",
    disk: "Disk",
    temperature: "Temp.",
    rpm: "o/min",
    main: "hoved",
    clients: "Klienter",
    clients_n: "klienter",
    clients_n_one: "klient",
    wired: "Kablet",
    wireless: "Wi-Fi",
    guest: "Gæster",
    wifi: "Wi-Fi",
    on: "Til",
    off: "Fra",
    update_available: "Opdatering tilgængelig",
    restart: "Genstart enheden",
    restart_confirm: "Genstart enheden nu? Netværket og internetforbindelsen afbrydes i nogle minutter.",
    restart_btn: "Genstart",
    cancel: "Annuller",
    wifi_turn_on: "Slå Wi-Fi til",
    wifi_turn_off: "Slå Wi-Fi fra",
    wifi_off_confirm: "Slå dette Wi-Fi-netværk fra nu? Dets trådløse enheder mister forbindelsen; kablede enheder påvirkes ikke.",
    wifi_off_btn: "Slå fra",
    hours: "t",
    days: "d",
    minutes: "min",
    no_device: "Ingen firewall, router eller meshsystem fundet. Er en understøttet integration (Firewalla, OPNsense, pfSense, UniFi, TP-Link Deco, Omada, MikroTik, ASUS, NETGEAR, OpenWrt, GL.iNet, eero, Linksys Velop…) installeret?",
    unknown_device: "Enheden blev ikke fundet",
    zoom_in: "Vis hele kortet",
    zoom_out: "Tilbage til kompakt visning",
    speedtest: "Hastighedstest",
    admin: "Åbn administrationsgrænsefladen",
    kind_firewall: "Firewall",
    kind_router: "Router",
    kind_mesh: "Mesh-Wi-Fi",
    kind_ap: "Adgangspunkt",
    device: "Enhed (firewall, router eller mesh-enhed)",
    title: "Titel (valgfri, som standard enhedens navn)",
    kind: "Enhedstype (ikon og billede)",
    kind_auto: "Automatisk",
    admin_url: "Administrationsadresse (valgfri, åbnes ved klik på billedet)",
    show_title: "Vis titel",
    show_subtitle: "Vis undertitel",
    show_image: "Vis billede af enheden",
    show_logo: "Vis mærkets logo",
    show_network: "Vis netværk",
    show_history: "Vis historik for 24 t",
    show_speedtest: "Vis seneste hastighedstest",
    show_system: "Vis system (CPU, RAM, temperaturer)",
    show_nodes: "Vis mesh og netværksenheder",
    show_lan: "Vis lokalt netværk (klienter, Wi-Fi)",
    entities: "Sensorer efter eget valg",
    ent_rate_down: "Downloadhastighed",
    ent_rate_up: "Uploadhastighed",
    ent_wan: "WAN-status",
    ent_ip: "WAN-IP-adresse",
    ent_boot: "Oppetid",
    ent_cpu: "CPU-forbrug",
    ent_ram: "RAM-forbrug",
    ent_clients: "Tilsluttede klienter",
    ent_download: "Hastighedstest: download",
    ent_upload: "Hastighedstest: upload",
    ent_ping: "Hastighedstest: ping",
    zoom: "Detaljeknap",
    zoom_helper: "Knap øverst til højre, der viser hele kortet i stedet for minikortet, og tilbage",
    rate_unit: "Hastighedsenhed",
    unit_bytes: "Bytes (kB/s, MB/s)",
    unit_bits: "Bits (kb/s, Mb/s)",
    language: "Sprog",
    lang_auto: "Automatisk",
    cpu_warning: "CPU-advarsel (%)",
    cpu_critical: "CPU kritisk (%)",
    ram_warning: "RAM-advarsel (%)",
    ram_critical: "RAM kritisk (%)",
    disk_warning: "Disk-advarsel (% brugt)",
    disk_critical: "Disk kritisk (% brugt)",
    temp_warning: "Temperaturadvarsel (°C)",
    temp_critical: "Temperatur kritisk (°C)",
  },
  sv: {
    network: "Nätverk",
    system: "System",
    mesh: "Mesh",
    network_devices: "Nätverksenheter",
    lan: "Lokalt nätverk",
    download: "Nedladdning",
    upload: "Uppladdning",
    uptime: "Drifttid",
    firmware: "Firmware",
    wan: "WAN",
    online: "Online",
    offline: "Offline",
    unavailable: "Ej tillgänglig",
    unknown: "Okänd",
    latency: "Latens och paketförlust",
    loss: "förlust",
    load: "Belastning",
    cpu: "CPU",
    ram: "RAM",
    disk: "Disk",
    temperature: "Temp.",
    rpm: "v/min",
    main: "huvud",
    clients: "Klienter",
    clients_n: "klienter",
    clients_n_one: "klient",
    wired: "Trådbundet",
    wireless: "Wi-Fi",
    guest: "Gäster",
    wifi: "Wi-Fi",
    on: "På",
    off: "Av",
    update_available: "Uppdatering tillgänglig",
    restart: "Starta om enheten",
    restart_confirm: "Starta om enheten nu? Nätverket och internetanslutningen avbryts i några minuter.",
    restart_btn: "Starta om",
    cancel: "Avbryt",
    wifi_turn_on: "Slå på Wi-Fi",
    wifi_turn_off: "Stäng av Wi-Fi",
    wifi_off_confirm: "Stänga av det här Wi-Fi-nätverket nu? Dess trådlösa enheter förlorar anslutningen; trådbundna enheter påverkas inte.",
    wifi_off_btn: "Stäng av",
    hours: "h",
    days: "d",
    minutes: "min",
    no_device: "Ingen brandvägg, router eller meshsystem hittades. Är en integration som stöds (Firewalla, OPNsense, pfSense, UniFi, TP-Link Deco, Omada, MikroTik, ASUS, NETGEAR, OpenWrt, GL.iNet, eero, Linksys Velop…) installerad?",
    unknown_device: "Enheten hittades inte",
    zoom_in: "Visa hela kortet",
    zoom_out: "Tillbaka till kompakt vy",
    speedtest: "Hastighetstest",
    admin: "Öppna administrationsgränssnittet",
    kind_firewall: "Brandvägg",
    kind_router: "Router",
    kind_mesh: "Mesh-Wi-Fi",
    kind_ap: "Åtkomstpunkt",
    device: "Enhet (brandvägg, router eller mesh-enhet)",
    title: "Titel (valfri, som standard enhetens namn)",
    kind: "Typ av enhet (ikon och bild)",
    kind_auto: "Automatisk",
    admin_url: "Administrationsadress (valfri, öppnas vid klick på bilden)",
    show_title: "Visa titel",
    show_subtitle: "Visa undertitel",
    show_image: "Visa bild av enheten",
    show_logo: "Visa märkets logotyp",
    show_network: "Visa nätverk",
    show_history: "Visa historik för 24 h",
    show_speedtest: "Visa senaste hastighetstestet",
    show_system: "Visa system (CPU, RAM, temperaturer)",
    show_nodes: "Visa mesh och nätverksenheter",
    show_lan: "Visa lokalt nätverk (klienter, Wi-Fi)",
    entities: "Valfria sensorer",
    ent_rate_down: "Nedladdningshastighet",
    ent_rate_up: "Uppladdningshastighet",
    ent_wan: "WAN-status",
    ent_ip: "WAN-IP-adress",
    ent_boot: "Drifttid",
    ent_cpu: "CPU-användning",
    ent_ram: "RAM-användning",
    ent_clients: "Anslutna klienter",
    ent_download: "Hastighetstest: nedladdning",
    ent_upload: "Hastighetstest: uppladdning",
    ent_ping: "Hastighetstest: ping",
    zoom: "Detaljknapp",
    zoom_helper: "Knapp uppe till höger som visar hela kortet i stället för minikortet, och tillbaka",
    rate_unit: "Hastighetsenhet",
    unit_bytes: "Byte (kB/s, MB/s)",
    unit_bits: "Bitar (kb/s, Mb/s)",
    language: "Språk",
    lang_auto: "Automatiskt",
    cpu_warning: "CPU-varning (%)",
    cpu_critical: "CPU kritisk (%)",
    ram_warning: "RAM-varning (%)",
    ram_critical: "RAM kritisk (%)",
    disk_warning: "Diskvarning (% använt)",
    disk_critical: "Disk kritisk (% använt)",
    temp_warning: "Temperaturvarning (°C)",
    temp_critical: "Temperatur kritisk (°C)",
  },
  bg: {
    network: "Мрежа",
    system: "Система",
    mesh: "Mesh мрежа",
    network_devices: "Мрежови устройства",
    lan: "Локална мрежа",
    download: "Изтегляне",
    upload: "Качване",
    uptime: "Работи от",
    firmware: "Фърмуер",
    wan: "WAN",
    online: "Онлайн",
    offline: "Офлайн",
    unavailable: "Недостъпно",
    unknown: "Неизвестно",
    latency: "Закъснение и загуба на пакети",
    loss: "загуба",
    load: "Натоварване",
    cpu: "CPU",
    ram: "RAM",
    disk: "Диск",
    temperature: "Темп.",
    rpm: "об/мин",
    main: "основен",
    clients: "Клиенти",
    clients_n: "клиента",
    clients_n_one: "клиент",
    wired: "Кабелни",
    wireless: "Wi-Fi",
    guest: "Гости",
    wifi: "Wi-Fi",
    on: "Вкл.",
    off: "Изкл.",
    update_available: "Налична актуализация",
    restart: "Рестартирай устройството",
    restart_confirm: "Да се рестартира ли устройството сега? Мрежата и интернет връзката ще бъдат прекъснати за няколко минути.",
    restart_btn: "Рестартирай",
    cancel: "Отказ",
    wifi_turn_on: "Включи Wi-Fi",
    wifi_turn_off: "Изключи Wi-Fi",
    wifi_off_confirm: "Да се изключи ли тази Wi-Fi мрежа сега? Безжичните ѝ устройства ще загубят връзката си; кабелните устройства не са засегнати.",
    wifi_off_btn: "Изключи",
    hours: "ч",
    days: "д",
    minutes: "мин",
    no_device: "Не е намерена защитна стена, рутер или mesh система. Инсталирана ли е поддържана интеграция (Firewalla, OPNsense, pfSense, UniFi, TP-Link Deco, Omada, MikroTik, ASUS, NETGEAR, OpenWrt, GL.iNet, eero, Linksys Velop…)?",
    unknown_device: "Устройството не е намерено",
    zoom_in: "Покажи цялата карта",
    zoom_out: "Обратно към компактния изглед",
    speedtest: "Тест на скоростта",
    admin: "Отвори административния интерфейс",
    kind_firewall: "Защитна стена",
    kind_router: "Рутер",
    kind_mesh: "Mesh Wi-Fi",
    kind_ap: "Точка за достъп",
    device: "Устройство (защитна стена, рутер или mesh модул)",
    title: "Заглавие (по избор, по подразбиране името на устройството)",
    kind: "Вид устройство (икона и изображение)",
    kind_auto: "Автоматично",
    admin_url: "Административен адрес (по избор, отваря се при щракване върху изображението)",
    show_title: "Покажи заглавието",
    show_subtitle: "Покажи подзаглавието",
    show_image: "Покажи изображението на устройството",
    show_logo: "Покажи логото на марката",
    show_network: "Покажи мрежата",
    show_history: "Покажи историята за 24 ч",
    show_speedtest: "Покажи последния тест на скоростта",
    show_system: "Покажи системата (CPU, RAM, температури)",
    show_nodes: "Покажи mesh мрежата и мрежовите устройства",
    show_lan: "Покажи локалната мрежа (клиенти, Wi-Fi)",
    entities: "Сензори по избор",
    ent_rate_down: "Скорост на изтегляне",
    ent_rate_up: "Скорост на качване",
    ent_wan: "Състояние на WAN",
    ent_ip: "WAN IP адрес",
    ent_boot: "Време на работа",
    ent_cpu: "Натоварване на CPU",
    ent_ram: "Използване на RAM",
    ent_clients: "Свързани клиенти",
    ent_download: "Тест на скоростта: изтегляне",
    ent_upload: "Тест на скоростта: качване",
    ent_ping: "Тест на скоростта: пинг",
    zoom: "Бутон за подробности",
    zoom_helper: "Бутон горе вдясно, който показва цялата карта вместо мини картата, и обратно",
    rate_unit: "Единица за скорост",
    unit_bytes: "Байтове (kB/s, MB/s)",
    unit_bits: "Битове (kb/s, Mb/s)",
    language: "Език",
    lang_auto: "Автоматично",
    cpu_warning: "Предупреждение за CPU (%)",
    cpu_critical: "Критично за CPU (%)",
    ram_warning: "Предупреждение за RAM (%)",
    ram_critical: "Критично за RAM (%)",
    disk_warning: "Предупреждение за диск (% заето)",
    disk_critical: "Критично за диск (% заето)",
    temp_warning: "Предупреждение за температура (°C)",
    temp_critical: "Критична температура (°C)",
  },
  ru: {
    network: "Сеть",
    system: "Система",
    mesh: "Mesh-сеть",
    network_devices: "Сетевые устройства",
    lan: "Локальная сеть",
    download: "Загрузка",
    upload: "Отдача",
    uptime: "Работает",
    firmware: "Прошивка",
    wan: "WAN",
    online: "В сети",
    offline: "Не в сети",
    unavailable: "Недоступно",
    unknown: "Неизвестно",
    latency: "Задержка и потеря пакетов",
    loss: "потерь",
    load: "Нагрузка",
    cpu: "ЦП",
    ram: "ОЗУ",
    disk: "Диск",
    temperature: "Темп.",
    rpm: "об/мин",
    main: "основной",
    clients: "Клиенты",
    clients_n: "клиента",
    clients_n_one: "клиент",
    clients_n_few: "клиента",
    clients_n_many: "клиентов",
    wired: "Проводные",
    wireless: "Wi-Fi",
    guest: "Гости",
    wifi: "Wi-Fi",
    on: "Вкл.",
    off: "Выкл.",
    update_available: "Доступно обновление",
    restart: "Перезагрузить устройство",
    restart_confirm: "Перезагрузить устройство сейчас? Сеть и подключение к интернету будут прерваны на несколько минут.",
    restart_btn: "Перезагрузить",
    cancel: "Отмена",
    wifi_turn_on: "Включить Wi-Fi",
    wifi_turn_off: "Выключить Wi-Fi",
    wifi_off_confirm: "Выключить эту сеть Wi-Fi сейчас? Её беспроводные устройства потеряют соединение; проводные устройства не затронуты.",
    wifi_off_btn: "Выключить",
    hours: "ч",
    days: "д",
    minutes: "мин",
    no_device: "Не найдено ни межсетевого экрана, ни маршрутизатора, ни mesh-системы. Установлена ли поддерживаемая интеграция (Firewalla, OPNsense, pfSense, UniFi, TP-Link Deco, Omada, MikroTik, ASUS, NETGEAR, OpenWrt, GL.iNet, eero, Linksys Velop…)?",
    unknown_device: "Устройство не найдено",
    zoom_in: "Показать полную карточку",
    zoom_out: "Вернуться к компактному виду",
    speedtest: "Тест скорости",
    admin: "Открыть интерфейс администрирования",
    kind_firewall: "Межсетевой экран",
    kind_router: "Маршрутизатор",
    kind_mesh: "Mesh Wi-Fi",
    kind_ap: "Точка доступа",
    device: "Устройство (межсетевой экран, маршрутизатор или mesh-модуль)",
    title: "Заголовок (необязательно, по умолчанию имя устройства)",
    kind: "Тип устройства (значок и изображение)",
    kind_auto: "Автоматически",
    admin_url: "Адрес администрирования (необязательно, открывается по нажатию на изображение)",
    show_title: "Показывать заголовок",
    show_subtitle: "Показывать подзаголовок",
    show_image: "Показывать изображение устройства",
    show_logo: "Показывать логотип марки",
    show_network: "Показывать сеть",
    show_history: "Показывать историю за 24 ч",
    show_speedtest: "Показывать последний тест скорости",
    show_system: "Показывать систему (ЦП, ОЗУ, температуры)",
    show_nodes: "Показывать mesh-сеть и сетевые устройства",
    show_lan: "Показывать локальную сеть (клиенты, Wi-Fi)",
    entities: "Датчики на выбор",
    ent_rate_down: "Скорость загрузки",
    ent_rate_up: "Скорость отдачи",
    ent_wan: "Состояние WAN",
    ent_ip: "IP-адрес WAN",
    ent_boot: "Время работы",
    ent_cpu: "Загрузка ЦП",
    ent_ram: "Использование ОЗУ",
    ent_clients: "Подключённые клиенты",
    ent_download: "Тест скорости: загрузка",
    ent_upload: "Тест скорости: отдача",
    ent_ping: "Тест скорости: пинг",
    zoom: "Кнопка подробностей",
    zoom_helper: "Кнопка вверху справа, которая показывает полную карточку вместо мини-карточки, и обратно",
    rate_unit: "Единица скорости",
    unit_bytes: "Байты (kB/s, MB/s)",
    unit_bits: "Биты (kb/s, Mb/s)",
    language: "Язык",
    lang_auto: "Автоматически",
    cpu_warning: "Предупреждение ЦП (%)",
    cpu_critical: "Критично для ЦП (%)",
    ram_warning: "Предупреждение ОЗУ (%)",
    ram_critical: "Критично для ОЗУ (%)",
    disk_warning: "Предупреждение диска (% занято)",
    disk_critical: "Критично для диска (% занято)",
    temp_warning: "Предупреждение температуры (°C)",
    temp_critical: "Критическая температура (°C)",
  },
  uk: {
    network: "Мережа",
    system: "Система",
    mesh: "Mesh-мережа",
    network_devices: "Мережеві пристрої",
    lan: "Локальна мережа",
    download: "Завантаження",
    upload: "Вивантаження",
    uptime: "Працює",
    firmware: "Прошивка",
    wan: "WAN",
    online: "У мережі",
    offline: "Поза мережею",
    unavailable: "Недоступно",
    unknown: "Невідомо",
    latency: "Затримка і втрата пакетів",
    loss: "втрат",
    load: "Навантаження",
    cpu: "ЦП",
    ram: "ОЗП",
    disk: "Диск",
    temperature: "Темп.",
    rpm: "об/хв",
    main: "основний",
    clients: "Клієнти",
    clients_n: "клієнта",
    clients_n_one: "клієнт",
    clients_n_few: "клієнти",
    clients_n_many: "клієнтів",
    wired: "Дротові",
    wireless: "Wi-Fi",
    guest: "Гості",
    wifi: "Wi-Fi",
    on: "Увімк.",
    off: "Вимк.",
    update_available: "Доступне оновлення",
    restart: "Перезапустити пристрій",
    restart_confirm: "Перезапустити пристрій зараз? Мережу та підключення до інтернету буде перервано на кілька хвилин.",
    restart_btn: "Перезапустити",
    cancel: "Скасувати",
    wifi_turn_on: "Увімкнути Wi-Fi",
    wifi_turn_off: "Вимкнути Wi-Fi",
    wifi_off_confirm: "Вимкнути цю мережу Wi-Fi зараз? Її бездротові пристрої втратять з'єднання; дротові пристрої не зачеплено.",
    wifi_off_btn: "Вимкнути",
    hours: "год",
    days: "д",
    minutes: "хв",
    no_device: "Не знайдено ні брандмауера, ні маршрутизатора, ні mesh-системи. Чи встановлено підтримувану інтеграцію (Firewalla, OPNsense, pfSense, UniFi, TP-Link Deco, Omada, MikroTik, ASUS, NETGEAR, OpenWrt, GL.iNet, eero, Linksys Velop…)?",
    unknown_device: "Пристрій не знайдено",
    zoom_in: "Показати повну картку",
    zoom_out: "Повернутися до компактного вигляду",
    speedtest: "Тест швидкості",
    admin: "Відкрити інтерфейс адміністрування",
    kind_firewall: "Брандмауер",
    kind_router: "Маршрутизатор",
    kind_mesh: "Mesh Wi-Fi",
    kind_ap: "Точка доступу",
    device: "Пристрій (брандмауер, маршрутизатор або mesh-модуль)",
    title: "Заголовок (необов'язково, типово назва пристрою)",
    kind: "Тип пристрою (значок і зображення)",
    kind_auto: "Автоматично",
    admin_url: "Адреса адміністрування (необов'язково, відкривається натисканням на зображення)",
    show_title: "Показувати заголовок",
    show_subtitle: "Показувати підзаголовок",
    show_image: "Показувати зображення пристрою",
    show_logo: "Показувати логотип марки",
    show_network: "Показувати мережу",
    show_history: "Показувати історію за 24 год",
    show_speedtest: "Показувати останній тест швидкості",
    show_system: "Показувати систему (ЦП, ОЗП, температури)",
    show_nodes: "Показувати mesh-мережу і мережеві пристрої",
    show_lan: "Показувати локальну мережу (клієнти, Wi-Fi)",
    entities: "Датчики на вибір",
    ent_rate_down: "Швидкість завантаження",
    ent_rate_up: "Швидкість вивантаження",
    ent_wan: "Стан WAN",
    ent_ip: "IP-адреса WAN",
    ent_boot: "Час роботи",
    ent_cpu: "Навантаження ЦП",
    ent_ram: "Використання ОЗП",
    ent_clients: "Підключені клієнти",
    ent_download: "Тест швидкості: завантаження",
    ent_upload: "Тест швидкості: вивантаження",
    ent_ping: "Тест швидкості: пінг",
    zoom: "Кнопка подробиць",
    zoom_helper: "Кнопка вгорі праворуч, яка показує повну картку замість міні-картки, і назад",
    rate_unit: "Одиниця швидкості",
    unit_bytes: "Байти (kB/s, MB/s)",
    unit_bits: "Біти (kb/s, Mb/s)",
    language: "Мова",
    lang_auto: "Автоматично",
    cpu_warning: "Попередження ЦП (%)",
    cpu_critical: "Критично для ЦП (%)",
    ram_warning: "Попередження ОЗП (%)",
    ram_critical: "Критично для ОЗП (%)",
    disk_warning: "Попередження диска (% зайнято)",
    disk_critical: "Критично для диска (% зайнято)",
    temp_warning: "Попередження температури (°C)",
    temp_critical: "Критична температура (°C)",
  },
  hu: {
    network: "Hálózat",
    system: "Rendszer",
    mesh: "Mesh",
    network_devices: "Hálózati eszközök",
    lan: "Helyi hálózat",
    download: "Letöltés",
    upload: "Feltöltés",
    uptime: "Üzemidő",
    firmware: "Firmware",
    wan: "WAN",
    online: "Online",
    offline: "Offline",
    unavailable: "Nem elérhető",
    unknown: "Ismeretlen",
    latency: "Késleltetés és csomagvesztés",
    loss: "vesztés",
    load: "Terhelés",
    cpu: "CPU",
    ram: "RAM",
    disk: "Lemez",
    temperature: "Hőm.",
    rpm: "ford./perc",
    main: "fő",
    clients: "Kliensek",
    clients_n: "kliens",
    wired: "Vezetékes",
    wireless: "Wi-Fi",
    guest: "Vendég",
    wifi: "Wi-Fi",
    on: "Be",
    off: "Ki",
    update_available: "Frissítés érhető el",
    restart: "Eszköz újraindítása",
    restart_confirm: "Újraindítja most az eszközt? A hálózat és az internetkapcsolat néhány percre megszakad.",
    restart_btn: "Újraindítás",
    cancel: "Mégse",
    wifi_turn_on: "Wi-Fi bekapcsolása",
    wifi_turn_off: "Wi-Fi kikapcsolása",
    wifi_off_confirm: "Kikapcsolja most ezt a Wi-Fi-hálózatot? A vezeték nélküli eszközei elveszítik a kapcsolatot; a vezetékes eszközöket ez nem érinti.",
    wifi_off_btn: "Kikapcsolás",
    hours: "ó",
    days: "n",
    minutes: "perc",
    no_device: "Nem található tűzfal, router vagy mesh rendszer. Telepítve van egy támogatott integráció (Firewalla, OPNsense, pfSense, UniFi, TP-Link Deco, Omada, MikroTik, ASUS, NETGEAR, OpenWrt, GL.iNet, eero, Linksys Velop…)?",
    unknown_device: "Az eszköz nem található",
    zoom_in: "Teljes kártya megjelenítése",
    zoom_out: "Vissza a kompakt nézethez",
    speedtest: "Sebességmérés",
    admin: "Felügyeleti felület megnyitása",
    kind_firewall: "Tűzfal",
    kind_router: "Router",
    kind_mesh: "Mesh Wi-Fi",
    kind_ap: "Hozzáférési pont",
    device: "Eszköz (tűzfal, router vagy mesh egység)",
    title: "Cím (nem kötelező, alapértelmezés szerint az eszköz neve)",
    kind: "Eszköz típusa (ikon és kép)",
    kind_auto: "Automatikus",
    admin_url: "Felügyeleti cím (nem kötelező, a képre kattintva nyílik meg)",
    show_title: "Cím megjelenítése",
    show_subtitle: "Alcím megjelenítése",
    show_image: "Eszközkép megjelenítése",
    show_logo: "Márkalogó megjelenítése",
    show_network: "Hálózat megjelenítése",
    show_history: "24 órás előzmények megjelenítése",
    show_speedtest: "Utolsó sebességmérés megjelenítése",
    show_system: "Rendszer megjelenítése (CPU, RAM, hőmérsékletek)",
    show_nodes: "Mesh és hálózati eszközök megjelenítése",
    show_lan: "Helyi hálózat megjelenítése (kliensek, Wi-Fi)",
    entities: "Választott érzékelők",
    ent_rate_down: "Letöltési sebesség",
    ent_rate_up: "Feltöltési sebesség",
    ent_wan: "WAN állapota",
    ent_ip: "WAN IP-cím",
    ent_boot: "Üzemidő",
    ent_cpu: "CPU-használat",
    ent_ram: "RAM-használat",
    ent_clients: "Csatlakozott kliensek",
    ent_download: "Sebességmérés: letöltés",
    ent_upload: "Sebességmérés: feltöltés",
    ent_ping: "Sebességmérés: ping",
    zoom: "Részletek gomb",
    zoom_helper: "Jobb felső gomb, amely a mini kártya helyett a teljes kártyát mutatja, és vissza",
    rate_unit: "Sebesség mértékegysége",
    unit_bytes: "Bájt (kB/s, MB/s)",
    unit_bits: "Bit (kb/s, Mb/s)",
    language: "Nyelv",
    lang_auto: "Automatikus",
    cpu_warning: "CPU figyelmeztetés (%)",
    cpu_critical: "CPU kritikus (%)",
    ram_warning: "RAM figyelmeztetés (%)",
    ram_critical: "RAM kritikus (%)",
    disk_warning: "Lemez figyelmeztetés (% foglalt)",
    disk_critical: "Lemez kritikus (% foglalt)",
    temp_warning: "Hőmérséklet figyelmeztetés (°C)",
    temp_critical: "Hőmérséklet kritikus (°C)",
  },
  sk: {
    network: "Sieť",
    system: "Systém",
    mesh: "Mesh",
    network_devices: "Sieťové zariadenia",
    lan: "Lokálna sieť",
    download: "Sťahovanie",
    upload: "Odosielanie",
    uptime: "Beží",
    firmware: "Firmvér",
    wan: "WAN",
    online: "Online",
    offline: "Offline",
    unavailable: "Nedostupné",
    unknown: "Neznáme",
    latency: "Odozva a strata paketov",
    loss: "strata",
    load: "Zaťaženie",
    cpu: "CPU",
    ram: "RAM",
    disk: "Disk",
    temperature: "Tepl.",
    rpm: "ot./min",
    main: "hlavný",
    clients: "Klienti",
    clients_n: "klientov",
    clients_n_one: "klient",
    clients_n_few: "klienti",
    clients_n_many: "klienta",
    wired: "Káblové",
    wireless: "Wi-Fi",
    guest: "Hostia",
    wifi: "Wi-Fi",
    on: "Zapnuté",
    off: "Vypnuté",
    update_available: "Dostupná aktualizácia",
    restart: "Reštartovať zariadenie",
    restart_confirm: "Reštartovať zariadenie teraz? Sieť a pripojenie na internet sa na niekoľko minút prerušia.",
    restart_btn: "Reštartovať",
    cancel: "Zrušiť",
    wifi_turn_on: "Zapnúť Wi-Fi",
    wifi_turn_off: "Vypnúť Wi-Fi",
    wifi_off_confirm: "Vypnúť teraz túto sieť Wi-Fi? Jej bezdrôtové zariadenia stratia pripojenie; káblových zariadení sa to netýka.",
    wifi_off_btn: "Vypnúť",
    hours: "h",
    days: "d",
    minutes: "min",
    no_device: "Nenašiel sa žiadny firewall, smerovač ani mesh systém. Je nainštalovaná podporovaná integrácia (Firewalla, OPNsense, pfSense, UniFi, TP-Link Deco, Omada, MikroTik, ASUS, NETGEAR, OpenWrt, GL.iNet, eero, Linksys Velop…)?",
    unknown_device: "Zariadenie sa nenašlo",
    zoom_in: "Zobraziť celú kartu",
    zoom_out: "Späť na kompaktné zobrazenie",
    speedtest: "Test rýchlosti",
    admin: "Otvoriť administračné rozhranie",
    kind_firewall: "Firewall",
    kind_router: "Smerovač",
    kind_mesh: "Mesh Wi-Fi",
    kind_ap: "Prístupový bod",
    device: "Zariadenie (firewall, smerovač alebo mesh jednotka)",
    title: "Názov (voliteľný, predvolene názov zariadenia)",
    kind: "Druh zariadenia (ikona a obrázok)",
    kind_auto: "Automaticky",
    admin_url: "Administračná adresa (voliteľná, otvorí sa po kliknutí na obrázok)",
    show_title: "Zobraziť názov",
    show_subtitle: "Zobraziť podnadpis",
    show_image: "Zobraziť obrázok zariadenia",
    show_logo: "Zobraziť logo značky",
    show_network: "Zobraziť sieť",
    show_history: "Zobraziť históriu za 24 h",
    show_speedtest: "Zobraziť posledný test rýchlosti",
    show_system: "Zobraziť systém (CPU, RAM, teploty)",
    show_nodes: "Zobraziť mesh a sieťové zariadenia",
    show_lan: "Zobraziť lokálnu sieť (klienti, Wi-Fi)",
    entities: "Senzory podľa vlastného výberu",
    ent_rate_down: "Rýchlosť sťahovania",
    ent_rate_up: "Rýchlosť odosielania",
    ent_wan: "Stav WAN",
    ent_ip: "IP adresa WAN",
    ent_boot: "Doba prevádzky",
    ent_cpu: "Využitie CPU",
    ent_ram: "Využitie RAM",
    ent_clients: "Pripojení klienti",
    ent_download: "Test rýchlosti: sťahovanie",
    ent_upload: "Test rýchlosti: odosielanie",
    ent_ping: "Test rýchlosti: ping",
    zoom: "Tlačidlo podrobností",
    zoom_helper: "Tlačidlo vpravo hore, ktoré namiesto mini karty zobrazí celú kartu, a späť",
    rate_unit: "Jednotka rýchlosti",
    unit_bytes: "Bajty (kB/s, MB/s)",
    unit_bits: "Bity (kb/s, Mb/s)",
    language: "Jazyk",
    lang_auto: "Automaticky",
    cpu_warning: "Upozornenie CPU (%)",
    cpu_critical: "CPU kritické (%)",
    ram_warning: "Upozornenie RAM (%)",
    ram_critical: "RAM kritické (%)",
    disk_warning: "Upozornenie disku (% obsadené)",
    disk_critical: "Disk kritický (% obsadené)",
    temp_warning: "Upozornenie teploty (°C)",
    temp_critical: "Teplota kritická (°C)",
  },
  cs: {
    network: "Síť",
    system: "Systém",
    mesh: "Mesh",
    network_devices: "Síťová zařízení",
    lan: "Místní síť",
    download: "Stahování",
    upload: "Odesílání",
    uptime: "Běží",
    firmware: "Firmware",
    wan: "WAN",
    online: "Online",
    offline: "Offline",
    unavailable: "Nedostupné",
    unknown: "Neznámé",
    latency: "Odezva a ztráta paketů",
    loss: "ztráta",
    load: "Zátěž",
    cpu: "CPU",
    ram: "RAM",
    disk: "Disk",
    temperature: "Tepl.",
    rpm: "ot./min",
    main: "hlavní",
    clients: "Klienti",
    clients_n: "klientů",
    clients_n_one: "klient",
    clients_n_few: "klienti",
    clients_n_many: "klienta",
    wired: "Kabelem",
    wireless: "Wi-Fi",
    guest: "Hosté",
    wifi: "Wi-Fi",
    on: "Zapnuto",
    off: "Vypnuto",
    update_available: "K dispozici aktualizace",
    restart: "Restartovat zařízení",
    restart_confirm: "Restartovat zařízení nyní? Síť a připojení k internetu se na několik minut přeruší.",
    restart_btn: "Restartovat",
    cancel: "Zrušit",
    wifi_turn_on: "Zapnout Wi-Fi",
    wifi_turn_off: "Vypnout Wi-Fi",
    wifi_off_confirm: "Vypnout nyní tuto síť Wi-Fi? Její bezdrátová zařízení ztratí připojení; zařízení připojených kabelem se to netýká.",
    wifi_off_btn: "Vypnout",
    hours: "h",
    days: "d",
    minutes: "min",
    no_device: "Nebyl nalezen žádný firewall, směrovač ani mesh systém. Je nainstalována podporovaná integrace (Firewalla, OPNsense, pfSense, UniFi, TP-Link Deco, Omada, MikroTik, ASUS, NETGEAR, OpenWrt, GL.iNet, eero, Linksys Velop…)?",
    unknown_device: "Zařízení nenalezeno",
    zoom_in: "Zobrazit celou kartu",
    zoom_out: "Zpět na kompaktní zobrazení",
    speedtest: "Test rychlosti",
    admin: "Otevřít administrační rozhraní",
    kind_firewall: "Firewall",
    kind_router: "Směrovač",
    kind_mesh: "Mesh Wi-Fi",
    kind_ap: "Přístupový bod",
    device: "Zařízení (firewall, směrovač nebo mesh jednotka)",
    title: "Název (volitelný, výchozí je název zařízení)",
    kind: "Druh zařízení (ikona a obrázek)",
    kind_auto: "Automaticky",
    admin_url: "Administrační adresa (volitelná, otevře se po kliknutí na obrázek)",
    show_title: "Zobrazit název",
    show_subtitle: "Zobrazit podnadpis",
    show_image: "Zobrazit obrázek zařízení",
    show_logo: "Zobrazit logo značky",
    show_network: "Zobrazit síť",
    show_history: "Zobrazit historii za 24 h",
    show_speedtest: "Zobrazit poslední test rychlosti",
    show_system: "Zobrazit systém (CPU, RAM, teploty)",
    show_nodes: "Zobrazit mesh a síťová zařízení",
    show_lan: "Zobrazit místní síť (klienti, Wi-Fi)",
    entities: "Senzory podle vlastního výběru",
    ent_rate_down: "Rychlost stahování",
    ent_rate_up: "Rychlost odesílání",
    ent_wan: "Stav WAN",
    ent_ip: "IP adresa WAN",
    ent_boot: "Doba provozu",
    ent_cpu: "Využití CPU",
    ent_ram: "Využití RAM",
    ent_clients: "Připojení klienti",
    ent_download: "Test rychlosti: stahování",
    ent_upload: "Test rychlosti: odesílání",
    ent_ping: "Test rychlosti: ping",
    zoom: "Tlačítko podrobností",
    zoom_helper: "Tlačítko vpravo nahoře, které místo mini karty zobrazí celou kartu, a zpět",
    rate_unit: "Jednotka rychlosti",
    unit_bytes: "Bajty (kB/s, MB/s)",
    unit_bits: "Bity (kb/s, Mb/s)",
    language: "Jazyk",
    lang_auto: "Automaticky",
    cpu_warning: "Varování CPU (%)",
    cpu_critical: "CPU kritické (%)",
    ram_warning: "Varování RAM (%)",
    ram_critical: "RAM kritické (%)",
    disk_warning: "Varování disku (% obsazeno)",
    disk_critical: "Disk kritický (% obsazeno)",
    temp_warning: "Varování teploty (°C)",
    temp_critical: "Teplota kritická (°C)",
  },
  sl: {
    network: "Omrežje",
    system: "Sistem",
    mesh: "Mesh",
    network_devices: "Omrežne naprave",
    lan: "Lokalno omrežje",
    download: "Prenos",
    upload: "Nalaganje",
    uptime: "Deluje",
    firmware: "Vdelana programska oprema",
    wan: "WAN",
    online: "Povezano",
    offline: "Nepovezano",
    unavailable: "Ni na voljo",
    unknown: "Neznano",
    latency: "Zakasnitev in izguba paketov",
    loss: "izgube",
    load: "Obremenitev",
    cpu: "CPE",
    ram: "RAM",
    disk: "Disk",
    temperature: "Temp.",
    rpm: "vrt./min",
    main: "glavna",
    clients: "Odjemalci",
    clients_n: "odjemalcev",
    clients_n_one: "odjemalec",
    clients_n_two: "odjemalca",
    clients_n_few: "odjemalci",
    wired: "Žično",
    wireless: "Wi-Fi",
    guest: "Gostje",
    wifi: "Wi-Fi",
    on: "Vklopljeno",
    off: "Izklopljeno",
    update_available: "Na voljo je posodobitev",
    restart: "Znova zaženi napravo",
    restart_confirm: "Želite napravo zdaj znova zagnati? Omrežje in internetna povezava bosta za nekaj minut prekinjena.",
    restart_btn: "Znova zaženi",
    cancel: "Prekliči",
    wifi_turn_on: "Vklopi Wi-Fi",
    wifi_turn_off: "Izklopi Wi-Fi",
    wifi_off_confirm: "Želite to omrežje Wi-Fi zdaj izklopiti? Njegove brezžične naprave bodo izgubile povezavo; žične naprave niso prizadete.",
    wifi_off_btn: "Izklopi",
    hours: "h",
    days: "d",
    minutes: "min",
    no_device: "Ni bilo najdenega požarnega zidu, usmerjevalnika ali sistema mesh. Ali je nameščena podprta integracija (Firewalla, OPNsense, pfSense, UniFi, TP-Link Deco, Omada, MikroTik, ASUS, NETGEAR, OpenWrt, GL.iNet, eero, Linksys Velop…)?",
    unknown_device: "Naprave ni mogoče najti",
    zoom_in: "Prikaži celotno kartico",
    zoom_out: "Nazaj na strnjeni pogled",
    speedtest: "Test hitrosti",
    admin: "Odpri skrbniški vmesnik",
    kind_firewall: "Požarni zid",
    kind_router: "Usmerjevalnik",
    kind_mesh: "Wi-Fi mesh",
    kind_ap: "Dostopna točka",
    device: "Naprava (požarni zid, usmerjevalnik ali enota mesh)",
    title: "Naslov (neobvezno, privzeto ime naprave)",
    kind: "Vrsta naprave (ikona in slika)",
    kind_auto: "Samodejno",
    admin_url: "Skrbniški naslov (neobvezno, odpre se ob kliku na sliko)",
    show_title: "Prikaži naslov",
    show_subtitle: "Prikaži podnaslov",
    show_image: "Prikaži sliko naprave",
    show_logo: "Prikaži logotip znamke",
    show_network: "Prikaži omrežje",
    show_history: "Prikaži 24-urno zgodovino",
    show_speedtest: "Prikaži zadnji test hitrosti",
    show_system: "Prikaži sistem (CPE, RAM, temperature)",
    show_nodes: "Prikaži mesh in omrežne naprave",
    show_lan: "Prikaži lokalno omrežje (odjemalci, Wi-Fi)",
    entities: "Senzorji po izbiri",
    ent_rate_down: "Hitrost prenosa",
    ent_rate_up: "Hitrost nalaganja",
    ent_wan: "Stanje WAN",
    ent_ip: "Naslov IP WAN",
    ent_boot: "Čas delovanja",
    ent_cpu: "Obremenitev CPE",
    ent_ram: "Poraba RAM",
    ent_clients: "Povezani odjemalci",
    ent_download: "Test hitrosti: prenos",
    ent_upload: "Test hitrosti: nalaganje",
    ent_ping: "Test hitrosti: ping",
    zoom: "Gumb za podrobnosti",
    zoom_helper: "Gumb zgoraj desno, ki namesto mini kartice prikaže celotno kartico, in nazaj",
    rate_unit: "Enota hitrosti",
    unit_bytes: "Bajti (kB/s, MB/s)",
    unit_bits: "Biti (kb/s, Mb/s)",
    language: "Jezik",
    lang_auto: "Samodejno",
    cpu_warning: "Opozorilo CPE (%)",
    cpu_critical: "CPE kritično (%)",
    ram_warning: "Opozorilo RAM (%)",
    ram_critical: "RAM kritično (%)",
    disk_warning: "Opozorilo diska (% zasedeno)",
    disk_critical: "Disk kritično (% zasedeno)",
    temp_warning: "Opozorilo temperature (°C)",
    temp_critical: "Kritična temperatura (°C)",
  },
  lv: {
    network: "Tīkls",
    system: "Sistēma",
    mesh: "Mesh",
    network_devices: "Tīkla ierīces",
    lan: "Lokālais tīkls",
    download: "Lejupielāde",
    upload: "Augšupielāde",
    uptime: "Darbojas",
    firmware: "Aparātprogrammatūra",
    wan: "WAN",
    online: "Tiešsaistē",
    offline: "Bezsaistē",
    unavailable: "Nav pieejams",
    unknown: "Nezināms",
    latency: "Aizture un pakešu zudums",
    loss: "zudums",
    load: "Noslodze",
    cpu: "CPU",
    ram: "RAM",
    disk: "Disks",
    temperature: "Temp.",
    rpm: "apgr./min",
    main: "galvenā",
    clients: "Klienti",
    clients_n: "klienti",
    clients_n_one: "klients",
    clients_n_zero: "klientu",
    wired: "Vadu",
    wireless: "Wi-Fi",
    guest: "Viesi",
    wifi: "Wi-Fi",
    on: "Ieslēgts",
    off: "Izslēgts",
    update_available: "Pieejams atjauninājums",
    restart: "Restartēt ierīci",
    restart_confirm: "Restartēt ierīci tagad? Tīkls un interneta savienojums tiks pārtraukts uz dažām minūtēm.",
    restart_btn: "Restartēt",
    cancel: "Atcelt",
    wifi_turn_on: "Ieslēgt Wi-Fi",
    wifi_turn_off: "Izslēgt Wi-Fi",
    wifi_off_confirm: "Izslēgt šo Wi-Fi tīklu tagad? Tā bezvadu ierīces zaudēs savienojumu; vadu ierīces netiek ietekmētas.",
    wifi_off_btn: "Izslēgt",
    hours: "st.",
    days: "d.",
    minutes: "min",
    no_device: "Nav atrasts neviens ugunsmūris, maršrutētājs vai mesh sistēma. Vai ir instalēta atbalstīta integrācija (Firewalla, OPNsense, pfSense, UniFi, TP-Link Deco, Omada, MikroTik, ASUS, NETGEAR, OpenWrt, GL.iNet, eero, Linksys Velop…)?",
    unknown_device: "Ierīce nav atrasta",
    zoom_in: "Rādīt pilno karti",
    zoom_out: "Atpakaļ uz kompakto skatu",
    speedtest: "Ātruma tests",
    admin: "Atvērt administrēšanas saskarni",
    kind_firewall: "Ugunsmūris",
    kind_router: "Maršrutētājs",
    kind_mesh: "Mesh Wi-Fi",
    kind_ap: "Piekļuves punkts",
    device: "Ierīce (ugunsmūris, maršrutētājs vai mesh vienība)",
    title: "Virsraksts (neobligāts, pēc noklusējuma ierīces nosaukums)",
    kind: "Ierīces veids (ikona un attēls)",
    kind_auto: "Automātiski",
    admin_url: "Administrēšanas adrese (neobligāta, atveras, noklikšķinot uz attēla)",
    show_title: "Rādīt virsrakstu",
    show_subtitle: "Rādīt apakšvirsrakstu",
    show_image: "Rādīt ierīces attēlu",
    show_logo: "Rādīt zīmola logotipu",
    show_network: "Rādīt tīklu",
    show_history: "Rādīt 24 h vēsturi",
    show_speedtest: "Rādīt pēdējo ātruma testu",
    show_system: "Rādīt sistēmu (CPU, RAM, temperatūras)",
    show_nodes: "Rādīt mesh un tīkla ierīces",
    show_lan: "Rādīt lokālo tīklu (klienti, Wi-Fi)",
    entities: "Sensori pēc izvēles",
    ent_rate_down: "Lejupielādes ātrums",
    ent_rate_up: "Augšupielādes ātrums",
    ent_wan: "WAN stāvoklis",
    ent_ip: "WAN IP adrese",
    ent_boot: "Darbības laiks",
    ent_cpu: "CPU noslodze",
    ent_ram: "RAM lietojums",
    ent_clients: "Pievienotie klienti",
    ent_download: "Ātruma tests: lejupielāde",
    ent_upload: "Ātruma tests: augšupielāde",
    ent_ping: "Ātruma tests: ping",
    zoom: "Detaļu poga",
    zoom_helper: "Poga augšējā labajā stūrī, kas mini kartes vietā parāda pilno karti, un atpakaļ",
    rate_unit: "Ātruma mērvienība",
    unit_bytes: "Baiti (kB/s, MB/s)",
    unit_bits: "Biti (kb/s, Mb/s)",
    language: "Valoda",
    lang_auto: "Automātiski",
    cpu_warning: "CPU brīdinājums (%)",
    cpu_critical: "CPU kritisks (%)",
    ram_warning: "RAM brīdinājums (%)",
    ram_critical: "RAM kritisks (%)",
    disk_warning: "Diska brīdinājums (% aizņemts)",
    disk_critical: "Disks kritisks (% aizņemts)",
    temp_warning: "Temperatūras brīdinājums (°C)",
    temp_critical: "Kritiska temperatūra (°C)",
  },
  el: {
    network: "Δίκτυο",
    system: "Σύστημα",
    mesh: "Mesh",
    network_devices: "Συσκευές δικτύου",
    lan: "Τοπικό δίκτυο",
    download: "Λήψη",
    upload: "Αποστολή",
    uptime: "Σε λειτουργία",
    firmware: "Υλικολογισμικό",
    wan: "WAN",
    online: "Συνδεδεμένο",
    offline: "Αποσυνδεδεμένο",
    unavailable: "Μη διαθέσιμο",
    unknown: "Άγνωστο",
    latency: "Καθυστέρηση και απώλεια πακέτων",
    loss: "απώλεια",
    load: "Φόρτος",
    cpu: "CPU",
    ram: "RAM",
    disk: "Δίσκος",
    temperature: "Θερμ.",
    rpm: "σ.α.λ.",
    main: "κύριο",
    clients: "Πελάτες",
    clients_n: "πελάτες",
    clients_n_one: "πελάτης",
    wired: "Ενσύρματα",
    wireless: "Wi-Fi",
    guest: "Επισκέπτες",
    wifi: "Wi-Fi",
    on: "Ενεργό",
    off: "Ανενεργό",
    update_available: "Διαθέσιμη ενημέρωση",
    restart: "Επανεκκίνηση συσκευής",
    restart_confirm: "Επανεκκίνηση της συσκευής τώρα; Το δίκτυο και η σύνδεση στο διαδίκτυο θα διακοπούν για λίγα λεπτά.",
    restart_btn: "Επανεκκίνηση",
    cancel: "Ακύρωση",
    wifi_turn_on: "Ενεργοποίηση Wi-Fi",
    wifi_turn_off: "Απενεργοποίηση Wi-Fi",
    wifi_off_confirm: "Απενεργοποίηση αυτού του δικτύου Wi-Fi τώρα; Οι ασύρματες συσκευές του θα χάσουν τη σύνδεση· οι ενσύρματες συσκευές δεν επηρεάζονται.",
    wifi_off_btn: "Απενεργοποίηση",
    hours: "ώ",
    days: "η",
    minutes: "λ",
    no_device: "Δεν βρέθηκε τείχος προστασίας, δρομολογητής ή σύστημα mesh. Είναι εγκατεστημένη μια υποστηριζόμενη ενσωμάτωση (Firewalla, OPNsense, pfSense, UniFi, TP-Link Deco, Omada, MikroTik, ASUS, NETGEAR, OpenWrt, GL.iNet, eero, Linksys Velop…);",
    unknown_device: "Η συσκευή δεν βρέθηκε",
    zoom_in: "Εμφάνιση πλήρους κάρτας",
    zoom_out: "Επιστροφή στη συμπαγή προβολή",
    speedtest: "Δοκιμή ταχύτητας",
    admin: "Άνοιγμα διεπαφής διαχείρισης",
    kind_firewall: "Τείχος προστασίας",
    kind_router: "Δρομολογητής",
    kind_mesh: "Mesh Wi-Fi",
    kind_ap: "Σημείο πρόσβασης",
    device: "Συσκευή (τείχος προστασίας, δρομολογητής ή μονάδα mesh)",
    title: "Τίτλος (προαιρετικός, από προεπιλογή το όνομα της συσκευής)",
    kind: "Είδος συσκευής (εικονίδιο και εικόνα)",
    kind_auto: "Αυτόματα",
    admin_url: "Διεύθυνση διαχείρισης (προαιρετική, ανοίγει με κλικ στην εικόνα)",
    show_title: "Εμφάνιση τίτλου",
    show_subtitle: "Εμφάνιση υπότιτλου",
    show_image: "Εμφάνιση εικόνας συσκευής",
    show_logo: "Εμφάνιση λογότυπου μάρκας",
    show_network: "Εμφάνιση δικτύου",
    show_history: "Εμφάνιση ιστορικού 24 ωρών",
    show_speedtest: "Εμφάνιση τελευταίας δοκιμής ταχύτητας",
    show_system: "Εμφάνιση συστήματος (CPU, RAM, θερμοκρασίες)",
    show_nodes: "Εμφάνιση mesh και συσκευών δικτύου",
    show_lan: "Εμφάνιση τοπικού δικτύου (πελάτες, Wi-Fi)",
    entities: "Αισθητήρες της επιλογής σας",
    ent_rate_down: "Ταχύτητα λήψης",
    ent_rate_up: "Ταχύτητα αποστολής",
    ent_wan: "Κατάσταση WAN",
    ent_ip: "Διεύθυνση IP WAN",
    ent_boot: "Χρόνος λειτουργίας",
    ent_cpu: "Χρήση CPU",
    ent_ram: "Χρήση RAM",
    ent_clients: "Συνδεδεμένοι πελάτες",
    ent_download: "Δοκιμή ταχύτητας: λήψη",
    ent_upload: "Δοκιμή ταχύτητας: αποστολή",
    ent_ping: "Δοκιμή ταχύτητας: ping",
    zoom: "Κουμπί λεπτομερειών",
    zoom_helper: "Κουμπί πάνω δεξιά που εμφανίζει την πλήρη κάρτα στη θέση της μίνι κάρτας, και πίσω",
    rate_unit: "Μονάδα ταχύτητας",
    unit_bytes: "Byte (kB/s, MB/s)",
    unit_bits: "Bit (kb/s, Mb/s)",
    language: "Γλώσσα",
    lang_auto: "Αυτόματα",
    cpu_warning: "Προειδοποίηση CPU (%)",
    cpu_critical: "CPU κρίσιμο (%)",
    ram_warning: "Προειδοποίηση RAM (%)",
    ram_critical: "RAM κρίσιμο (%)",
    disk_warning: "Προειδοποίηση δίσκου (% σε χρήση)",
    disk_critical: "Δίσκος κρίσιμος (% σε χρήση)",
    temp_warning: "Προειδοποίηση θερμοκρασίας (°C)",
    temp_critical: "Κρίσιμη θερμοκρασία (°C)",
  },
};

// Units of the data rates, by language (base 1000).
const RATE_UNITS = Object.fromEntries(
  Object.keys(STRINGS).map((l) => [
    l,
    l === "fr" ? { bytes: ["o/s", "ko/s", "Mo/s", "Go/s"], bits: ["b/s", "kb/s", "Mb/s", "Gb/s"] } : { bytes: ["B/s", "kB/s", "MB/s", "GB/s"], bits: ["b/s", "kb/s", "Mb/s", "Gb/s"] },
  ])
);

// Integrations supported, keyed by the Home Assistant integration platform. Each profile carries the branding (name,
// accent colour, logo, websites), the kind of device (firewall, router, mesh), and what the generic discovery cannot
// guess: `keys` maps a card slot to the integration's own translation key(s), `attrs` reads slots from attributes of
// one of its entities (Firewalla's system status), `nodes: false` keeps its child devices out of the network devices
// list (MikroTik interfaces), `kinds` tells the kind of a device from its model (UniFi gateway or access point).
// Everything else is found by kind of entity (device class, unit) and the words of the translation key and entity id.
const UNIFI_KINDS = [
  { kind: "router", re: /\b(udm|udr|uxg|usg|ucg|udw|ux\b|ugw|efg|dream|gateway|cloud gateway|express)/i },
  { kind: "ap", re: /\b(uap|u6|u7|e7|ual|uac|uk-|nanohd|flexhd|beacon|mesh|in-wall|\bac\b|\bap\b)/i },
];
const OMADA_KINDS = [
  { kind: "router", re: /\b(er\d|gateway|dr\d)/i },
  { kind: "ap", re: /\b(eap|access point)/i },
];
const PROFILES = {
  firewalla_local: {
    name: "Firewalla", kind: "firewall", color: "#c8332d", logo: "__IMG_FILE:firewalla.svg__",
    website: "https://firewalla.com", admin: null,
    // Firewalla gives the box metrics as attributes of its "System Status" binary sensor; the access points (AP7) are
    // devices of their own, with an "AP Status" sensor whose client_count attribute counts their clients.
    attrs: {
      system_status: {
        boot: ["uptime_seconds", "s"], cpu: ["cpu_usage_1m", "%"], ram: ["memory_usage_percent", "%"], ip: ["wan_ip"],
        clients: ["hosts_online"], clients_total: ["hosts_total"],
      },
    },
    nodeAttrs: { ap_status: { clients: "client_count" } },
    nodeOnline: ["ap_status"],
    exclude: ["system_status", "watched_device", "network", "binary_sensor.ssid"],
  },
  opnsense: {
    name: "OPNsense", kind: "firewall", color: "#e44a20", logo: "__IMG_FILE:opnsense.svg__",
    website: "https://opnsense.org", admin: null, nodes: false,
  },
  pfsense: {
    name: "pfSense", kind: "firewall", color: "#3a6fb0", logo: "__IMG_FILE:pfsense.svg__",
    website: "https://www.pfsense.org", admin: null, nodes: false,
  },
  unifi: {
    name: "UniFi", kind: "router", color: "#0559c9", logo: "__IMG_FILE:ubiquiti.svg__",
    website: "https://ui.com", admin: "https://unifi.ui.com", kinds: UNIFI_KINDS,
    keys: { cpu: "device_cpu_utilization", ram: "device_memory_utilization", clients: "device_clients", latency: "wan_latency", node_state: "device_state" },
  },
  tplink_omada: {
    name: "Omada", kind: "router", color: "#2bb3c0", logo: "__IMG_FILE:tp-link.svg__",
    website: "https://www.omadanetworks.com", admin: null, kinds: OMADA_KINDS,
    keys: { cpu: "cpu_usage", ram: "mem_usage", wan: ["wan_link", "online_detection"], node_state: "device_status" },
  },
  tplink_deco: {
    name: "TP-Link Deco", kind: "mesh", color: "#2bb3c0", logo: "__IMG_FILE:tp-link.svg__",
    website: "https://www.tp-link.com/deco", admin: "http://tplinkdeco.net",
  },
  tplink_router: {
    name: "TP-Link", kind: "router", color: "#2bb3c0", logo: "__IMG_FILE:tp-link.svg__",
    website: "https://www.tp-link.com", admin: "http://tplinkwifi.net",
  },
  mikrotik_router: {
    name: "MikroTik", kind: "router", color: "#5b6b75", logo: "__IMG_FILE:mikrotik.svg__",
    website: "https://mikrotik.com", admin: null, nodes: false,
  },
  mikrotik: {
    name: "MikroTik", kind: "router", color: "#5b6b75", logo: "__IMG_FILE:mikrotik.svg__",
    website: "https://mikrotik.com", admin: null, nodes: false,
  },
  asuswrt: {
    name: "ASUS", kind: "router", color: "#00539b", logo: "__IMG_FILE:asus.svg__",
    website: "https://www.asus.com", admin: "http://www.asusrouter.com",
  },
  asusrouter: {
    name: "ASUS", kind: "router", color: "#00539b", logo: "__IMG_FILE:asus.svg__",
    website: "https://www.asus.com", admin: "http://www.asusrouter.com",
    keys: { wan: ["wan", "internet"], cpu: "cpu", ram: "ram", ip: "wan_ip", boot: ["boot_time", "uptime"] },
  },
  netgear: {
    name: "NETGEAR", kind: "router", color: "#5d3d8f", logo: "__IMG_FILE:netgear.svg__",
    website: "https://www.netgear.com", admin: "http://routerlogin.net",
    keys: { cpu: "cpu_utilization", ram: "memory_utilization", st_down: "downlink_bandwidth", st_up: "uplink_bandwidth", st_ping: "average_ping" },
  },
  keenetic_ndms2: {
    name: "Keenetic", kind: "router", color: "#009ee2", logo: "__IMG_FILE:keenetic.svg__",
    website: "https://keenetic.com", admin: "http://my.keenetic.net",
  },
  openwrt: {
    name: "OpenWrt", kind: "router", color: "#00a3cc", logo: "__IMG_FILE:openwrt.svg__",
    website: "https://openwrt.org", admin: null,
  },
  openwrt_ubus: {
    name: "OpenWrt", kind: "router", color: "#00a3cc", logo: "__IMG_FILE:openwrt.svg__",
    website: "https://openwrt.org", admin: null,
  },
  luci: {
    name: "OpenWrt", kind: "router", color: "#00a3cc", logo: "__IMG_FILE:openwrt.svg__",
    website: "https://openwrt.org", admin: null,
  },
  glinet: {
    name: "GL.iNet", kind: "router", color: "#4d7cc2", logo: "__IMG_FILE:glinet.svg__",
    website: "https://www.gl-inet.com", admin: "http://192.168.8.1",
    keys: { wan: "wan_status" },
  },
  glinet_router: {
    name: "GL.iNet", kind: "router", color: "#4d7cc2", logo: "__IMG_FILE:glinet.svg__",
    website: "https://www.gl-inet.com", admin: "http://192.168.8.1",
  },
  miwifi: {
    name: "Xiaomi", kind: "router", color: "#ff6900", logo: "__IMG_FILE:xiaomi.svg__",
    website: "https://www.mi.com", admin: "http://miwifi.com",
  },
  eero: {
    name: "eero", kind: "mesh", color: "#0072ff", logo: "__IMG_FILE:eero.svg__",
    website: "https://eero.com", admin: null,
  },
  linksys_velop: {
    name: "Linksys Velop", kind: "mesh", color: "#1e7fd0", logo: "__IMG_FILE:linksys.svg__",
    website: "https://www.linksys.com", admin: "http://myrouter.local",
    keys: { wan: "wan_status", ip: "wan_ip", clients: "online_devices", st_down: "download_bandwidth", st_up: "upload_bandwidth", st_ping: "speedtest_latency", node_state: "status" },
  },
  ruckus_unleashed: {
    name: "Ruckus Unleashed", kind: "ap", color: "#ff8200", logo: "__IMG_FILE:ruckus.png__",
    website: "https://www.ruckusnetworks.com", admin: null,
  },
};

// Profile of an integration the card does not know: neutral branding, everything found by the generic discovery.
const GENERIC_PROFILE = { name: "", kind: "router", color: "#607d8b", logo: "", website: "", admin: null };
const profileOf = (platform) => (platform && PROFILES[platform] ? { platform, ...PROFILES[platform] } : { ...GENERIC_PROFILE, platform });

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

const esc = (v) =>
  String(v ?? "").replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[c]);

const lang = (hass, config) => {
  const l = config?.language || (hass && (hass.locale?.language || hass.language)) || "en";
  return STRINGS[l] ? l : STRINGS[l.split("-")[0]] ? l.split("-")[0] : "en";
};

const t = (hass, config, key) => STRINGS[lang(hass, config)][key] ?? STRINGS.en[key] ?? key;

/** Text agreeing with the count n: the `key_one/_few/_many` variant picked by Intl.PluralRules when the
 *  language defines it, else the plain key (which serves as the `_other` form). */
const tn = (hass, config, key, n) => {
  const l = lang(hass, config);
  let form = "other";
  try {
    // The Portuguese texts are European Portuguese: 0 takes the plural there (pt alone means pt-BR to Intl).
    form = new Intl.PluralRules(l === "pt" ? "pt-PT" : l).select(n);
  } catch (_) {}
  return STRINGS[l][`${key}_${form}`] ?? t(hass, config, key);
};

const num = (s) => {
  if (!s) return null;
  const v = parseFloat(s.state);
  return Number.isFinite(v) ? v : null;
};

/** True when Home Assistant has no value for the entity (unavailable, e.g. while the router restarts, or unknown):
 *  the card then shows it as unavailable, never as a real state (Wi-Fi off, 0 clients, offline). */
const noValue = (s) => !s || s.state === "unavailable" || s.state === "unknown";

const RATE_FACTORS = {
  "b/s": 1, "bit/s": 1 / 8, "kbit/s": 125, "mbit/s": 125e3, "gbit/s": 125e6,
  "kb/s": 1e3, "mb/s": 1e6, "gb/s": 1e9, "kib/s": 1024, "mib/s": 1024 ** 2, "gib/s": 1024 ** 3,
};

/** Data rate of a sensor in bytes per second, whatever the unit chosen in Home Assistant. */
const toBps = (s) => {
  const v = num(s);
  if (v === null) return null;
  const unit = String(s.attributes?.unit_of_measurement || "kB/s").toLowerCase();
  return v * (RATE_FACTORS[unit] ?? 1e3);
};

/** Locale for numbers: the card's language, refined by Home Assistant's own locale when they agree ("fr-CA"). The
 *  Portuguese texts are European Portuguese (pt alone means pt-BR to Intl). */
const numLang = (hass, config) => {
  const l = lang(hass, config);
  const ha = hass && (hass.locale?.language || hass.language);
  const loc = ha && ha.split("-")[0] === l ? ha : l;
  return loc === "pt" ? "pt-PT" : loc;
};

/** Rate with the language's units and decimal separator ("1,5 Mo/s" in French): base 1000, one decimal below 100. */
const fmtRate = (bps, hass, config) => {
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
const fmtNum = (v, hass, config, d = 0) =>
  new Intl.NumberFormat(numLang(hass, config), { maximumFractionDigits: d, useGrouping: false }).format(v);

const fmtUptime = (sec, hass, config) => {
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
const bootSec = (s) => {
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
const temperature = (s) => {
  const raw = num(s);
  const unit = s?.attributes?.unit_of_measurement || "°C";
  if (raw === null) return { raw, c: null, unit };
  const u = unit.replace(/^°/, "").toUpperCase();
  const c = u === "F" ? ((raw - 32) * 5) / 9 : u === "K" ? raw - 273.15 : raw;
  return { raw, c, unit };
};

/** Online state of a connectivity entity: true, false, or null when it has no value or says neither. A binary
 *  sensor is on / off; a status sensor names its state (UniFi "connected", Omada "disconnected", GL.iNet "online"). */
const ONLINE = /^(on|online|connected|up|ok|true|active|adopted|running|internet|home)$/i;
const OFFLINE = /^(off|offline|disconnected|down|error|failed|failure|isolated|lost|false|inactive|no_internet|not_home|disabled)$/i;
const onlineOf = (s) => {
  if (noValue(s)) return null;
  const v = String(s.state).trim();
  return ONLINE.test(v) ? true : OFFLINE.test(v) ? false : null;
};

const level = (v, warn, crit) => (v === null ? "" : v >= crit ? "crit" : v >= warn ? "warn" : "ok");

// Default warning / critical thresholds: CPU, RAM and disk in % used, temperatures in °C. Each can be set in the card
// options, named as on the other cards (system monitor, NAS, internet box).
const THRESHOLDS = { cpu_warning: 80, cpu_critical: 95, ram_warning: 80, ram_critical: 90, disk_warning: 80, disk_critical: 90, temp_warning: 75, temp_critical: 90 };

/** A threshold option as a number, or its default when unset or not a number. */
const threshold = (config, key) => {
  const v = config?.[key];
  const n = v === "" || v === null || v === undefined ? Number.NaN : Number(v);
  return Number.isFinite(n) ? n : THRESHOLDS[key];
};

// Same values, compared by identity: used to skip a render when nothing the card shows has changed.
const sameSig = (a, b) => !!a && !!b && a.length === b.length && a.every((v, i) => v === b[i]);

// Patch the shadow DOM in place from the new HTML: nodes whose tag is unchanged are kept, so keyboard
// focus, hover, embedded pictures and CSS transitions survive an update, and only the changed text and
// attributes are written. Rows of a list carry a data-key (their entity or row id) and are matched by it,
// wherever they moved, so a focused row keeps its own data when the list is reordered (a node matched by
// position would be rewritten with the row taking its place, and Enter would act on that row). Nodes
// without a data-key are matched by position.
const patchAttrs = (cur, next) => {
  for (const { name } of [...cur.attributes]) if (!next.hasAttribute(name)) cur.removeAttribute(name);
  for (const { name, value } of next.attributes) if (cur.getAttribute(name) !== value) cur.setAttribute(name, value);
};
const keyOf = (n) => (n.nodeType === 1 ? n.getAttribute("data-key") : null);
const sameNode = (a, b) => !!a && a.nodeType === b.nodeType && a.nodeName === b.nodeName;
// Moves a kept node. moveBefore (where supported) keeps its focus; insertBefore drops it, which is safe:
// Enter then does nothing rather than act on another row.
const place = (parent, node, ref) => {
  if (node === ref) return;
  try {
    if (parent.moveBefore && node.parentNode === parent) return parent.moveBefore(node, ref);
  } catch (_e) {
    /* fall back to insertBefore */
  }
  parent.insertBefore(node, ref);
};
const patchChildren = (cur, next) => {
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
const morph = (root, html) => {
  const tpl = document.createElement("template");
  tpl.innerHTML = html;
  patchChildren(root, tpl.content);
};

// After the confirmation popup closes, clicks on the card are ignored for this long: the second click of a double
// click on its button would otherwise land on what lies under it.
const CONFIRM_GUARD_MS = 400;

// A click inside a dialog (more-info opened from the card, say) is not a click outside the card.
const inDialog = (path) => path.some((n) => ["ha-more-info-dialog", "ha-dialog", "dialog"].includes(n.localName));

// "A click elsewhere" is caught on the pointer, not only on the click event: on iOS (Safari and the companion app)
// a tap on something that is not clickable (the background, an empty spot, a card with no action) sends no click to
// the page. The handler runs when the press and the release are both outside the card (a slider dragged out of the
// card does not count), and a scroll does not count (the browser cancels the pointer); keyboard clicks still go
// through the click event. The handler keeps its own checks (outside of the card, not in a dialog).
const watchOutside = (card, handler) => {
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

const fireMoreInfo = (node, entityId) => {
  if (!entityId) return;
  node.dispatchEvent(new CustomEvent("hass-more-info", { detail: { entityId }, bubbles: true, composed: true }));
};

// ---------------------------------------------------------------------------
// Entity discovery
// ---------------------------------------------------------------------------

const deviceName = (dev) => dev && (dev.name_by_user || dev.name);
const isEntityId = (v) => typeof v === "string" && /^[a-z_]+\.[a-z0-9_]+$/.test(v);

/** Friendly name of an entity without its device name ("Deco Salon Deco CPU usage" -> "CPU usage"). */
const shortName = (hass, id, dev) => {
  const name = hass.states[id]?.attributes?.friendly_name || id.split(".")[1];
  for (const prefix of [dev?.name_by_user, dev?.name]) {
    if (prefix && name.startsWith(`${prefix} `)) return name.slice(prefix.length + 1);
  }
  return name;
};

// A slot can be read from an attribute of an entity (Firewalla's system status): its reference is
// "<entity id>|<attribute>|<unit>", read back as a state of its own.
const refId = (ref) => (ref ? String(ref).split("|")[0] : ref);
const _attrStates = new WeakMap();
const attrState = (base, attr, unit) => {
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
const stateOf = (hass, ref) => {
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
const _words = new WeakMap();
const words = (e) => {
  let w = _words.get(e);
  if (w === undefined) {
    w = ` ${`${e.translation_key || ""} ${e.entity_id.slice(e.entity_id.indexOf(".") + 1)}`.toLowerCase().replace(/[^a-z0-9]+/g, " ").trim()} `;
    _words.set(e, w);
  }
  return w;
};
const has = (w, ...list) => list.some((x) => w.includes(` ${x} `));

const DOWN = ["rx", "down", "download", "downloads", "in", "inbytes", "received", "receive", "recv", "downstream", "ingress", "dl", "downlink"];
const UP = ["tx", "up", "upload", "uploads", "out", "outbytes", "sent", "send", "upstream", "egress", "ul", "uplink"];
/** "down" / "up" for a sensor named after a direction of traffic, else null. */
const direction = (w) => (has(w, ...DOWN) || /download|receiv/.test(w) ? "down" : has(w, ...UP) || /upload/.test(w) ? "up" : null);

const isRateUnit = (u) => !!u && Object.hasOwn(RATE_FACTORS, String(u).toLowerCase());
// A speed test result or a line / link speed is not traffic.
const SPEEDTEST = /speed ?test|speedtest/;
const NOT_TRAFFIC = ["backhaul", "link", "max", "mesh", "client", "clients", "wired", "phy", "negotiated", "capacity", "limit", "qos"];
const NOT_WAN = ["lan", "guest", "vpn", "wg", "wireguard", "ovpn", "openvpn", "tailscale", "lo", "loopback", "iot", "dmz"];
const IPV4 = /^\d{1,3}(\.\d{1,3}){3}$/;
// Entities a profile keeps out of the discovery, by translation key, or "<domain>.<translation key>".
const excluded = (profile, e) =>
  !!e.translation_key && !!profile.exclude?.some((x) => x === e.translation_key || x === `${e.entity_id.slice(0, e.entity_id.indexOf("."))}.${e.translation_key}`);

/**
 * What an entity of the router (or of one of its child devices, `own` false) tells: { slot, score }, or null. The
 * integration's own translation keys win (score 20), then its attributes (handled by the caller), then the kind of
 * entity and its words. A slot keeps its best-scored entity.
 */
const classify = (hass, profile, e, own) => {
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
    if ((has(w, "clients", "devices", "hosts") || has(w, "client", "count")) && !unit.trim()) {
      if (has(w, "offline", "blocked", "reservations", "reserved", "dhcp", "captive", "vpn", "openvpn", "pptpvpn", "iot")) return null;
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
    if (has(w, "polling", "led", "parental", "block", "vpn", "qos", "port", "poe", "access", "smart", "traffic", "homekit", "wps", "rule", "forwarding", "schedule", "service", "upnp")) return null;
    if (has(w, "wifi", "wi", "wlan", "ssid", "wireless", "radio", "guest") || /wifi/.test(w)) return { slot: "wifi", score: 1 };
    return null;
  }
  if (domain === "update") return { slot: "update", score: 2 + (has(w, "firmware") ? 1 : 0) };
  return null;
};

// Registry entries that have a state, by device and by integration. Cached on the identity of hass.entities (replaced
// when the registry changes) and the number of states, not on hass.states, which is replaced on every state change.
let _index;
const index = (hass) => {
  const nStates = Object.keys(hass.states || {}).length;
  if (_index && _index.entities === hass.entities && _index.nStates === nStates) return _index;
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
  _index = { entities: hass.entities, nStates, byDevice, byPlatform };
  return _index;
};

/** The integration of a device: the supported platform of most of its entities, else the platform of most of them. */
const platformOf = (entries) => {
  const count = new Map();
  for (const e of entries) count.set(e.platform, (count.get(e.platform) || 0) + (PROFILES[e.platform] ? 1000 : 1) - (e.entity_id.startsWith("device_tracker.") ? 0.5 : 0));
  return [...count.entries()].sort((a, b) => b[1] - a[1])[0]?.[0];
};

const sharesEntry = (a, b) => !a?.config_entries?.length || !b?.config_entries?.length || a.config_entries.some((c) => b.config_entries.includes(c));

// Slots that make a device a router, a firewall or a mesh unit, with their weight in the default choice.
const MAIN_SLOTS = { rate_down: 3, wan: 3, cpu: 1, ram: 1, boot: 1, reboot: 1, clients: 1, ip: 1 };

/** Slots found on a device's own entities, with their best entity, and its score as the main device. */
const scanDevice = (hass, profile, entries) => {
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
let _list;
const listDevices = (hass) => {
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

const emptyBox = () => ({ id: null, device: null, profile: null, kind: null, scalars: {}, temps: [], fans: [], wifi: [], nodes: [], trackers: [] });

/** Kind of the device (firewall, router, mesh, ap): the `kind` option, else from its model for an integration
 *  with several kinds of devices (UniFi, Omada), else the integration's. */
const kindOf = (profile, dev, config) => {
  if (DRAWINGS[config?.kind]) return config.kind;
  const ids = [dev?.model, dev?.model_id, dev?.name].filter(Boolean).join(" ");
  return profile.kinds?.find((x) => x.re.test(ids))?.kind || profile.kind;
};

/** A network device of the router (mesh unit, access point, switch): { id, name, model, online, clients, entity }, or
 *  null when its entities tell neither its state nor its clients. */
const nodeOf = (hass, profile, dev, entries) => {
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
    } else if (id.startsWith("sensor.") && (k === profile.keys?.clients || has(w, "clients", "devices") || has(w, "client", "count")) && !has(w, "offline", "guest", "blocked", "wired", "wireless")) {
      if (!String(s.attributes?.unit_of_measurement || "").trim()) clients ??= id;
    } else if (id.startsWith("sensor.") && has(w, "state", "status") && onlineOf(s) !== null) online ??= id;
  }
  if (!online && !clients) return null;
  return { id: dev.id, name: deviceName(dev), model: dev.model || "", online, clients, entity: online || clients || first };
};

const _boxes = new WeakMap();

/**
 * Map the entities of one router (and its child devices) to a structured object of entity references. Cached on the
 * index (hass.entities, hass.states) and hass.devices.
 */
const discover = (hass, deviceId, config) => {
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
const SPEEDTEST_KEYS = ["download", "upload", "ping"];
const SPEEDTEST_PLATFORMS = ["speedtestdotnet", "fastdotcom"];
const speedtestOf = (hass, box, config) => {
  const sc = box?.scalars || {};
  let found = sc.st_down || sc.st_up ? { download: sc.st_down, upload: sc.st_up, ping: sc.st_ping } : null;
  if (!found) {
    const byPlatform = {};
    for (const e of Object.values(hass.entities || {})) {
      if (!SPEEDTEST_PLATFORMS.includes(e.platform) || e.hidden || !e.entity_id.startsWith("sensor.") || !SPEEDTEST_KEYS.includes(e.translation_key)) continue;
      if (hass.states[e.entity_id]) (byPlatform[e.platform] ??= {})[e.translation_key] = e.entity_id;
    }
    found = { ...(byPlatform.speedtestdotnet || byPlatform.fastdotcom || {}) };
  }
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
const OWN_KEYS = ["rate_down", "rate_up", "wan", "ip", "boot", "cpu", "ram", "clients"];
const _withOwn = new WeakMap();
const withEntities = (box, entities) => {
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
const EDITOR_ENTITIES = new Set([...OWN_KEYS, ...SPEEDTEST_KEYS]);
const cleanEntities = (entities) => {
  if (!entities || typeof entities !== "object") return undefined;
  const out = {};
  for (const [k, v] of Object.entries(entities)) {
    const value = v && typeof v === "object" ? cleanEntities(v) : v;
    if (value !== "" && value !== undefined && value !== null) out[k] = value;
  }
  return Object.keys(out).length ? out : undefined;
};
// The router a card shows: the one found, with the sensors of the `entities` option.
const boxFor = (hass, config) => withEntities(discover(hass, config?.device, config), config?.entities);

// ---------------------------------------------------------------------------
// Shared styles
// ---------------------------------------------------------------------------

const BASE_STYLE = `
  :host { display: block; }
  /* ha-card is the size container of the width queries: its content gives it no width, so in a parent that sizes to
     its content (inline-block, grid auto column: button-card, layout-card) the card would fall to a few pixels. This
     empty, zero-height grid gives the card a natural (max-content) width of 400 px (240 px for the compact mini card)
     without any minimum (its min-content width is 0): in a "1fr 1fr" grid the card still shrinks to its column. */
  :host::before { content: ""; display: grid; grid-template-columns: minmax(0, 400px); height: 0; }
  :host { --rc-brand: #607d8b; --rc-ok: var(--success-color, #43a047); --rc-warn: var(--warning-color, #ffa600); --rc-crit: var(--error-color, #db4437); }
  /* Readable colours: the brand accent and the state colours stay as they are on fills, dots and tints; icons and
     graphics mix 40 % of the theme text colour (3:1), text 50 % (4.5:1). Declared on ha-card, which carries the
     brand's --rc-brand. */
  ha-card { overflow: hidden; position: relative; container-type: inline-size;
            --rc-accent: color-mix(in srgb, var(--rc-brand) 60%, var(--primary-text-color)); }
  .icon { width: 18px; height: 18px; fill: currentColor; flex: none; }
  .muted { color: var(--secondary-text-color); }
  .clickable { cursor: pointer; }
  [role="button"]:focus-visible { outline: 2px solid var(--primary-color, #03a9f4); outline-offset: 2px; }
  .ok { --c: var(--rc-ok); } .warn { --c: var(--rc-warn); } .crit { --c: var(--rc-crit); } .off { --c: var(--disabled-text-color, #9e9e9e); }
  .dot { width: 6px; height: 6px; border-radius: 50%; background: var(--c, var(--rc-ok)); flex: none; display: inline-block; }
  .chip { display: inline-flex; align-items: center; gap: 4px; padding: 1px 8px; border-radius: 12px; font-size: 11px; font-weight: 500;
          background: color-mix(in srgb, var(--c, var(--rc-ok)) 15%, transparent);
          color: color-mix(in srgb, var(--c, var(--rc-ok)) 50%, var(--primary-text-color)); }
  .chip .icon { width: 14px; height: 14px; }
  .chips { display: flex; flex-wrap: wrap; gap: 6px; margin-top: 4px; }
  /* Wi-Fi on / off switch: outlined track, tinted when on, never filled. */
  .toggle { all: unset; flex: none; position: relative; box-sizing: border-box; width: 28px; height: 16px; border-radius: 8px; cursor: pointer;
            border: 1.5px solid color-mix(in srgb, var(--secondary-text-color) 70%, transparent); }
  .toggle::after { content: ""; position: absolute; top: 2px; left: 2px; width: 9px; height: 9px; border-radius: 50%;
                   background: var(--secondary-text-color); transition: transform .2s ease; }
  .toggle[aria-checked="true"] { border-color: color-mix(in srgb, var(--rc-ok) 70%, var(--primary-text-color)); background: color-mix(in srgb, var(--rc-ok) 15%, transparent); }
  .toggle[aria-checked="true"]::after { transform: translateX(12px); background: color-mix(in srgb, var(--rc-ok) 70%, var(--primary-text-color)); }
  .toggle:focus-visible { outline: 2px solid var(--primary-color, #03a9f4); outline-offset: 2px; }
  @media (prefers-reduced-motion: reduce) { .toggle::after { transition: none; } }
  .header { display: flex; align-items: center; gap: 10px; padding: 12px 12px 8px; }
  /* The status pill sits right of the title line, centred on it; the subtitle and chips stay under the title.
     Narrow cards: the title block shrinks but keeps about 4 characters of the 16 px title (48 px), the device picture
     gets smaller (hidden up to 340 px on the full card), the status pill truncates its text (only its dot below
     245 px) and the icon buttons never shrink. */
  .titles { flex: 1 1 0; min-width: 48px; display: grid; grid-template-columns: minmax(0, 1fr) auto; }
  :host([hide-title]) .titles > .name, :host([hide-subtitle]) .titles > .sub { display: none; }
  .titles > * { grid-column: 1; }
  .titles > .chip { grid-column: 2; grid-row: 1; align-self: center; margin-left: 10px; white-space: nowrap; min-width: 0; max-width: 100%; }
  .chip.status { overflow: hidden; }
  .chip.status .txt { min-width: 0; overflow: hidden; text-overflow: ellipsis; }
  .titles .chips { margin-top: 4px; }
  .logo-link { position: relative; display: flex; align-items: center; justify-content: center; flex: none; align-self: flex-start;
               width: 40px; height: 40px; border-radius: 50%; background: color-mix(in srgb, var(--rc-tint) 16%, transparent);
               --rc-tint: var(--c, var(--rc-brand)); --rc-icon: color-mix(in srgb, var(--rc-tint) 60%, var(--primary-text-color));
               transition: background-color .3s ease; }
  /* The pill takes the colour of the WAN state (.ok / .crit / .off set --c), the brand's without one. */
  .logo-link .icon.type { width: 24px; height: 24px; fill: var(--rc-icon); stroke: var(--rc-icon); stroke-width: 0; transition: fill .3s ease, stroke .3s ease; }
  .logo-link .icon.type .ln { fill: none; stroke-width: 2; stroke-linecap: round; stroke-linejoin: round; }
  .logo-link .icon.type .led { fill: color-mix(in srgb, var(--rc-tint) 16%, var(--card-background-color, #fff)); }
  @media (prefers-reduced-motion: reduce) { .logo-link, .logo-link .icon.type { transition: none; } }
  .logo { position: absolute; right: -4px; bottom: -4px; display: block; width: 18px; height: 18px; object-fit: contain; border-radius: 5px; padding: 1px;
          box-sizing: border-box; background: #fff;
          box-shadow: 0 0 0 1px var(--divider-color, rgba(0,0,0,.12)), 0 0 0 3px var(--card-background-color, #fff); }
  .name { font-size: 16px; font-weight: 500; line-height: 1.25; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
  .sub { font-size: 12px; color: var(--secondary-text-color); overflow: hidden; }
  /* Model and firmware on one line when they fit, else one per line: the "·" separator that starts a line sits in
     the negative margin, clipped by .sub. */
  .sub .parts { display: flex; flex-wrap: wrap; margin-left: -10px; }
  .sub .parts span { min-width: 0; max-width: 100%; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
  .sub .parts span::before { content: "·"; display: inline-block; width: 10px; text-align: center; }
  /* The device picture gives way before the buttons: it shrinks (object-fit) rather than push them out of the card. */
  .pic-link { display: flex; flex: 0 1 auto; min-width: 0; max-width: 40%; }
  @container (max-width: 200px) { .pic-link { display: none; } }
  .pic { height: 48px; width: auto; max-width: 100%; object-fit: contain; filter: drop-shadow(0 4px 6px rgba(0,0,0,.25)); }
  .tile { display: flex; align-items: center; gap: 8px; padding: 6px 10px; border-radius: 10px; min-width: 0;
          background: var(--secondary-background-color, rgba(127,127,127,.08)); position: relative; overflow: hidden; }
  .tile > :not(.spark) { position: relative; }
  .tile .spark { position: absolute; left: 0; bottom: 0; width: 100%; height: 55%; pointer-events: none; }
  .spark-a { fill: color-mix(in srgb, var(--c) 12%, transparent); }
  .spark-l { fill: none; stroke: color-mix(in srgb, var(--c) 50%, transparent); stroke-width: 1.2; vector-effect: non-scaling-stroke; }
  .tile .icon { color: color-mix(in srgb, var(--c, var(--rc-brand)) 60%, var(--primary-text-color)); }
  .tile > div { min-width: 0; }
  .tile .k { font-size: 11px; color: var(--secondary-text-color); white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
  .tile .v { font-size: 14px; font-weight: 500; white-space: nowrap; }
  .tile.down { --c: var(--rc-ok); }
  .tile.up { --c: var(--info-color, #039be5); }
  .warning { padding: 16px; color: color-mix(in srgb, var(--rc-warn) 50%, var(--primary-text-color)); }
  .zoom { all: unset; flex: none; cursor: pointer; width: 24px; height: 24px; margin: -4px -4px -4px 0; border-radius: 50%;
          display: grid; place-items: center; color: var(--secondary-text-color); }
  .zoom .icon { width: 16px; height: 16px; }
  .zoom:hover { background: color-mix(in srgb, var(--secondary-text-color) 16%, transparent); color: var(--primary-text-color); }
  .zoom:focus-visible { outline: 2px solid var(--primary-color, #03a9f4); outline-offset: 1px; }
  /* Header action button (restart): round, tinted on hover, never filled. */
  .action { all: unset; flex: none; cursor: pointer; width: 24px; height: 24px; margin: -4px 0; border-radius: 50%;
            display: grid; place-items: center; color: var(--secondary-text-color); }
  .action .icon { width: 16px; height: 16px; }
  .action:hover { background: color-mix(in srgb, var(--rc-brand) 16%, transparent); color: var(--rc-accent); }
  .action:focus-visible { outline: 2px solid var(--primary-color, #03a9f4); outline-offset: 1px; }
  .action:disabled { cursor: default; opacity: .4; }
  .action:disabled:hover { background: none; color: var(--secondary-text-color); }
`;

// In-card confirmation popup, at the top of the card so it stays in view when the card is long.
const DIALOG_STYLE = `
  .backdrop { position: absolute; inset: 0; background: rgba(0,0,0,.45); display: flex; align-items: flex-start; justify-content: center;
              padding-top: 12px; box-sizing: border-box; z-index: 9; border-radius: inherit; }
  .modal { background: var(--card-background-color, #1c1c1c); color: var(--primary-text-color); width: min(92%, 340px); max-height: calc(100% - 24px);
           box-sizing: border-box; border-radius: 14px; padding: 16px; box-shadow: 0 8px 30px rgba(0,0,0,.4); display: flex; flex-direction: column; gap: 10px; }
  .modal h3 { margin: 0; font-size: 16px; font-weight: 500; display: flex; align-items: center; gap: 8px; }
  .modal h3 .icon { width: 20px; height: 20px; color: var(--rc-accent); }
  .modal .hint { font-size: 13px; color: var(--secondary-text-color); line-height: 1.4; }
  .modal-actions { display: flex; justify-content: flex-end; gap: 8px; margin-top: 2px; }
  .modal button.act { border: 0; border-radius: 8px; padding: 8px 14px; font: inherit; font-size: 13px; font-weight: 500; cursor: pointer; }
  .modal button.cancel { background: var(--secondary-background-color, rgba(127,127,127,.12)); color: var(--primary-text-color); }
  .modal button.danger { background: color-mix(in srgb, var(--rc-brand) 16%, transparent); color: var(--primary-text-color); }
  .modal button.cancel:hover { background: color-mix(in srgb, var(--secondary-text-color) 16%, var(--secondary-background-color, transparent)); }
  .modal button.danger:hover { background: color-mix(in srgb, var(--rc-brand) 26%, transparent); }
`;

// Sparkline of a series of [time (ms), value] points (24 h of 5-minute means), on a real time axis: x is the point's
// time over the 24 h window ending at `end`, y its value scaled from 0 to `peak` (the series' own peak by default,
// 100 for a percentage). Points more than two periods apart are not joined: the curve breaks where the recorder has
// no data. Runs of a single point are not drawn; nothing at all without a run of two points.
const HIST_REFRESH = 5 * 60000;
const HIST_WINDOW = 864e5;
const HIST_PERIOD = 5 * 60000;
function spark(points, end, peak) {
  if (!points || points.length < 2) return "";
  const start = end - HIST_WINDOW;
  const inWindow = points.filter(([at]) => at >= start && at <= end).sort((a, b) => a[0] - b[0]);
  const runs = [];
  let run = [];
  for (const p of inWindow) {
    if (run.length && p[0] - run[run.length - 1][0] > 2 * HIST_PERIOD) {
      runs.push(run);
      run = [];
    }
    run.push(p);
  }
  runs.push(run);
  const drawn = runs.filter((r) => r.length >= 2);
  if (!drawn.length) return "";
  const top = peak || Math.max(...drawn.flat().map(([, v]) => v)) || 1;
  const x = (at) => (((at - start) / HIST_WINDOW) * 100).toFixed(2);
  const y = (v) => (30 - (Math.min(top, Math.max(0, v)) / top) * 28).toFixed(2);
  const lines = drawn.map((r) => `M${r.map(([at, v]) => `${x(at)},${y(v)}`).join("L")}`);
  const areas = drawn.map((r, i) => `M${x(r[0][0])},30L${lines[i].slice(1)}L${x(r[r.length - 1][0])},30Z`);
  return `<svg class="spark" viewBox="0 0 100 30" preserveAspectRatio="none" aria-hidden="true"><path class="spark-a" d="${areas.join("")}"/><path class="spark-l" d="${lines.join(
    ""
  )}"/></svg>`;
}

/** Time of a recorder statistics row in ms: a number (Home Assistant 2023.3 and later) or an ISO date string. */
const statTime = (p) => (typeof p.start === "number" ? p.start : Date.parse(p.start));

class RouterBase extends HTMLElement {
  constructor() {
    super();
    this.attachShadow({ mode: "open" });
    this._html = "";
    this._dialog = null;
    // No rewrite of the card between the press and the release: Home Assistant updates the card several times a
    // second, and a rewrite under the pointer can replace the element pressed, so that the click lands on the card
    // itself and does nothing. The pending render is done once released (after the click).
    this._onPressStart = () => {
      this._pressing = true;
      window.addEventListener("pointerup", this._onPressEnd, true);
      window.addEventListener("pointercancel", this._onPressEnd, true);
    };
    this._onPressEnd = () => {
      window.removeEventListener("pointerup", this._onPressEnd, true);
      window.removeEventListener("pointercancel", this._onPressEnd, true);
      setTimeout(() => {
        this._pressing = false;
        if (!this._dirty) return;
        this._dirty = false;
        this._update();
      }, 0);
    };
    this.shadowRoot.addEventListener("pointerdown", this._onPressStart);
    this.shadowRoot.addEventListener("click", (ev) => {
      // The click ends the press: what it changes is drawn at once.
      this._pressing = false;
      // Just closed: the rest of a double click on the popup's button does nothing.
      if (!this._dialog && Date.now() - (this._dialogClosedAt ?? 0) < CONFIRM_GUARD_MS) {
        ev.stopImmediatePropagation();
        return;
      }
      const path = ev.composedPath();
      const action = path.find((n) => n.dataset?.action);
      // While the confirmation popup is open, only its own buttons and the backdrop act; any other click closes it.
      if (this._dialog) {
        if (action?.dataset.action === "dialog-ok") {
          const run = this._dialog.onOk;
          this._closeDialog();
          run?.();
        } else if (action?.dataset.action === "dialog-cancel" || path[0] === action) {
          this._closeDialog();
        }
        return;
      }
      // The restart button opens a confirmation popup before pressing the router's reboot button.
      if (action?.dataset.action === "restart") return this._confirmRestart();
      // A Wi-Fi switch turns its Wi-Fi on at once, and off after a confirmation popup.
      if (action?.dataset.action === "wifi") return this._toggleWifi(action.dataset.id);
      const el = path.find((n) => n.dataset?.entity);
      if (el) fireMoreInfo(this, el.dataset.entity);
    });
    // Keyboard access: Enter or Space on a focusable non-button element acts as a click.
    this.shadowRoot.addEventListener("keydown", (ev) => {
      if ((ev.key === "Enter" || ev.key === " ") && ev.target.getAttribute?.("role") === "button") {
        ev.preventDefault();
        ev.target.click();
      }
    });
    // Escape closes the confirmation popup (as Cancel). Listened on the window while the popup is open: a re-render
    // or a click on its text can take the focus out of the card. Tab and Shift+Tab stay on the popup's two buttons.
    this._onKey = (ev) => {
      if (!this._dialog) return;
      if (ev.key === "Tab") {
        const btns = [...this.shadowRoot.querySelectorAll(".modal button.act")];
        if (!btns.length) return;
        ev.preventDefault();
        const i = btns.indexOf(this.shadowRoot.activeElement);
        btns[(i + (ev.shiftKey ? -1 : 1) + btns.length) % btns.length].focus({ preventScroll: true });
        return;
      }
      if (ev.key !== "Escape") return;
      ev.stopPropagation();
      this._closeDialog();
    };
  }

  connectedCallback() {
    // A click elsewhere on the page closes the confirmation popup; the focus goes where that click put it. The click
    // goes on to its target; the mini card only keeps its zoomed view on it (this listener runs before the mini's).
    this._onDialogOutside ??= (ev) => {
      if (this._dialog && !ev.composedPath().includes(this)) {
        this._dialogClosingClick = ev;
        this._closeDialog(false);
      }
    };
    this._dialogOutside ??= watchOutside(this, (ev) => this._onDialogOutside(ev));
    this._dialogOutside.on();
    // Back on the page after leaving it: rendered again in its default state.
    this._update();
  }

  disconnectedCallback() {
    this._dialogOutside?.off();
    window.removeEventListener("keydown", this._onKey);
    this._pressing = false;
    window.removeEventListener("pointerup", this._onPressEnd, true);
    window.removeEventListener("pointercancel", this._onPressEnd, true);
    // Left (another dashboard view, a conditional card hidden): back to the defaults, so that the card does not come
    // back with its popup open.
    this._dialog = null;
  }

  // Calls a Home Assistant service on an entity. A failed call is logged (Home Assistant already shows a toast).
  _call(domain, service, entityId) {
    Promise.resolve()
      .then(() => this._hass?.callService(domain, service, { entity_id: entityId }))
      .catch((err) => console.error(`router-card: ${domain}.${service} failed`, err));
  }

  // Turns a Wi-Fi switch of the router on, or opens a confirmation popup before turning it off (wireless devices lose
  // their connection). Nothing while the switch is unavailable, nor for an entity that is not one of its switches.
  _toggleWifi(id) {
    const box = boxFor(this._hass, this._config);
    const wifi = this._s(id);
    if (!box.wifi.some((x) => x.id === id) || !wifi || noValue(wifi)) return;
    if (wifi.state !== "on") return this._call("switch", "turn_on", id);
    this._openDialog({
      body: `<h3 id="dialog-title">${svgIcon(ICONS.wifi_off)}${esc(this._t("wifi_turn_off"))}</h3>
        <div class="hint" id="dialog-msg">${esc(this._t("wifi_off_confirm"))}</div>`,
      ok: this._t("wifi_off_btn"),
      onOk: () => this._call("switch", "turn_off", id),
      from: "wifi",
      fromId: id,
    });
  }

  // Small on / off switch for a Wi-Fi network, next to its tile or footer item; none while the switch is
  // unavailable. Its name is the network's, its tooltip the action it does.
  _wifiToggle(wifi, name) {
    if (!wifi || noValue(wifi)) return "";
    const on = wifi.state === "on";
    return `<button type="button" class="toggle" role="switch" aria-checked="${on}" data-action="wifi" data-id="${esc(wifi.entity_id)}" title="${esc(
      this._t(on ? "wifi_turn_off" : "wifi_turn_on")
    )}" aria-label="${esc(name || this._t("wifi"))}"></button>`;
  }

  // Opens the restart confirmation popup; on confirmation, presses the router's reboot button.
  _confirmRestart() {
    const reboot = boxFor(this._hass, this._config).scalars.reboot;
    if (!reboot || this._s(reboot)?.state === "unavailable") return;
    this._openDialog({
      body: `<h3 id="dialog-title">${svgIcon(ICONS.restart)}${esc(this._t("restart"))}</h3>
        <div class="hint" id="dialog-msg">${esc(this._t("restart_confirm"))}</div>`,
      ok: this._t("restart_btn"),
      onOk: () => this._call("button", "press", reboot),
      from: "restart",
    });
  }

  _openDialog(dialog) {
    this._dialog = dialog;
    window.addEventListener("keydown", this._onKey);
    this._update();
    // After a re-render: no scroll of the page towards the card.
    this.shadowRoot.querySelector(".modal .danger")?.focus({ preventScroll: true });
  }

  // Closes the popup and gives the focus back to the button that opened it (`from`: its data-action, `fromId` its
  // data-id), looked up again after the render, which may have re-created it.
  _closeDialog(restoreFocus = true) {
    if (!this._dialog) return;
    const { from, fromId } = this._dialog;
    this._dialog = null;
    this._dialogClosedAt = Date.now();
    window.removeEventListener("keydown", this._onKey);
    this._update();
    if (restoreFocus && from) {
      const sel = `[data-action="${from}"]${fromId ? `[data-id="${CSS.escape(fromId)}"]` : ""}`;
      this.shadowRoot.querySelector(sel)?.focus({ preventScroll: true });
    }
  }

  _dialogHtml() {
    const d = this._dialog;
    if (!d) return "";
    return `<style>${DIALOG_STYLE}</style><div class="backdrop" data-action="dialog-backdrop">
      <div class="modal" role="dialog" aria-modal="true" aria-labelledby="dialog-title" aria-describedby="dialog-msg">
        ${d.body}
        <div class="modal-actions">
          <button type="button" class="act cancel" data-action="dialog-cancel">${esc(this._t("cancel"))}</button>
          <button type="button" class="act danger" data-action="dialog-ok">${esc(d.ok)}</button>
        </div>
      </div>
    </div>`;
  }

  // Round restart button for the header: shown only when the router exposes a reboot button. Disabled while the
  // button is unavailable (a button never pressed is "unknown": that is its normal state).
  _restartBtn(box) {
    if (!box.scalars.reboot) return "";
    const label = esc(this._t("restart"));
    const disabled = this._s(box.scalars.reboot)?.state === "unavailable" ? " disabled" : "";
    return `<button class="action" data-action="restart" title="${label}" aria-label="${label}"${disabled}>${svgIcon(ICONS.restart)}</button>`;
  }

  set hass(hass) {
    this._hass = hass;
    if (!this._config) return;
    // Render only when a state the card shows has changed, not on every state change of Home Assistant.
    const sig = this._signature();
    if (sameSig(sig, this._sig)) return;
    this._update(sig);
  }

  get hass() {
    return this._hass;
  }

  setConfig(config) {
    if (!config) throw new Error("Invalid configuration");
    this._config = { ...config };
    // show_title / show_subtitle: the header's title / subtitle, hidden by the stylesheet
    this.toggleAttribute?.("hide-title", config.show_title === false);
    this.toggleAttribute?.("hide-subtitle", config.show_subtitle === false);
    this._html = "";
    this._update();
  }

  _t(key) {
    return t(this._hass, this._config, key);
  }

  _tn(key, n) {
    return tn(this._hass, this._config, key, n);
  }

  _s(ref) {
    return stateOf(this._hass, ref);
  }

  _rate(id) {
    return fmtRate(toBps(this._s(id)), this._hass, this._config);
  }

  // Level ("ok", "warn", "crit", or "" without value) of a value against the configured thresholds of a metric.
  _level(v, metric) {
    return level(v, threshold(this._config, `${metric}_warning`), threshold(this._config, `${metric}_critical`));
  }

  // Seconds since the router started, from its uptime sensor (a boot date or a duration).
  _uptime(box) {
    return box.scalars.boot ? bootSec(this._s(box.scalars.boot)) : null;
  }

  // Clients connected: the integration's count (or the sum of its wired / wireless / guest counts), else its
  // trackers at home. { n, total, entity } or null.
  _clients(box) {
    const sc = box.scalars;
    // A mesh system whose count is the main unit's own: the sum of every unit's clients.
    const own = box.nodes.find((n) => n.main && n.clients === sc.clients);
    if (own) {
      const vals = box.nodes.map((n) => num(this._s(n.clients))).filter((v) => v !== null);
      return { n: vals.length ? vals.reduce((a, b) => a + b, 0) : null, total: null, entity: refId(sc.clients) };
    }
    const count = this._s(sc.clients);
    if (count) return { n: num(count), total: num(this._s(sc.clients_total)), entity: refId(sc.clients) };
    const parts = ["wired", "wireless", "guest"].map((k) => this._s(sc[k])).filter(Boolean);
    if (parts.length) {
      const vals = parts.map(num).filter((v) => v !== null);
      return { n: vals.length ? vals.reduce((a, b) => a + b, 0) : null, total: null, entity: parts[0].entity_id };
    }
    if (!box.trackers.length) return null;
    // Unavailable / unknown trackers are left out of the count.
    const known = box.trackers.filter((id) => !noValue(this._s(id)));
    return { n: known.length ? known.filter((id) => this._s(id).state === "home").length : null, total: known.length || null, entity: null };
  }

  // Network devices online, as { online, total }, or null without any.
  _nodesUp(box) {
    if (!box.nodes.length) return null;
    return { online: box.nodes.filter((n) => onlineOf(this._s(n.online)) === true).length, total: box.nodes.length };
  }

  // Download / upload rate tile, shared by the full and the mini card.
  _rateTile(id, cls, icon, k, hist) {
    // A tile without its sensor opens no more-info: not focusable.
    const attrs = id ? `clickable ${cls}" role="button" tabindex="0" data-entity="${refId(id)}"` : `${cls}"`;
    return `<div class="tile ${attrs}>${spark(hist?.[id], hist?.end)}${svgIcon(icon)}<div><div class="k">${k}</div><div class="v">${this._rate(
      id
    )}</div></div></div>`;
  }

  _rateTiles(sc, hist) {
    return `${this._rateTile(sc.rate_down, "down", ICONS.down, this._t("download"), hist)}${this._rateTile(sc.rate_up, "up", ICONS.up, this._t("upload"), hist)}`;
  }

  // What the render depends on: registries, language, the states of the router's entities and the minute, for the
  // uptime shown in days, hours and minutes.
  _signature() {
    const h = this._hass;
    const sig = [h.entities, h.devices, h.language, h.locale?.language, h.config?.time_zone];
    const box = boxFor(h, this._config);
    if (!box.id) return sig;
    const refs = [
      ...Object.values(box.scalars),
      ...box.temps.map((x) => x.id),
      ...box.fans.map((x) => x.id),
      ...box.wifi.map((x) => x.id),
      ...box.nodes.flatMap((n) => [n.online, n.clients]),
      ...box.trackers,
    ];
    for (const ref of refs) if (ref) sig.push(h.states[refId(ref)]);
    for (const id of Object.values(speedtestOf(h, box, this._config) || {})) sig.push(h.states[id]);
    if (box.scalars.boot) sig.push(Math.floor(Date.now() / 60e3));
    return sig;
  }

  // 24 h of 5-minute means from the recorder's statistics, fetched again every 5 minutes, as { [id]: [[time, mean]…],
  // end }. Returns what is already there (nothing at first): the card renders again when the answer comes. Only plain
  // entity ids: a value read from an attribute has no statistics.
  _history(refs) {
    const ids = refs.filter((r) => r && !String(r).includes("|"));
    const key = ids.join(",");
    if (key && this._hass.callWS && (this._histKey !== key || Date.now() - this._histAt > HIST_REFRESH)) {
      this._histKey = key;
      const end = Date.now();
      this._histAt = end;
      this._hass
        .callWS({
          type: "recorder/statistics_during_period",
          start_time: new Date(end - HIST_WINDOW).toISOString(),
          statistic_ids: ids,
          period: "5minute",
          types: ["mean"],
        })
        .then((r) => {
          if (this._histKey !== key) return;
          // [time, mean] pairs; the window ends at the request time, so the curves stay put until the next fetch.
          const series = ids.map((id) => [id, (r?.[id] || []).map((p) => [statTime(p), p.mean]).filter(([at, v]) => Number.isFinite(at) && Number.isFinite(v))]);
          this._hist = { ...Object.fromEntries(series), end };
          this._update();
        })
        // No statistics (sensor without state_class, recorder off): try again in a minute, no curve meanwhile.
        .catch(() => {
          this._histAt = Date.now() - HIST_REFRESH + 60000;
        });
    }
    return this._histKey === key ? this._hist : null;
  }

  _update(sig) {
    if (!this._hass || !this._config) return;
    // A press in progress: drawn once released (see _onPressStart).
    if (this._pressing) {
      this._dirty = true;
      return;
    }
    this._sig = sig ?? this._signature();
    let html = this._render();
    // The confirmation popup lives inside the ha-card (positioned over it), added after the content.
    if (this._dialog) html = html.replace(/<\/ha-card>(?![\s\S]*<\/ha-card>)/, `${this._dialogHtml()}</ha-card>`);
    if (html !== this._html) {
      this._html = html;
      morph(this.shadowRoot, html);
    }
  }

  // State of the internet link (WAN): { entity, cls, key }, or null when the router exposes nothing about it.
  _link(box) {
    const s = this._s(box.scalars.wan);
    if (!s) return null;
    const on = onlineOf(s);
    if (on === null) return { entity: refId(box.scalars.wan), cls: "off", key: "unavailable" };
    return { entity: refId(box.scalars.wan), cls: on ? "ok" : "crit", key: on ? "online" : "offline" };
  }

  // Status pill right of the title (WAN state), or "" when the router exposes no WAN state.
  _statusPill(box) {
    const link = this._link(box);
    if (!link) return "";
    const text = `${this._t("wan")} · ${this._t(link.key)}`;
    // The text is also the tooltip and accessible name: on a narrow card only the coloured dot is shown.
    return `<span class="chip status clickable ${link.cls}" role="button" tabindex="0" data-entity="${link.entity}" title="${esc(text)}" aria-label="${esc(
      text
    )}"><span class="dot"></span><span class="txt">${esc(text)}</span></span>`;
  }

  // Info chips under the title: a firmware update waiting.
  _chips(box) {
    const up = this._s(box.scalars.update);
    if (up?.state !== "on") return "";
    return `<div class="chips"><span class="chip warn clickable" role="button" tabindex="0" data-entity="${up.entity_id}">${svgIcon(ICONS.update)}${esc(
      this._t("update_available")
    )}</span></div>`;
  }

  _header(box, full) {
    const c = this._config;
    const dev = box.device;
    const p = box.profile;
    const devName = deviceName(dev);
    const name = c.title || devName || p.name || this._t(`kind_${box.kind}`);
    const adminUrl = /^https?:\/\//i.test(c.admin_url || "") ? c.admin_url : dev?.configuration_url || p.admin || "";
    const firmware = dev?.sw_version;
    // The model is left out when the title already contains it ("Deco X50" over "X50").
    const model = dev?.model && !name.toLowerCase().includes(String(dev.model).toLowerCase()) ? dev.model : null;
    const sub = [model, firmware ? `${this._t("firmware")} ${firmware}` : null].filter(Boolean);
    if (!sub.length) sub.push(p.name || this._t(`kind_${box.kind}`));
    // Icon of the kind of device, tinted with the WAN state (the brand colour without one), with the brand logo as a
    // badge, opening its website.
    const state = this._link(box)?.cls;
    const icon = kindIcon(box.kind);
    const tag = p.website ? "a" : "span";
    const href = p.website ? ` href="${esc(p.website)}" target="_blank" rel="noopener noreferrer"` : "";
    const brand = `<${tag} class="logo-link${state ? ` ${state}` : ""}"${href} title="${esc(p.name || this._t(`kind_${box.kind}`))}">${
      p.logo ? `<img class="logo" src="${p.logo}" alt="${esc(p.name)}">` : ""
    }${icon}</${tag}>`;
    const pic = devicePic(box.kind, p.color);
    const picHtml = `<img class="pic" src="${pic}" alt="${esc(this._t(`kind_${box.kind}`))}">`;
    return `
      <div class="header">
        ${c.show_logo !== false ? brand : ""}
        <div class="titles">
          <div class="name">${esc(name)}</div>
          ${full ? this._statusPill(box) : ""}
          <div class="sub"><div class="parts">${sub.map((x) => `<span>${esc(x)}</span>`).join("")}</div></div>
          ${full ? this._chips(box) : ""}
        </div>
        ${
          c.show_image !== false && pic
            ? adminUrl
              ? `<a class="pic-link" href="${esc(adminUrl)}" target="_blank" rel="noopener noreferrer" title="${esc(this._t("admin"))}">${picHtml}</a>`
              : `<span class="pic-link">${picHtml}</span>`
            : ""
        }
        ${full ? this._restartBtn(box) : ""}
        ${this._headerEnd()}
      </div>`;
  }

  // End of the header, top right (the detail button of the mini card).
  _headerEnd() {
    return "";
  }

  _noBox() {
    return `<style>${BASE_STYLE}</style><ha-card><div class="warning">${esc(
      this._config.device ? `${this._t("unknown_device")}: ${this._config.device}` : this._t("no_device")
    )}</div></ha-card>`;
  }
}

// ---------------------------------------------------------------------------
// Full card
// ---------------------------------------------------------------------------

const ring = (pct) => {
  const r = 26;
  const c = 2 * Math.PI * r;
  const p = pct === null ? 0 : Math.max(0, Math.min(100, pct));
  return `<svg class="ring" viewBox="0 0 64 64">
    <circle cx="32" cy="32" r="${r}" class="track"/>
    <circle cx="32" cy="32" r="${r}" class="value" stroke-dasharray="${((p / 100) * c).toFixed(1)} ${c.toFixed(1)}"/>
  </svg>`;
};

const FULL_STYLE = `
  .content { padding: 0 12px 12px; display: flex; flex-direction: column; gap: 12px; }
  .section-title { display: flex; align-items: center; gap: 6px; font-size: 12px; font-weight: 500; text-transform: uppercase;
                   letter-spacing: .04em; color: var(--secondary-text-color); margin-bottom: 6px; }
  .section-title .icon { width: 16px; height: 16px; }
  .grid2 { display: grid; grid-template-columns: repeat(2, 1fr); gap: 6px; }
  @container (max-width: 260px) { .grid2 { grid-template-columns: minmax(0, 1fr); } }
  .tiles { display: grid; grid-template-columns: repeat(auto-fit, minmax(130px, 1fr)); gap: 6px; }
  .facts { display: flex; flex-wrap: wrap; gap: 4px 12px; font-size: 12px; margin-top: 6px; }
  .facts > span { display: inline-flex; align-items: center; gap: 4px; min-width: 0; }
  .facts .icon { width: 14px; height: 14px; color: var(--secondary-text-color); }
  .gauges { display: grid; grid-template-columns: repeat(auto-fill, minmax(76px, 1fr)); gap: 6px; }
  .gauge { display: flex; flex-direction: column; align-items: center; position: relative; padding: 4px 0 2px; border-radius: 10px; overflow: hidden; }
  .gauge > :not(.spark) { position: relative; }
  /* The 24 h curve of a percentage, on a 0-100 scale, behind its ring. */
  .gauge .spark { position: absolute; left: 0; bottom: 0; width: 100%; height: 50%; pointer-events: none; }
  .ring { width: 52px; height: 52px; transform: rotate(-90deg); }
  .ring circle { fill: none; stroke-width: 6; }
  .ring .track { stroke: var(--divider-color, rgba(127,127,127,.25)); }
  .ring .value { stroke: var(--c, var(--rc-accent)); stroke-linecap: round; transition: stroke-dasharray .6s ease; }
  .gauge .val { position: absolute; top: 4px; height: 52px; display: flex; align-items: center; justify-content: center; }
  .gauge .val b { font-size: 14px; font-weight: 500; }
  .gauge .lbl { font-size: 12px; color: var(--secondary-text-color); margin-top: 0; text-align: center; white-space: nowrap;
                overflow: hidden; text-overflow: ellipsis; max-width: 100%; }
  .fans { margin-top: 8px; gap: 6px; }
  .nodes { display: flex; flex-direction: column; gap: 6px; }
  .node { display: flex; align-items: center; gap: 8px; font-size: 13px; padding: 6px 10px; border-radius: 10px; min-width: 0;
          background: var(--secondary-background-color, rgba(127,127,127,.08)); }
  .node .grow { flex: 1 1 auto; min-width: 5em; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
  .node .muted { flex: 0 1 auto; min-width: 0; font-size: 12px; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
  .node .n { flex: none; font-size: 12px; display: inline-flex; align-items: center; gap: 3px; color: var(--secondary-text-color); }
  .node .n .icon { width: 14px; height: 14px; }
  .node .chip { flex: none; }
  .tile.svc { --c: var(--secondary-text-color); }
  .tile.svc.ok { --c: var(--rc-ok); } .tile.svc.warn { --c: var(--rc-warn); }
  .tiles.svc-row { display: flex; flex-wrap: wrap; }
  .tiles.svc-row .tile { flex: 1 1 auto; }
  .tile:has(.toggle) { padding-right: 6px; }
  .tile .toggle { margin-left: auto; }
  .spin { animation: spin 1.6s linear infinite; }
  @keyframes spin { to { transform: rotate(360deg); } }
  @media (prefers-reduced-motion: reduce) { .spin { animation: none; } .ring .value { transition: none; } }
  /* Full card only (and the zoomed mini, which uses this style): its header also carries the status pill and the
     restart button, so on a narrow card the device picture gets smaller to leave room for the title, then is hidden. */
  @container (max-width: 460px) { .pic { height: 38px; } }
  @container (max-width: 380px) { .pic { height: 32px; } }
  @container (max-width: 340px) { .pic-link { display: none; } }
  /* On a narrow full card the status pill would squeeze the title on its line; move it below the title. */
  @container (max-width: 440px) {
    .titles > .chip.status { grid-column: 1; grid-row: auto; align-self: start; justify-self: start; margin: 4px 0 0; }
  }
  /* Narrower still: only the pill's coloured dot, back on the title line (its text stays its tooltip and label). */
  @container (max-width: 244px) {
    .titles > .chip.status { grid-column: 2; grid-row: 1; align-self: center; justify-self: end; margin: 0 0 0 6px; padding: 5px; }
    .chip.status .txt { display: none; }
  }
  /* At 6 columns of a narrow section: the dot goes to the subtitle line, the title takes the whole first line. */
  @container (max-width: 200px) {
    .titles > .name { grid-column: 1 / -1; }
    .titles > .chip.status { grid-row: 2; }
    /* The zoomed mini card has both the restart and the detail buttons: the logo gives them its place. */
    .header:has(.zoom) .logo-link { display: none; }
  }
`;

class RouterCard extends RouterBase {
  static getConfigElement() {
    return document.createElement("router-card-editor");
  }

  static getStubConfig(hass) {
    const first = hass ? listDevices(hass)[0] : null;
    return first ? { device: first.value } : {};
  }

  getCardSize() {
    return 7;
  }

  // Below 9 columns (about 240 px in a narrow section) the full card's tiles and gauges no longer fit.
  getGridOptions() {
    return { columns: 12, min_columns: 9 };
  }

  _render() {
    const box = boxFor(this._hass, this._config);
    if (!box.id) return this._noBox();
    const c = this._config;
    const sc = box.scalars;
    const hist = c.show_history === false ? null : this._history([sc.rate_down, sc.rate_up, sc.cpu, sc.ram, sc.disk]);
    const parts = [];
    if (c.show_network !== false) parts.push(this._network(box, hist));
    if (c.show_system !== false) parts.push(this._system(box, hist));
    if (c.show_nodes !== false) parts.push(this._nodes(box));
    if (c.show_lan !== false) parts.push(this._lan(box));
    return `<style>${BASE_STYLE}${FULL_STYLE}</style>
      <ha-card style="--rc-brand:${box.profile.color}">
        ${this._header(box, true)}
        <div class="content">${parts.filter(Boolean).join("")}</div>
      </ha-card>`;
  }

  _network(box, hist) {
    const sc = box.scalars;
    const rates = sc.rate_down || sc.rate_up;
    const facts = [];
    const ip4 = this._s(sc.ip);
    const ip6 = this._s(sc.ip6);
    if (ip4 && !noValue(ip4))
      facts.push(
        `<span class="clickable" role="button" tabindex="0" data-entity="${refId(sc.ip)}" title="${esc(ip6 && !noValue(ip6) ? ip6.state : "")}">${svgIcon(
          ICONS.ip
        )}${esc(ip4.state)}</span>`
      );
    const up = this._uptime(box);
    if (up !== null)
      facts.push(
        `<span class="clickable" role="button" tabindex="0" data-entity="${refId(sc.boot)}">${svgIcon(ICONS.timer)}${this._t("uptime")} ${fmtUptime(
          up,
          this._hass,
          this._config
        )}</span>`
      );
    const lat = num(this._s(sc.latency));
    const loss = num(this._s(sc.loss));
    if (lat !== null || loss !== null) {
      const text = [lat !== null ? `${fmtNum(lat, this._hass, this._config, lat < 10 ? 1 : 0)} ms` : "", loss !== null ? `${fmtNum(loss, this._hass, this._config, 1)} % ${this._t("loss")}` : ""]
        .filter(Boolean)
        .join(" · ");
      facts.push(
        `<span class="clickable" role="button" tabindex="0" data-entity="${refId(sc.latency || sc.loss)}" title="${esc(this._t("latency"))}">${svgIcon(ICONS.network)}${esc(text)}</span>`
      );
    }
    const sp = this._config.show_speedtest !== false ? speedtestOf(this._hass, box, this._config) : null;
    if (sp) {
      const dl = this._s(sp.download);
      const ul = this._s(sp.upload);
      const ping = Number.parseFloat(this._s(sp.ping)?.state);
      const spParts = [
        dl ? `↓ ${fmtRate(toBps(dl), this._hass, this._config)}` : "",
        ul ? `↑ ${fmtRate(toBps(ul), this._hass, this._config)}` : "",
        Number.isFinite(ping) ? `${Math.round(ping)} ms` : "",
      ].filter(Boolean);
      const when = (dl || ul)?.last_changed;
      facts.push(
        `<span class="clickable speedtest" role="button" tabindex="0" data-entity="${sp.download || sp.upload}" title="${esc(
          `${this._t("speedtest")}${when ? ` · ${new Date(when).toLocaleString(numLang(this._hass, this._config))}` : ""}`
        )}">${svgIcon(ICONS.speedtest)}${esc(spParts.join(" · "))}</span>`
      );
    }
    if (!rates && !facts.length) return "";
    return `<div>
      <div class="section-title">${svgIcon(ICONS.network)}${this._t("network")}</div>
      ${rates ? `<div class="grid2">${this._rateTiles(sc, hist)}</div>` : ""}
      ${facts.length ? `<div class="facts">${facts.join("")}</div>` : ""}
    </div>`;
  }

  // A ring gauge with its 24 h curve (percentages only) behind it.
  _gauge(ref, pct, text, label, cls, hist, title) {
    const id = refId(ref);
    return `<div class="gauge clickable ${cls}" role="button" tabindex="0" data-key="${esc(ref)}" data-entity="${id}" title="${esc(title || label)}">
        ${hist ? spark(hist[ref], hist.end, 100) : ""}
        ${ring(pct)}
        <div class="val"><b>${text}</b></div>
        <div class="lbl">${esc(label)}</div>
      </div>`;
  }

  _system(box, hist) {
    const sc = box.scalars;
    const gauges = [];
    for (const [slot, label] of [
      ["cpu", "cpu"],
      ["ram", "ram"],
      ["disk", "disk"],
    ]) {
      if (!sc[slot]) continue;
      const v = num(this._s(sc[slot]));
      gauges.push(this._gauge(sc[slot], v, v === null ? "—" : `${Math.round(v)}%`, this._t(label), this._level(v, slot), hist));
    }
    for (const { id, name } of box.temps) {
      // Thresholds and gauge (0-100) in °C, whatever unit the sensor reports; the value in its own unit.
      const { raw, c } = temperature(this._s(id));
      const short = name.replace(/\s*(temperature|temp\.?)\s*/gi, " ").trim();
      gauges.push(this._gauge(id, c, raw === null ? "—" : `${Math.round(raw)}°`, short || this._t("temperature"), this._level(c, "temp"), null, name));
    }
    const fans = box.fans.map(({ id, name }) => {
      const rpm = num(this._s(id));
      return `<div class="tile clickable" role="button" tabindex="0" data-key="${id}" data-entity="${id}">${svgIcon(ICONS.fan, rpm ? "spin" : "")}<div><div class="k">${esc(
        name
      )}</div><div class="v">${rpm === null ? "—" : `${Math.round(rpm)} ${this._t("rpm")}`}</div></div></div>`;
    });
    const load = num(this._s(sc.load));
    const facts =
      load !== null
        ? `<div class="facts"><span class="clickable" role="button" tabindex="0" data-entity="${refId(sc.load)}">${svgIcon(ICONS.chip)}${this._t("load")} ${fmtNum(
            load,
            this._hass,
            this._config,
            2
          )}</span></div>`
        : "";
    if (!gauges.length && !fans.length && !facts) return "";
    return `<div>
      <div class="section-title">${svgIcon(ICONS.chip)}${this._t("system")}</div>
      ${gauges.length ? `<div class="gauges">${gauges.join("")}</div>` : ""}
      ${fans.length ? `<div class="tiles fans">${fans.join("")}</div>` : ""}
      ${facts}
    </div>`;
  }

  // Mesh units, access points and switches of the router, with their state and clients.
  _nodes(box) {
    if (!box.nodes.length) return "";
    const rows = box.nodes.map((n) => {
      const s = this._s(n.online);
      const on = onlineOf(s);
      const cls = !n.online ? "" : on === true ? "ok" : on === false ? "crit" : "off";
      const clients = num(this._s(n.clients));
      const state = n.online ? `<span class="chip ${cls}">${esc(this._t(on === true ? "online" : on === false ? "offline" : noValue(s) ? "unavailable" : "unknown"))}</span>` : "";
      return `<div class="node clickable" role="button" tabindex="0" data-key="${esc(n.id)}" data-entity="${refId(n.entity)}">
        <span class="dot ${cls || "off"}"></span><span class="grow">${esc(n.name || n.model)}${n.main ? ` <span class="muted">· ${esc(this._t("main"))}</span>` : ""}</span>
        ${n.model && n.model !== n.name ? `<span class="muted">${esc(n.model)}</span>` : ""}
        ${clients !== null ? `<span class="n" title="${esc(`${clients} ${this._tn("clients_n", clients)}`)}">${svgIcon(ICONS.devices)}${clients}</span>` : ""}
        ${state}
      </div>`;
    });
    const title = this._t(box.kind === "mesh" ? "mesh" : "network_devices");
    return `<div><div class="section-title">${svgIcon(ICONS.mesh)}${title}</div><div class="nodes">${rows.join("")}</div></div>`;
  }

  // The local network: clients connected (wired / wireless / guest), and a tile per Wi-Fi network with its switch.
  _lan(box) {
    const sc = box.scalars;
    const tiles = [];
    const cl = this._clients(box);
    if (cl) {
      const value = cl.n === null ? this._t("unavailable") : cl.total ? `${cl.n} / ${cl.total}` : `${cl.n}`;
      const split = ["wired", "wireless", "guest"].map((k) => [k, num(this._s(sc[k]))]).filter(([, v]) => v !== null);
      const detail = sc.clients && split.length ? split.map(([k, v]) => `${this._t(k)} ${v}`).join(" · ") : "";
      const attrs = cl.entity ? ` clickable" role="button" tabindex="0" data-entity="${cl.entity}"` : `"`;
      tiles.push(`<div class="tile svc ${cl.n === null ? "off" : "ok"}${attrs} data-key="clients">${svgIcon(ICONS.devices)}<div><div class="k">${this._t("clients")}</div><div class="v">${esc(
        value
      )}</div>${detail ? `<div class="k">${esc(detail)}</div>` : ""}</div></div>`);
    }
    for (const { id, name } of box.wifi) {
      const wifi = this._s(id);
      const on = wifi?.state === "on";
      const unknown = noValue(wifi);
      const label = name.replace(/\b(switch)\b/gi, "").trim() || this._t("wifi");
      // The keyboard target is the label: the switch must not sit inside a role="button".
      tiles.push(`<div class="tile svc clickable ${on ? "ok" : unknown ? "off" : ""}" data-key="${id}" data-entity="${id}">${svgIcon(
        on || unknown ? ICONS.wifi : ICONS.wifi_off
      )}<div role="button" tabindex="0"><div class="k">${esc(label)}</div><div class="v">${this._t(unknown ? "unavailable" : on ? "on" : "off")}</div></div>${this._wifiToggle(
        wifi,
        label
      )}</div>`);
    }
    if (!tiles.length) return "";
    return `<div><div class="section-title">${svgIcon(ICONS.wifi)}${this._t("lan")}</div><div class="tiles svc-row">${tiles.join("")}</div></div>`;
  }
}

// ---------------------------------------------------------------------------
// Mini card
// ---------------------------------------------------------------------------

const MINI_STYLE = `
  :host::before { grid-template-columns: minmax(0, 240px); }
  .pic-link { max-width: 35%; }
  .pic { height: 44px; }
  @container (max-width: 260px) { .pic { height: 28px; } }
  .content { padding: 0 12px 12px; display: flex; flex-direction: column; gap: 8px; }
  .grid2 { display: grid; grid-template-columns: repeat(2, 1fr); gap: 8px; }
  /* Too narrow for two rates side by side: one under the other. */
  @container (max-width: 260px) { .grid2 { grid-template-columns: minmax(0, 1fr); } }
  .tile { padding: 6px 8px; gap: 8px; }
  .foot { display: flex; flex-wrap: wrap; justify-content: space-between; align-items: center; gap: 4px 8px; font-size: 12px;
          color: var(--secondary-text-color); margin-top: 2px; }
  .foot span { display: inline-flex; align-items: center; gap: 3px; }
  .foot .icon { width: 14px; height: 14px; }
  .foot .ok .icon { color: color-mix(in srgb, var(--rc-ok) 60%, var(--primary-text-color)); }
  .foot .warn { color: color-mix(in srgb, var(--rc-warn) 50%, var(--primary-text-color)); }
  .foot .crit { color: color-mix(in srgb, var(--rc-crit) 50%, var(--primary-text-color)); }
`;

// The detail button (top right, `zoom: false` removes it) switches the mini card to the full card, with the
// same configuration, and back; a click anywhere outside the card (or a dialog opened from it) brings it back too.
class RouterMiniCard extends RouterCard {
  static getConfigElement() {
    return document.createElement("router-mini-card-editor");
  }

  constructor() {
    super();
    this._zoomed = false;
    this.shadowRoot.addEventListener("click", (ev) => {
      if (!ev.composedPath().some((n) => n.classList?.contains("zoom"))) return;
      ev.stopPropagation();
      this._zoom(!this._zoomed);
      // Keyboard use (Enter / Space: no click count) keeps the focus on the button of the new view.
      if (ev.detail === 0) this.shadowRoot.querySelector(".zoom")?.focus({ preventScroll: true });
    });
    this._onOutside = (ev) => {
      const path = ev.composedPath();
      // The click that closed the restart popup only closes it.
      if (ev === this._dialogClosingClick) return;
      if (this._zoomed && !path.includes(this) && !inDialog(path)) this._zoom(false);
    };
  }

  connectedCallback() {
    // Listens after the full card's popup listener, which marks the event that closed the popup.
    this._unzoom ??= watchOutside(this, this._onOutside);
    super.connectedCallback?.();
    this._unzoom.on();
  }

  disconnectedCallback() {
    super.disconnectedCallback?.();
    this._unzoom?.off();
    // Back to the compact view once off the screen.
    this._zoomed = false;
  }

  getCardSize() {
    return this._zoomed ? super.getCardSize() : 3;
  }

  getGridOptions() {
    return this._zoomed ? super.getGridOptions() : { columns: 6, min_columns: 6 };
  }

  _zoom(on) {
    if (this._zoomed === on) return;
    this._zoomed = on;
    this._update();
  }

  _headerEnd() {
    if (this._config.zoom === false) return "";
    const label = esc(this._t(this._zoomed ? "zoom_out" : "zoom_in"));
    return `<button class="zoom" title="${label}" aria-label="${label}">${svgIcon(this._zoomed ? ICONS.collapse : ICONS.expand)}</button>`;
  }

  _render() {
    return this._zoomed ? super._render() : this._renderMini();
  }

  _renderMini() {
    const box = boxFor(this._hass, this._config);
    if (!box.id) return this._noBox();
    const c = this._config;
    const sc = box.scalars;
    const parts = [];
    if (c.show_network !== false && (sc.rate_down || sc.rate_up)) {
      // The same 24 h curves as the full card, behind the compact rate tiles.
      const hist = c.show_history === false ? null : this._history([sc.rate_down, sc.rate_up, sc.cpu, sc.ram, sc.disk]);
      parts.push(`<div class="grid2">${this._rateTiles(sc, hist)}</div>`);
    }
    const foot = [];
    const link = this._link(box);
    if (link)
      foot.push(`<span class="clickable ${link.cls}" role="button" tabindex="0" data-key="wan" data-entity="${link.entity}" title="${esc(this._t("wan"))}"><span class="dot"></span>&nbsp;${esc(
        this._t(link.key)
      )}</span>`);
    if (c.show_system !== false) {
      const cpu = num(this._s(sc.cpu));
      if (cpu !== null)
        foot.push(`<span class="clickable ${this._level(cpu, "cpu")}" role="button" tabindex="0" data-key="cpu" data-entity="${refId(sc.cpu)}" title="${esc(this._t("cpu"))}">${svgIcon(
          ICONS.chip
        )}${Math.round(cpu)}%</span>`);
      let hottest = null;
      for (const tmp of box.temps) {
        const v = temperature(this._s(tmp.id));
        if (v.c !== null && (!hottest || v.c > hottest.c)) hottest = { ...v, id: tmp.id };
      }
      if (hottest)
        foot.push(`<span class="clickable ${this._level(hottest.c, "temp")}" role="button" tabindex="0" data-key="hottest" data-entity="${hottest.id}">${svgIcon(ICONS.temp)}${Math.round(
          hottest.raw
        )}${esc(hottest.unit)}</span>`);
    }
    const cl = this._clients(box);
    if (cl && cl.n !== null) {
      const label = `${cl.n} ${this._tn("clients_n", cl.n)}`;
      foot.push(`<span data-key="clients"${cl.entity ? ` class="clickable" role="button" tabindex="0" data-entity="${cl.entity}"` : ""} title="${esc(label)}" aria-label="${esc(label)}">${svgIcon(
        ICONS.devices
      )}${cl.n}</span>`);
    }
    const nodes = this._nodesUp(box);
    if (nodes) {
      const label = `${this._t(box.kind === "mesh" ? "mesh" : "network_devices")} · ${nodes.online} / ${nodes.total}`;
      const cls = nodes.online === nodes.total ? "ok" : "warn";
      foot.push(`<span class="${cls}" data-key="nodes" title="${esc(label)}" aria-label="${esc(label)}">${svgIcon(ICONS.mesh)}${nodes.online}/${nodes.total}</span>`);
    }
    const up = this._uptime(box);
    if (up !== null) foot.push(`<span data-key="uptime">${svgIcon(ICONS.timer)}${fmtUptime(up, this._hass, this._config)}</span>`);
    return `<style>${BASE_STYLE}${MINI_STYLE}</style>
      <ha-card style="--rc-brand:${box.profile.color}">
        ${this._header(box, false)}
        <div class="content">
          ${parts.join("")}
          ${foot.length ? `<div class="foot">${foot.join("")}</div>` : ""}
        </div>
      </ha-card>`;
  }
}

// ---------------------------------------------------------------------------
// Visual editors (ha-form)
// ---------------------------------------------------------------------------

const LANGUAGES = [
  ["en", "English"], ["fr", "Français"], ["de", "Deutsch"], ["es", "Español"], ["sr", "Српски"], ["sr-Latn", "Srpski (latinica)"],
  ["it", "Italiano"], ["nl", "Nederlands"], ["pt", "Português (Portugal)"], ["pl", "Polski"], ["ro", "Română"], ["da", "Dansk"],
  ["sv", "Svenska"], ["bg", "Български"], ["ru", "Русский"], ["uk", "Українська"], ["hu", "Magyar"], ["sk", "Slovenčina"],
  ["cs", "Čeština"], ["sl", "Slovenščina"], ["lv", "Latviešu"], ["el", "Ελληνικά"],
];

class RouterEditorBase extends HTMLElement {
  static get toggles() {
    return [];
  }

  setConfig(config) {
    this._config = { ...config };
    this._render();
  }

  set hass(hass) {
    this._hass = hass;
    this._render();
  }

  _schema() {
    const tr = (k) => t(this._hass, this._config, k);
    const devices = this._hass ? listDevices(this._hass) : [];
    const box = this._hass ? discover(this._hass, this._config.device) : undefined;
    const auto = box?.profile ? `${tr("kind_auto")} (${tr(`kind_${kindOf(box.profile, box.device, {})}`)})` : tr("kind_auto");
    return [
      { name: "device", selector: { select: { mode: "dropdown", custom_value: true, options: devices } } },
      { name: "title", selector: { text: {} } },
      {
        name: "kind",
        selector: { select: { mode: "dropdown", options: [{ value: "", label: auto }, ...Object.keys(DRAWINGS).map((k) => ({ value: k, label: tr(`kind_${k}`) }))] } },
      },
      { name: "admin_url", selector: { text: { type: "url" } } },
      {
        type: "grid",
        name: "",
        schema: [
          { name: "show_title", selector: { boolean: {} } },
          { name: "show_subtitle", selector: { boolean: {} } },
          { name: "show_image", selector: { boolean: {} } },
          { name: "show_logo", selector: { boolean: {} } },
          ...this.constructor.toggles.map((name) => ({ name, selector: { boolean: {} } })),
        ],
      },
      // Warning / critical thresholds, shown at their default values.
      {
        type: "grid",
        name: "",
        schema: Object.keys(THRESHOLDS).map((name) => ({
          name,
          selector: { number: { min: 0, max: name.startsWith("temp") ? 150 : 100, step: 1, mode: "box", unit_of_measurement: name.startsWith("temp") ? "°C" : "%" } },
        })),
      },
      // Sensors of the user's choice, replacing those found on the router (the WAN interface of a MikroTik…), and
      // another speed test than the one found. Saved under `entities`, as the YAML option.
      {
        type: "expandable",
        name: "entities",
        title: tr("entities"),
        schema: [
          ...OWN_KEYS.map((name) => ({ name, selector: { entity: {} } })),
          {
            type: "expandable",
            name: "speedtest",
            title: tr("speedtest"),
            schema: SPEEDTEST_KEYS.map((name) => ({ name, selector: { entity: { domain: "sensor" } } })),
          },
        ],
      },
      {
        name: "rate_unit",
        selector: {
          select: {
            mode: "dropdown",
            options: [
              { value: "bytes", label: tr("unit_bytes") },
              { value: "bits", label: tr("unit_bits") },
            ],
          },
        },
      },
      {
        name: "language",
        selector: { select: { mode: "dropdown", options: [{ value: "", label: tr("lang_auto") }, ...LANGUAGES.map(([value, label]) => ({ value, label }))] } },
      },
    ];
  }

  _render() {
    if (!this._hass || !this._config) return;
    if (!this._form) {
      this._form = document.createElement("ha-form");
      // The pickers of `entities` share their names with no other field: their own labels.
      this._form.computeLabel = (s) => t(this._hass, this._config, EDITOR_ENTITIES.has(s.name) ? `ent_${s.name}` : s.name);
      this._form.computeHelper = (s) => (STRINGS.en[`${s.name}_helper`] ? t(this._hass, this._config, `${s.name}_helper`) : undefined);
      this._form.addEventListener("value-changed", (ev) => {
        ev.stopPropagation();
        const config = { ...ev.detail.value, entities: cleanEntities(ev.detail.value.entities) };
        for (const [k, v] of Object.entries(config)) {
          // Keep the YAML minimal: drop empty values and options left at their default.
          if (v === "" || v === undefined || v === null || ((k.startsWith("show_") || k === "zoom") && v === true) || (k === "rate_unit" && v === "bytes") || THRESHOLDS[k] === v)
            delete config[k];
        }
        this._config = config;
        this.dispatchEvent(new CustomEvent("config-changed", { detail: { config }, bubbles: true, composed: true }));
      });
      this.appendChild(this._form);
    }
    // No device set: the card shows the first one found, so the editor selects it and writes it to the config.
    if (!this._config.device) {
      const first = listDevices(this._hass)[0]?.value;
      if (first) {
        this._config = { ...this._config, device: first };
        this.dispatchEvent(new CustomEvent("config-changed", { detail: { config: this._config }, bubbles: true, composed: true }));
      }
    }
    const data = { rate_unit: "bytes", kind: "", ...THRESHOLDS, ...this._config };
    for (const name of ["show_title", "show_subtitle", "show_image", "show_logo", ...this.constructor.toggles]) if (data[name] === undefined) data[name] = true;
    this._form.hass = this._hass;
    this._form.data = data;
    // The schema is rebuilt on every hass update (every state change) but only handed to the form when its options
    // (devices, detected kind, language) changed, so ha-form does not re-render for nothing.
    const schema = this._schema();
    const key = JSON.stringify(schema);
    if (key !== this._schemaKey) {
      this._schemaKey = key;
      this._form.schema = schema;
    }
  }
}

class RouterCardEditor extends RouterEditorBase {
  static get toggles() {
    return ["show_network", "show_history", "show_speedtest", "show_system", "show_nodes", "show_lan"];
  }
}

class RouterMiniCardEditor extends RouterEditorBase {
  static get toggles() {
    return ["show_network", "show_history", "show_system", "zoom"];
  }
}

// ---------------------------------------------------------------------------
// Registration
// ---------------------------------------------------------------------------

const define = (name, cls) => {
  if (!customElements.get(name)) customElements.define(name, cls);
};
define("router-card", RouterCard);
define("router-mini-card", RouterMiniCard);
define("router-card-editor", RouterCardEditor);
define("router-mini-card-editor", RouterMiniCardEditor);

window.customCards = window.customCards || [];
for (const card of [
  {
    type: "router-card",
    name: "Router Card",
    description:
      "Monitor a firewall, router or mesh Wi-Fi system (Firewalla, OPNsense, pfSense, UniFi, TP-Link Deco and Omada, MikroTik, ASUS, NETGEAR, OpenWrt, GL.iNet, eero, Linksys Velop…): WAN, download / upload, CPU, RAM, temperatures, mesh units, clients and Wi-Fi.",
  },
  {
    type: "router-mini-card",
    name: "Router Mini Card",
    description: "Compact firewall, router or mesh Wi-Fi overview: download / upload, WAN, CPU, temperature, clients, mesh units and uptime, with a button to show the full card.",
  },
]) {
  if (!window.customCards.some((c) => c.type === card.type))
    window.customCards.push({ ...card, preview: true, documentationURL: "https://github.com/juju35/ha-router-card" });
}

console.info(
  `%c ROUTER-CARD %c v${VERSION} `,
  "color: white; background: #455a64; font-weight: 700;",
  "color: #455a64; background: white; font-weight: 700;"
);
