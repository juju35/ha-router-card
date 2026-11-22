# Changelog

## 1.5.2 - 2026-11-22

### Performance
- Card picker: the cards no longer ask Home Assistant for a live preview (`preview: false` in `window.customCards`). The picker drew every card at once (history requests, animations), which made the list slow to open; it now shows each card's description instead.

## 1.5.1 - 2026-11-21

### Fixes
- **Network devices** (#24): an access point of OpenWrt ubus showed the first byte of its BSSID as its client count. A device's sensor without translation key matched the clients key of an integration that has none, so the first sensor without unit was taken; the clients sensor must now name clients and hold a number. A count unit (`clients`, `devices`, `hosts`…) is accepted, so OpenWrt ubus's `connected_clients` (unit `clients`) is the one counted, on the router as on its access points.
- A network device with no state entity (OpenWrt ubus access points) no longer shows a grey dot as if its state were unknown, and is left out of the "online / total" count in the mini card's footer instead of counting as offline.

## 1.5.0 - 2026-11-20

### Features
- **System gauges as tiles**: the CPU, RAM, disk and temperature gauges each sit in a neutral tile (the calm look of the rate tiles), the 24 h curve in an 18 px band at the tile's foot; every gauge tile has the same height, temperatures included, so the curves no longer look like a detached strip under the row.
- The Router Mini Card's visual editor also offers **Speed test**, **Network devices** and **LAN** (`show_speedtest`, `show_nodes`, `show_lan`): its detail view is the full card, which shows them (README: "both").

### Performance
- The registry index counts the states once per states object (shared by every card on the page) and without building a key array, no longer on every card's `hass` update.
- The Speedtest.net / Fast.com sensors are looked up once per registry and set of states, no longer through every entity of Home Assistant on each state change.
- The visual editor hands its data to the form only when the configuration changes, and builds its schema (devices, detected kind) only when the registries, the device or the language change, no longer on every state change.

### Fixes
- Router Mini Card: its height follows its content (`rows: "auto"`, compact or zoomed) and it asks the view to re-measure it when it expands or collapses, like the sibling mini cards.
- System section: the gauges keep four to a row down to a 300 px card (64 px minimum width instead of 76 px), no longer 3 + 1.
- Entity ids are escaped in the card's attributes like every other value (ids from the `entities` option included).
- Leaving the page also cancels a pending header measurement.

### Maintenance
- The unit tests report the card's own coverage; new tests for the Speedtest.net and Fast.com fallback and for the editor.

## 1.3.0 - 2026-11-18

### Features
- **MikroTik Extended** ([#14](https://github.com/juju35/ha-router-card/issues/14), requested by @MackoMici): the [MikroTik Extended](https://github.com/Csontikka/ha-mikrotik-extended) integration (`mikrotik_extended`, custom), a fork of MikroTik Router, is supported with the MikroTik logo — CPU, memory, disk, temperatures, fans, uptime, clients and firmware update on the router, the rates and connection of the WAN interface from its interface device; its interfaces, routes, WireGuard peers and LTE modem are not listed as network devices.

## 1.2.1 - 2026-11-18

### Fixes
- Illustrated header: `auto` now follows the Home Assistant theme alone — a light theme keeps the day picture after sunset, a dark theme still shows the night one.

## 1.2.0 - 2026-11-17

### Features
- **Illustrated header** on the full and mini cards (90 px): a network scene with the WAN cable arriving into the device's own drawing (firewall, router, mesh unit or access point, in the brand's colour), standing on a network ground strip, with Wi-Fi waves and packets travelling to the connected clients. WAN down: the cable is cut in red with a cross, links and waves grey, a red-dashed strip; WAN unavailable: everything grey. The header icon keeps the WAN state colour and the brand logo badge; the WAN state is the status pill right after the title, and the firmware update pill after it, only while the whole title and the pills' whole labels fit on that row (measured in the real fonts, so in every language), otherwise on their own line under a one-line subtitle, keeping their dot or icon alone when even that would not fit above the ground strip and at 200 px or less, on the mini card too (the classic header follows the same rule, its pill right after the title rather than in a column at the right); the subtitle shows the clients connected, model and firmware. Night version when the sun is below the horizon or with a dark theme (even while the sun is up), forced with `illustration_theme: day | night`; animations stop with reduced motion; `illustration: false` brings back the classic header. Both options are in the visual editors.
- The detail button of the mini card sits in the top right corner of the banner (round, frosted), the restart button on its left on the same line.

### Fixes
- The 24 h sparklines no longer run under the text: the download / upload tiles and the CPU / RAM gauges draw theirs in a 24 px band of their own under the rate or the ring and its label.

## 1.1.0 - 2026-11-14

### Features
- **Cudy** ([#9](https://github.com/juju35/ha-router-card/issues/9), requested by @scmsohel): the [Cudy Router](https://github.com/usersaynoso/ha-cudy-router) integration (`cudy_router`, custom) is supported, with its logo — WR3000, WR1300 and the other Cudy routers it reads. Its entities have English names and no translation keys: the total download / upload speed (not the top downloader's), CPU, RAM, uptime, public IP, clients, the 2.4 / 5 GHz Wi-Fi switches, restart and the mesh units are found from their words.

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
