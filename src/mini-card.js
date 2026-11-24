// ---------------------------------------------------------------------------
// Mini card
// ---------------------------------------------------------------------------
import { ICONS, svgIcon } from "./pictures.js";
import { esc, fmtUptime, inDialog, num, temperature, watchOutside } from "./helpers.js";
import { boxFor, refId } from "./entity-discovery.js";
import { BANNER_STYLE, BASE_STYLE } from "./shared-styles.js";
import { RouterCard } from "./full-card.js";

export const MINI_STYLE = `
  :host::before { grid-template-columns: minmax(0, 240px); }
  /* Classic header: only the status pill's dot on a card of 200 px or less. */
  @container (max-width: 200px) { .chip.status { padding: 5px; } .chip.status .txt { display: none; } }
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
export class RouterMiniCard extends RouterCard {
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

  // Height follows the content (compact or zoomed), as the sibling mini cards.
  getGridOptions() {
    return { ...(this._zoomed ? super.getGridOptions() : { columns: 6, min_columns: 6 }), rows: "auto" };
  }

  _zoom(on) {
    if (this._zoomed === on) return;
    this._zoomed = on;
    this._update();
    // Lets a masonry / sections view re-measure the card after the switch.
    this.dispatchEvent(new CustomEvent("iron-resize", { bubbles: true, composed: true }));
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
      foot.push(`<span class="clickable ${link.cls}" role="button" tabindex="0" data-key="wan" data-entity="${esc(link.entity)}" title="${esc(this._t("wan"))}"><span class="dot"></span>&nbsp;${esc(
        this._t(link.key)
      )}</span>`);
    if (c.show_system !== false) {
      const cpu = num(this._s(sc.cpu));
      if (cpu !== null)
        foot.push(`<span class="clickable ${this._level(cpu, "cpu")}" role="button" tabindex="0" data-key="cpu" data-entity="${esc(refId(sc.cpu))}" title="${esc(this._t("cpu"))}">${svgIcon(
          ICONS.chip
        )}${Math.round(cpu)}%</span>`);
      let hottest = null;
      for (const tmp of box.temps) {
        const v = temperature(this._s(tmp.id));
        if (v.c !== null && (!hottest || v.c > hottest.c)) hottest = { ...v, id: tmp.id };
      }
      if (hottest)
        foot.push(`<span class="clickable ${this._level(hottest.c, "temp")}" role="button" tabindex="0" data-key="hottest" data-entity="${esc(hottest.id)}">${svgIcon(ICONS.temp)}${Math.round(
          hottest.raw
        )}${esc(hottest.unit)}</span>`);
    }
    const cl = this._clients(box);
    if (cl && cl.n !== null) {
      const label = `${cl.n} ${this._tn("clients_n", cl.n)}`;
      foot.push(`<span data-key="clients"${cl.entity ? ` class="clickable" role="button" tabindex="0" data-entity="${esc(cl.entity)}"` : ""} title="${esc(label)}" aria-label="${esc(label)}">${svgIcon(
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
    return `<style>${BASE_STYLE}${MINI_STYLE}${c.illustration !== false ? BANNER_STYLE : ""}</style>
      <ha-card style="--rc-brand:${box.profile.color}">
        ${this._header(box, false)}
        <div class="content">
          ${parts.join("")}
          ${foot.length ? `<div class="foot">${foot.join("")}</div>` : ""}
        </div>
      </ha-card>`;
  }
}
