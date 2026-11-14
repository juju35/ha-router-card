# Changelog

## 1.1.0 - 2026-11-14

### Features
- **Cudy** ([#9](https://github.com/juju35/ha-router-card/issues/9), requested by @scmsohel): the [Cudy Router](https://github.com/usersaynoso/ha-cudy-router) integration (`cudy_router`, custom) is supported — WR3000, WR1300 and the other Cudy routers it reads. Its entities have English names and no translation keys: the total download / upload speed (not the top downloader's), CPU, RAM, uptime, public IP, clients, the 2.4 / 5 GHz Wi-Fi switches, restart and the mesh units are found from their words.

### Fixes
- A count of mesh units ("Mesh devices connected") is no longer taken for the connected clients, and the settings switches of a Wi-Fi network (hidden network, separate / isolated clients) are no longer listed as Wi-Fi networks.

## 1.0.2 - 2026-11-13

### Fixes
- Folding back on a tap elsewhere now works on iOS (Safari and the companion app): a tap on something that is not clickable sent no click to the page, so what a click elsewhere folds (unfolded sections, the detailed view of the mini card, popups) stayed open. The press and the release are caught instead; a slider dragged out of the card and a scroll do not fold anything.
- Leaving the card (another dashboard view, a conditional card hidden) brings it back in its default state.
- A click could do nothing: Home Assistant updates the card several times a second, and a rewrite of the card between the press and the release replaced the element pressed, so that the click was lost. The card is no longer rewritten while a press is in progress; the pending update is drawn right after the click.

## 1.0.1 - 2026-11-13

### Fixes
- **eero**: the header shows the eero logo as a badge, missing in 1.0.0.

## 1.0.0 - 2026-11-12

First release: generic Lovelace cards for firewalls, routers and mesh Wi-Fi systems, asked for Firewalla ([juju35/ha-internet-box-card#105](https://github.com/juju35/ha-internet-box-card/issues/105)) and TP-Link Deco ([juju35/ha-internet-box-card#106](https://github.com/juju35/ha-internet-box-card/issues/106)) by ssilence5.

### Features
- **Router Card** (`custom:router-card`) and **Router Mini Card** (`custom:router-mini-card`), with a detail button that shows the full card in place of the mini card.
- Supported integrations: Firewalla Local, OPNsense, pfSense, UniFi Network, TP-Link Omada, TP-Link Deco, TP-Link router, MikroTik (core and MikroTik Router), ASUSWRT and AsusRouter, NETGEAR, Keenetic NDMS2, OpenWrt, LuCI, GL.iNet, Xiaomi Mi Wi-Fi, eero, Linksys Velop and Ruckus Unleashed; any other router integration by setting its device.
- Discovery by the integration's translation keys and attributes, then by the kind and the words of each entity, in any language.
- WAN state, download / upload rates with their 24 h curves, WAN IP, uptime, latency and packet loss, last speed test.
- CPU, RAM and disk gauges with their 24 h curves, temperatures, fans, load average.
- Mesh units, access points and switches with their state and clients; connected clients; Wi-Fi switches, turned off after a confirmation.
- Restart button with a confirmation popup, firmware update chip.
- Thresholds for CPU, RAM, disk and temperatures; sensors of your choice (`entities`); kind of device (`kind`).
- Visual editor, light and dark themes, 22 languages loaded on demand.
