// ---------------------------------------------------------------------------
// Pictures: neutral drawings of a kind of device (not of a given product), in the brand's accent colour
// ---------------------------------------------------------------------------
import { esc } from "./helpers.js";
import { STRINGS } from "./i18n/strings.js";

export const svgDoc = (w, h, defs, body) => `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${w} ${h}"><defs>${defs}</defs>${body}</svg>`;
export const grad = (id, stops, x2 = 0, y2 = 1) =>
  `<linearGradient id="${id}" x1="0" y1="0" x2="${x2}" y2="${y2}">${stops.map(([o, c]) => `<stop offset="${o}" stop-color="${c}"/>`).join("")}</linearGradient>`;

// Firewall appliance: a low, wide dark box seen from the front and slightly above, a row of network ports, a column
// of status lights in the accent colour and a vented right side.
export const firewallSvg = ({ accent } = {}) => {
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
export const routerSvg = ({ accent } = {}) => {
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
export const meshSvg = ({ accent } = {}) => {
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
export const apSvg = ({ accent } = {}) => {
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

export const DRAWINGS = { firewall: firewallSvg, router: routerSvg, mesh: meshSvg, ap: apSvg };
export const svgUri = (svg) => `data:image/svg+xml,${encodeURIComponent(svg)}`;
// Pictures by kind of device, neutral (the README pictures), and in the brand's accent colour, each built once.
export const IMG_DEVICE = Object.fromEntries(Object.entries(DRAWINGS).map(([k, f]) => [k, svgUri(f())]));
export const _tinted = new Map();
export const devicePic = (kind, accent) => {
  if (!DRAWINGS[kind]) return undefined;
  if (!accent) return IMG_DEVICE[kind];
  const key = `${kind}|${accent}`;
  if (!_tinted.has(key)) _tinted.set(key, svgUri(DRAWINGS[kind]({ accent })));
  return _tinted.get(key);
};

// ---------------------------------------------------------------------------
// Illustrated header: a network scene at the right of the 90 px banner (200 × 80 picture over a 10 px ground
// strip): the WAN cable arriving from the left into the device, the device's own picture (above) standing on the
// strip, Wi-Fi waves and links to three connected clients with packets travelling on them. WAN down: the cable is
// cut (dashed red, a red cross), links and waves grey, no packets. The left of the banner is the card's text.
// ---------------------------------------------------------------------------

// Dots of the background grid (a faint network pattern), built once.
export const RC_DOTS = (() => {
  const d = [];
  for (let y = 6; y < 60; y += 6) for (let x = 86; x < 200; x += 6) if ((x * 7 + y * 13) % 11 < 6) d.push(`<circle cx="${x}" cy="${y}" r=".9"/>`);
  return d.join("");
})();
// Clients: laptop, phone, TV, as [x, y, outline].
export const RC_CLIENTS = [
  [110, 22, "M-5 -3 h10 v6 h-10z M-7 3 h14"],
  [132, 12, "M-3 -5 h6 v10 h-6z"],
  [184, 16, "M-6 -4 h12 v7 h-12z M-2 5 h4"],
];
// Bounding box of each drawing in its own picture (x, y, width, height):
// the device is cut to its box and fitted in 78 × 46, centred at x 158, its shadow on the strip.
export const RC_ART = { firewall: [32, 82, 236, 77], router: [58, 26, 184, 132], mesh: [90, 16, 120, 162], ap: [32, 46, 236, 110] };

// Device placed in the scene: { x, y, w, h, vb } in scene units.
export const rcPlace = (kind) => {
  const [bx, by, bw, bh] = RC_ART[kind] || RC_ART.router;
  const m = Math.max(bw, bh) * 0.03;
  const vb = [bx - m, by - m, bw + 2 * m, bh + 2 * m];
  let h = 46;
  let w = (h * vb[2]) / vb[3];
  if (w > 78) {
    w = 78;
    h = (w * vb[3]) / vb[2];
  }
  const r = (v) => Math.round(v * 10) / 10;
  return { x: r(158 - w / 2), y: r(78 - h), w: r(w), h: r(h), vb: vb.map(r).join(" ") };
};

// The device's picture cut to its drawing (its viewBox set to the drawing's box), built once per picture.
export const _cropped = new Map();
export const rcCrop = (pic, vb) => {
  const key = `${vb}|${pic}`;
  if (!_cropped.has(key)) {
    const svg = decodeURIComponent(pic.slice(pic.indexOf(",") + 1)).replace(/viewBox="[^"]*"/, `viewBox="${vb}"`);
    _cropped.set(key, svgUri(svg));
  }
  return _cropped.get(key);
};

/**
 * The scene's SVG. `state`: "ok" (WAN up, or no WAN sensor), "down" (WAN down) or "off" (WAN unavailable); `pic`
 * the device's picture (none: no device), `href` the admin address opened by a click on the device. `uid` keeps
 * the ids of each card apart on a page with several cards.
 */
export const rcSceneSvg = ({ uid, state, kind, pic, href, label }) => {
  const live = state === "ok";
  const links = RC_CLIENTS.map(([x, y, d], i) => {
    const path = `M160 52 Q${(160 + x) / 2} ${y + 10} ${x} ${y + 6}`;
    const pkt = live ? `<circle class="rc-pkt" r="1.4" style="offset-path:path('${path}');animation-duration:${(1.4 + i * 0.4).toFixed(1)}s"/>` : "";
    return `<path class="rc-link" d="${path}"/>${pkt}<g transform="translate(${x} ${y})"><circle class="rc-client" r="8"/><path class="rc-client-ln" d="${d}"/></g>`;
  }).join("");
  let dev = "";
  if (pic) {
    const p = rcPlace(kind);
    const img = `<image class="rc-dev" href="${rcCrop(pic, p.vb)}" x="${p.x}" y="${p.y}" width="${p.w}" height="${p.h}" preserveAspectRatio="xMidYMax meet"/>`;
    dev = href ? `<a href="${esc(href)}" target="_blank" rel="noopener noreferrer"><title>${esc(label)}</title>${img}</a>` : img;
  }
  return `<svg class="rc-scene ${state}" viewBox="0 0 200 80" preserveAspectRatio="xMaxYMax meet" aria-hidden="true" focusable="false">
    <defs><radialGradient id="rc-glow-${uid}"><stop offset="0" stop-color="#2fd0ff" stop-opacity=".35"/><stop offset="1" stop-color="#2fd0ff" stop-opacity="0"/></radialGradient></defs>
    <g class="rc-dots">${RC_DOTS}</g>
    ${live ? `<ellipse class="rc-glow" cx="158" cy="50" rx="34" ry="26" fill="url(#rc-glow-${uid})"/>` : ""}
    <path class="rc-cable" d="M80 70 H150"/><path class="rc-wan" d="M80 70 H150"/>
    ${links}
    <g class="rc-waves" transform="translate(160 40)"><path class="w1" d="M-6 -4 a8 8 0 0 1 12 0"/><path class="w2" d="M-11 -9 a15 15 0 0 1 22 0"/><path class="w3" d="M-16 -14 a22 22 0 0 1 32 0"/></g>
    ${state === "down" ? '<g class="rc-cut" transform="translate(116 70)"><circle r="6"/><path d="M-2.6 -2.6 l5.2 5.2 M2.6 -2.6 l-5.2 5.2"/></g>' : ""}
    ${dev}
  </svg>`;
};

// Night picture: forced by illustration_theme, else Home Assistant's dark mode alone (a light theme keeps the day
// picture after sunset).
export const rcIsNight = (hass, config) => {
  const theme = config?.illustration_theme;
  if (theme === "night") return true;
  if (theme === "day") return false;
  return !!hass?.themes?.darkMode;
};

export const ICONS = {
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
export const KIND_ICONS = {
  firewall: '<path class="ln" d="M12 2.5 4.5 5.5V11c0 4.6 3.2 8.6 7.5 10 4.3-1.4 7.5-5.4 7.5-10V5.5Z"/><path class="ln" d="m8.5 12 2.5 2.5 4.5-5"/>',
  router: '<rect x="3" y="13" width="18" height="7" rx="2"/><circle class="led" cx="7" cy="16.5" r="1.1"/><circle class="led" cx="10.5" cy="16.5" r="1.1"/><path class="ln" d="M7 13V5M17 13V5M12 13V8"/>',
  mesh: '<circle cx="12" cy="5.5" r="2.6"/><circle cx="5" cy="17.5" r="2.6"/><circle cx="19" cy="17.5" r="2.6"/><path class="ln" d="M10.6 7.8 6.4 15.2M13.4 7.8l4.2 7.4M7.6 17.5h8.8"/>',
  ap: '<ellipse cx="12" cy="17" rx="8" ry="3"/><path class="ln" d="M8.5 9.5a5 5 0 0 1 7 0M6 7a8.5 8.5 0 0 1 12 0"/><circle cx="12" cy="12.2" r="1.3"/>',
};
export const kindIcon = (kind) => `<svg class="icon type" viewBox="0 0 24 24" aria-hidden="true">${KIND_ICONS[kind] || KIND_ICONS.router}</svg>`;
// The whole width of an element's text in its own font, an ellipsised one included.
export const textWidth = (el) => {
  const range = document.createRange();
  range.selectNodeContents(el);
  return range.getBoundingClientRect().width;
};

export const svgIcon = (path, cls = "") => `<svg class="icon ${cls}" viewBox="0 0 24 24"><path d="${path}"/></svg>`;


// Units of the data rates, by language (base 1000).
export const RATE_UNITS = Object.fromEntries(
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
export const UNIFI_KINDS = [
  { kind: "router", re: /\b(udm|udr|uxg|usg|ucg|udw|ux\b|ugw|efg|dream|gateway|cloud gateway|express)/i },
  { kind: "ap", re: /\b(uap|u6|u7|e7|ual|uac|uk-|nanohd|flexhd|beacon|mesh|in-wall|\bac\b|\bap\b)/i },
];
export const OMADA_KINDS = [
  { kind: "router", re: /\b(er\d|gateway|dr\d)/i },
  { kind: "ap", re: /\b(eap|access point)/i },
];
export const PROFILES = {
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
  mikrotik_extended: {
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
  // Cudy (ha-cudy-router, custom): English names without translation keys, found from their words.
  cudy_router: {
    name: "Cudy", kind: "router", color: "#0097d6", logo: "__IMG_FILE:cudy.png__",
    website: "https://www.cudy.com", admin: "http://192.168.10.1",
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
export const GENERIC_PROFILE = { name: "", kind: "router", color: "#607d8b", logo: "", website: "", admin: null };
export const profileOf = (platform) => (platform && PROFILES[platform] ? { platform, ...PROFILES[platform] } : { ...GENERIC_PROFILE, platform });
