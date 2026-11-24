// ---------------------------------------------------------------------------
// Full card
// ---------------------------------------------------------------------------
import { ICONS, svgIcon } from "./pictures.js";
import { esc, fmtNum, fmtRate, fmtUptime, noValue, num, numLang, onlineOf, temperature, toBps } from "./helpers.js";
import { boxFor, listDevices, refId, speedtestOf } from "./entity-discovery.js";
import { BANNER_STYLE, BASE_STYLE, RouterBase, spark } from "./shared-styles.js";

export const ring = (pct) => {
  const r = 26;
  const c = 2 * Math.PI * r;
  const p = pct === null ? 0 : Math.max(0, Math.min(100, pct));
  return `<svg class="ring" viewBox="0 0 64 64">
    <circle cx="32" cy="32" r="${r}" class="track"/>
    <circle cx="32" cy="32" r="${r}" class="value" stroke-dasharray="${((p / 100) * c).toFixed(1)} ${c.toFixed(1)}"/>
  </svg>`;
};

export const FULL_STYLE = `
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
  .gauges { display: grid; grid-template-columns: repeat(auto-fill, minmax(64px, 1fr)); gap: 6px; }
  /* Each gauge is a neutral tile (the "B calm" look of the rate tiles); every tile has the same height, with or without
     a curve, so a row of CPU / RAM / temperatures lines up. */
  .gauge { display: flex; flex-direction: column; align-items: center; position: relative; padding: 6px 0 22px; border-radius: 10px; overflow: hidden;
           background: var(--secondary-background-color, rgba(127,127,127,.08)); }
  .gauge > :not(.spark) { position: relative; }
  /* The 24 h curve of a percentage, on a 0-100 scale, in an 18 px band at the tile's foot, under the ring and the label. */
  .gauge .spark { position: absolute; inset: auto 0 0; width: 100%; height: 18px; pointer-events: none; }
  .ring { width: 52px; height: 52px; transform: rotate(-90deg); }
  .ring circle { fill: none; stroke-width: 6; }
  .ring .track { stroke: var(--divider-color, rgba(127,127,127,.25)); }
  .ring .value { stroke: var(--c, var(--rc-accent)); stroke-linecap: round; transition: stroke-dasharray .6s ease; }
  .gauge .val { position: absolute; top: 6px; height: 52px; display: flex; align-items: center; justify-content: center; }
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
  /* Only the pill's coloured dot on a card of 200 px or less (its text stays its tooltip and label). */
  @container (max-width: 200px) {
    .header:not(.banner) .chip.status { padding: 5px; }
    .header:not(.banner) .chip.status .txt { display: none; }
    /* The zoomed mini card has both the restart and the detail buttons: the logo gives them its place. */
    .header:has(.zoom) .logo-link { display: none; }
  }
`;

export class RouterCard extends RouterBase {
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
    return `<style>${BASE_STYLE}${FULL_STYLE}${c.illustration !== false ? BANNER_STYLE : ""}</style>
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
        `<span class="clickable" role="button" tabindex="0" data-entity="${esc(refId(sc.ip))}" title="${esc(ip6 && !noValue(ip6) ? ip6.state : "")}">${svgIcon(
          ICONS.ip
        )}${esc(ip4.state)}</span>`
      );
    const up = this._uptime(box);
    if (up !== null)
      facts.push(
        `<span class="clickable" role="button" tabindex="0" data-entity="${esc(refId(sc.boot))}">${svgIcon(ICONS.timer)}${this._t("uptime")} ${fmtUptime(
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
        `<span class="clickable" role="button" tabindex="0" data-entity="${esc(refId(sc.latency || sc.loss))}" title="${esc(this._t("latency"))}">${svgIcon(ICONS.network)}${esc(text)}</span>`
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
        `<span class="clickable speedtest" role="button" tabindex="0" data-entity="${esc(sp.download || sp.upload)}" title="${esc(
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

  // A ring gauge in a neutral tile, with its 24 h curve (percentages only) at the tile's foot.
  _gauge(ref, pct, text, label, cls, hist, title) {
    const id = refId(ref);
    return `<div class="gauge clickable ${cls}" role="button" tabindex="0" data-key="${esc(ref)}" data-entity="${esc(id)}" title="${esc(title || label)}">
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
      return `<div class="tile clickable" role="button" tabindex="0" data-key="${id}" data-entity="${esc(id)}">${svgIcon(ICONS.fan, rpm ? "spin" : "")}<div><div class="k">${esc(
        name
      )}</div><div class="v">${rpm === null ? "—" : `${Math.round(rpm)} ${this._t("rpm")}`}</div></div></div>`;
    });
    const load = num(this._s(sc.load));
    const facts =
      load !== null
        ? `<div class="facts"><span class="clickable" role="button" tabindex="0" data-entity="${esc(refId(sc.load))}">${svgIcon(ICONS.chip)}${this._t("load")} ${fmtNum(
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
      return `<div class="node clickable" role="button" tabindex="0" data-key="${esc(n.id)}" data-entity="${esc(refId(n.entity))}">
        <span class="dot ${cls || "blank"}"></span><span class="grow">${esc(n.name || n.model)}${n.main ? ` <span class="muted">· ${esc(this._t("main"))}</span>` : ""}</span>
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
      const attrs = cl.entity ? ` clickable" role="button" tabindex="0" data-entity="${esc(cl.entity)}"` : `"`;
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
      tiles.push(`<div class="tile svc clickable ${on ? "ok" : unknown ? "off" : ""}" data-key="${id}" data-entity="${esc(id)}">${svgIcon(
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
