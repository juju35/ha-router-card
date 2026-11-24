// ---------------------------------------------------------------------------
// Registration
// ---------------------------------------------------------------------------
import { pickerDefine } from "./card-picker.js";
import { VERSION } from "./core.js";
import { RouterCard } from "./full-card.js";
import { RouterMiniCard } from "./mini-card.js";
import { RouterCardEditor, RouterMiniCardEditor } from "./visual-editors.js";

export const define = (name, cls) => {
  if (!customElements.get(name)) pickerDefine(name, cls);
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
