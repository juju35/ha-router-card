// ---------------------------------------------------------------------------
// Shared styles
// ---------------------------------------------------------------------------
import { ICONS, devicePic, kindIcon, rcIsNight, rcSceneSvg, svgIcon, textWidth } from "./pictures.js";
import { CONFIRM_GUARD_MS, bootSec, esc, fireMoreInfo, fmtRate, level, morph, noValue, num, onlineOf, sameSig, t, threshold, tn, toBps, watchOutside } from "./helpers.js";
import { boxFor, deviceName, refId, speedtestOf, stateOf } from "./entity-discovery.js";

export const BASE_STYLE = `
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
  .dot.blank { visibility: hidden; }
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
  /* The status pill right after the title (8 px), centred on it; the subtitle and chips under them. Narrow cards: the
     device picture gets smaller (hidden up to 340 px on the full card), the status pill goes under the subtitle when
     the whole title and its whole label do not fit on one line (measured by the card, see _fitPill; only its dot at
     200 px or less) and the icon buttons never shrink. */
  .titles { flex: 1 1 0; min-width: 48px; display: flex; flex-wrap: wrap; align-items: center; column-gap: 8px; }
  :host([hide-title]) .titles .name, :host([hide-subtitle]) .titles > .sub { display: none; }
  .titles > * { flex: 1 0 100%; min-width: 0; }
  .trow { display: contents; }
  .trow > .name { flex: 0 1 auto; min-width: 0; max-width: 100%; }
  .trow > .chip.status { flex: none; white-space: nowrap; min-width: 0; max-width: 100%; }
  .titles > .sub { order: 5; }
  .titles > .chips { order: 7; }
  .titles.below .trow > .chip.status { order: 6; margin-top: 4px; }
  /* Even on a line of its own the whole label does not fit: its dot alone (the text stays its tooltip and label). */
  .titles.pill-dot .chip.status { padding: 5px; }
  .titles.pill-dot .chip.status .txt { display: none; }
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
  /* 24 h curve in its own 24 px band under the icon and the text, never behind them. */
  .tile:has(> .spark) { padding-bottom: 30px; }
  .tile .spark { position: absolute; inset: auto 0 0; width: 100%; height: 24px; pointer-events: none; }
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

// Illustrated header (illustration: true, the default): 90 px banner, the text on the left over the background,
// the network scene on the right (200 × 80, smaller on a narrow card, hidden on a very narrow one) over a 10 px
// ground strip, edge to edge. Day and night (.night) colours; the icon keeps the WAN state colour.
export const BANNER_STYLE = `
  .banner { position: relative; overflow: hidden; height: 90px; padding: 0; box-sizing: border-box; display: block;
            --rc-sky-text: #0d2a45; --rc-sky-muted: #3b5b78; background: #eaf2fb; color: var(--rc-sky-text); }
  .banner.night { --rc-sky-text: #fff; --rc-sky-muted: rgba(255,255,255,.78); background: #101827; }
  .banner .htext { position: absolute; z-index: 1; left: 12px; top: 0; bottom: 10px; right: calc(min(200px, 50cqw) + 4px);
                   display: flex; align-items: center; gap: 10px; min-width: 0; }
  /* Title, then its status pill 8 px after it and the update pill after that, centred on it, while the whole title
     and the pills' whole labels fit on that row; otherwise (measured by the card, see _fitPill) the pills go on a line
     of their own under a one-line subtitle (.below; .below2: the update pill alone), and when even then the text
     would run into the ground strip, they keep their dot or icon alone (.pill-dot). */
  .banner .titles { display: flex; flex-wrap: wrap; align-items: center; column-gap: 8px; row-gap: 1px; }
  .banner .trow { display: contents; }
  .banner .name { flex: 0 1 auto; min-width: 0; max-width: 100%; color: var(--rc-sky-text); }
  .banner .trow > .chip { flex: none; margin: 0; min-width: 0; max-width: 100%; box-sizing: border-box; white-space: nowrap; overflow: hidden; }
  .banner .titles > .sub { order: 5; flex: 1 0 100%; min-width: 0; }
  .banner .sub { color: var(--rc-sky-muted); max-height: 32px; line-height: 16px; }
  .banner .titles.below > .chip, .banner .titles.below .trow > .chip, .banner .titles.below2 .trow > .chip.upd { order: 6; margin-top: 2px; }
  .banner .titles.below > .sub, .banner .titles.below2 > .sub { max-height: 16px; }
  .banner .titles.pill-dot .chip.status { padding: 5px; }
  .banner .titles.pill-dot .chip .txt { display: none; }
  .banner .titles.pill-dot .chip.upd { padding: 1px 4px; }
  .banner .chip.upd .icon { flex: none; }
  /* Narrower still: only the pill's coloured dot (its text stays its tooltip and label). */
  @container (max-width: 200px) {
    .banner .chip.status { padding: 5px; }
    .banner .chip.status .txt, .banner .chip.upd .txt { display: none; }
    .banner .chip.upd { padding: 1px 4px; }
  }
  .banner + .content { padding-top: 10px; }
  .banner .logo-link { align-self: center; background: rgba(255,255,255,.62); box-shadow: inset 0 0 0 1px rgba(47,128,237,.18);
                       --rc-icon: color-mix(in srgb, var(--rc-tint) 78%, #0d2a45); }
  .banner.night .logo-link { background: rgba(255,255,255,.12); box-shadow: inset 0 0 0 1px rgba(255,255,255,.14);
                             --rc-icon: color-mix(in srgb, var(--rc-tint) 72%, #fff); }
  .banner .logo-link .icon.type .led { fill: rgba(255,255,255,.85); }
  .banner.night .logo-link .icon.type .led { fill: #101827; }
  .banner .logo { box-shadow: 0 0 0 1px rgba(13,42,69,.16), 0 1px 3px rgba(13,42,69,.18); }
  /* Header buttons on one line in the top right corner of the banner: the detail button of the mini card in the
     corner, the restart button 4 px to its left; round, frosted, over the scene. */
  .banner .hbtns { position: absolute; z-index: 2; top: 5px; right: 5px; display: flex; flex-direction: row-reverse; gap: 4px; }
  .banner .action, .banner .zoom { margin: 0; color: #33506b; background: rgba(255,255,255,.55);
                                   box-shadow: inset 0 0 0 1px rgba(255,255,255,.7); backdrop-filter: blur(4px); }
  .banner .action:hover, .banner .zoom:hover { background: rgba(255,255,255,.75); color: #33506b; }
  .banner.night .action, .banner.night .zoom { color: #fff; background: rgba(255,255,255,.12); box-shadow: inset 0 0 0 1px rgba(255,255,255,.2); }
  .banner.night .action:hover, .banner.night .zoom:hover { background: rgba(255,255,255,.22); color: #fff; }
  .banner .chips { margin-top: 2px; }
  /* Pills on the sky: a frosted glass under the tint of the state colour. */
  .banner .chip { background: color-mix(in srgb, var(--c, var(--rc-ok)) 18%, rgba(255,255,255,.78));
                  color: color-mix(in srgb, var(--c, var(--rc-ok)) 45%, #0d2a45); }
  .banner.night .chip { background: color-mix(in srgb, var(--c, var(--rc-ok)) 30%, rgba(8,18,38,.55));
                        color: color-mix(in srgb, var(--c, var(--rc-ok)) 35%, #fff); }
  .banner .chip .dot { width: 7px; height: 7px; }
  .rc-scene { position: absolute; right: 0; bottom: 10px; height: 80px; width: min(200px, 50cqw); }
  /* A card under 340 px: a smaller scene, so the title and its pill keep their line. */
  @container (max-width: 340px) { .rc-scene { width: 36cqw; } .banner .htext { right: calc(36cqw + 4px); } }
  /* No scene: the text ends before the header buttons. */
  @container (max-width: 230px) { .rc-scene { display: none; } .banner .htext { right: calc(8px + var(--rc-nb, 0) * 28px); } }
  .rc-ground { position: absolute; left: 0; right: 0; bottom: 0; height: 10px; }
  .g-net { background: #1e3a5f; background-image: repeating-linear-gradient(90deg, #4fc3f7 0 14px, transparent 14px 22px);
           background-size: 100% 2px; background-repeat: no-repeat; background-position: 0 50%; box-shadow: inset 0 2px 0 #2f5a8a; }
  .night .g-net { background-color: #0f1d33; box-shadow: inset 0 2px 0 #1e3a5f; }
  .g-netdown { background: #5a6370; background-image: repeating-linear-gradient(90deg, #e5484d 0 6px, transparent 6px 16px);
               background-size: 100% 2px; background-repeat: no-repeat; background-position: 0 50%; box-shadow: inset 0 2px 0 #77808c; }
  .night .g-netdown { background-color: #2c323b; box-shadow: inset 0 2px 0 #3a414c; }
  .rc-dots { fill: #c9dcf2; } .night .rc-dots { fill: #22324d; }
  .rc-cable { fill: none; stroke: #b9c9dc; stroke-width: 4; stroke-linecap: round; } .night .rc-cable { stroke: #2a3446; }
  .rc-wan { fill: none; stroke: #2fd0ff; stroke-width: 2; stroke-linecap: round; stroke-dasharray: 4 26; animation: rc-flow 1.4s linear infinite; }
  .down .rc-wan { stroke: #e5484d; stroke-dasharray: 3 4; animation: none; }
  .off .rc-wan { stroke: #9aa3ae; stroke-dasharray: none; animation: none; }
  .rc-link { fill: none; stroke: #43a047; stroke-width: 1; stroke-dasharray: 2 3; }
  .down .rc-link, .off .rc-link { stroke: #9aa3ae; }
  .rc-pkt { fill: #43a047; animation: rc-pkt 1.4s linear infinite; }
  .rc-client { fill: #fff; stroke: #c9d2de; } .night .rc-client { fill: #1d2a3d; stroke: #33465f; }
  .rc-client-ln { fill: none; stroke: #5f6b7a; stroke-width: 1.3; } .night .rc-client-ln { stroke: #9fb3cf; }
  .rc-waves { fill: none; stroke: #2f80ed; stroke-width: 1.8; stroke-linecap: round; }
  .down .rc-waves, .off .rc-waves { stroke: #9aa3ae; }
  .ok .rc-waves path { animation: rc-blink 1.5s infinite; }
  .ok .rc-waves .w2 { animation-delay: .25s; } .ok .rc-waves .w3 { animation-delay: .5s; }
  .rc-cut circle { fill: #e5484d; } .rc-cut path { stroke: #fff; stroke-width: 1.6; }
  .rc-glow { display: none; } .night .rc-glow { display: inline; }
  .rc-dev { filter: drop-shadow(0 1.5px 1.5px rgba(0,0,0,.18)); }
  .night .rc-dev { filter: drop-shadow(0 0 1.2px rgba(255,255,255,.55)) drop-shadow(0 0 5px rgba(170,200,255,.28)) brightness(1.12); }
  .rc-scene a { cursor: pointer; }
  @keyframes rc-flow { to { stroke-dashoffset: -30; } }
  @keyframes rc-blink { 50% { opacity: .2; } }
  @keyframes rc-pkt { from { offset-distance: 0%; opacity: 0; } 15% { opacity: 1; } 85% { opacity: 1; } to { offset-distance: 100%; opacity: 0; } }
  @media (prefers-reduced-motion: reduce) { .rc-wan, .rc-pkt, .rc-waves path { animation: none !important; } .rc-pkt { display: none; } }
`;

// In-card confirmation popup, at the top of the card so it stays in view when the card is long.
export const DIALOG_STYLE = `
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
export const HIST_REFRESH = 5 * 60000;
export const HIST_WINDOW = 864e5;
export const HIST_PERIOD = 5 * 60000;
export function spark(points, end, peak) {
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
export const statTime = (p) => (typeof p.start === "number" ? p.start : Date.parse(p.start));

// Number of each card instance: keeps the ids of the illustrations apart.
export let _rcUid = 0;

export class RouterBase extends HTMLElement {
  constructor() {
    super();
    this.attachShadow({ mode: "open" });
    this._uid = ++_rcUid;
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
    // A new width (or the web font loaded): the status pill is fitted again, in the next frame.
    if (typeof ResizeObserver === "function") {
      this._resize ??= new ResizeObserver((entries) => {
        const w = Math.round(entries.at(-1).contentRect.width);
        if (w === this._fitWidth) return;
        this._fitWidth = w;
        cancelAnimationFrame(this._fitFrame);
        this._fitFrame = requestAnimationFrame(() => this._fitPill());
      });
      this._resize.observe(this);
    }
    document.fonts?.ready?.then(() => this._fitPill());
  }

  disconnectedCallback() {
    this._dialogOutside?.off();
    this._resize?.disconnect();
    this._fitWidth = null;
    if (typeof cancelAnimationFrame === "function") cancelAnimationFrame(this._fitFrame);
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

  // Network devices online, as { online, total }, or null without any. A device with no state entity (OpenWrt ubus
  // access points) tells nothing: it is left out of the count rather than counted offline.
  _nodesUp(box) {
    const known = box.nodes.filter((n) => n.online);
    if (!known.length) return null;
    return { online: known.filter((n) => onlineOf(this._s(n.online)) === true).length, total: known.length };
  }

  // Download / upload rate tile, shared by the full and the mini card.
  _rateTile(id, cls, icon, k, hist) {
    // A tile without its sensor opens no more-info: not focusable.
    const attrs = id ? `clickable ${cls}" role="button" tabindex="0" data-entity="${esc(refId(id))}"` : `${cls}"`;
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
    const sig = [h.entities, h.devices, h.language, h.locale?.language, h.config?.time_zone, h.themes?.darkMode];
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
    this._fitPill();
  }

  // The status pill stays right after the title only while the whole title and the pill's whole label fit on that
  // line, the update pill after it on the same terms; otherwise they take a line of their own under the subtitle
  // (.below, or .below2 for the update pill alone), and when even then the line is too narrow for them or (on the
  // banner) the text would run into the ground strip, they keep their dot or icon alone (.pill-dot). Measured
  // in the real fonts, the pills at their natural width, so that every language and title length gets its own answer.
  _fitPill() {
    const natural = (chip) => {
      chip.style.width = "max-content";
      chip.style.maxWidth = "none";
      const w = chip.getBoundingClientRect().width;
      chip.style.width = "";
      chip.style.maxWidth = "";
      return w;
    };
    for (const t of this.shadowRoot?.querySelectorAll?.(".titles") || []) {
      const status = t.querySelector(".chip.status");
      if (!status?.getBoundingClientRect) continue;
      t.classList.remove("below", "below2", "pill-dot");
      const banner = t.closest(".banner");
      const upd = banner && t.querySelector(".trow > .chip.upd");
      const name = t.querySelector(".name");
      const gap = parseFloat(getComputedStyle(t).columnGap) || 0;
      const room = t.getBoundingClientRect().width;
      const title = name && getComputedStyle(name).display !== "none" ? textWidth(name) + gap : 0;
      const pill = natural(status);
      const second = upd ? natural(upd) + gap : 0;
      if (title + pill > room) t.classList.add("below");
      else if (title + pill + second > room) t.classList.add("below2");
      else continue;
      const line = t.classList.contains("below") ? pill + second : second - gap;
      const r = t.getBoundingClientRect();
      const box = banner?.getBoundingClientRect();
      const floor = banner?.querySelector(".rc-ground")?.getBoundingClientRect().top ?? box?.bottom;
      if ((box && (r.bottom > floor + 0.5 || r.top < box.top - 0.5)) || line > room + 0.5) t.classList.add("pill-dot");
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
  // On the illustrated header the pill shows the short state ("Online"), its tooltip and accessible name keep "WAN".
  _statusPill(box, short = false) {
    const link = this._link(box);
    if (!link) return "";
    const text = `${this._t("wan")} · ${this._t(link.key)}`;
    // The text is also the tooltip and accessible name: on a narrow card only the coloured dot is shown.
    return `<span class="chip status clickable ${link.cls}" role="button" tabindex="0" data-entity="${esc(link.entity)}" title="${esc(text)}" aria-label="${esc(
      text
    )}"><span class="dot"></span><span class="txt">${esc(short ? this._t(link.key) : text)}</span></span>`;
  }

  // Info chips under the title: a firmware update waiting.
  _chips(box) {
    const up = this._updatePill(box);
    return up ? `<div class="chips">${up}</div>` : "";
  }

  // The firmware update pill (its text also its tooltip), or "" when no update is waiting.
  _updatePill(box) {
    const up = this._s(box.scalars.update);
    if (up?.state !== "on") return "";
    const text = esc(this._t("update_available"));
    return `<span class="chip warn upd clickable" role="button" tabindex="0" data-entity="${esc(up.entity_id)}" title="${text}" aria-label="${text}">${svgIcon(
      ICONS.update
    )}<span class="txt">${text}</span></span>`;
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
    if (c.illustration !== false) return this._banner(box, full, { name, sub, model, firmware, brand, pic, adminUrl, state });
    const picHtml = `<img class="pic" src="${pic}" alt="${esc(this._t(`kind_${box.kind}`))}">`;
    return `
      <div class="header">
        ${c.show_logo !== false ? brand : ""}
        <div class="titles">
          <div class="trow"><div class="name">${esc(name)}</div>${this._statusPill(box)}</div>
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

  // Illustrated header: the icon, title and its WAN status pill, then the subtitle (clients connected, model,
  // firmware) on the left, the network scene on the right, the ground strip at the bottom; the detail and restart
  // buttons in the top right corner of the banner.
  _banner(box, full, { name, model, firmware, brand, pic, adminUrl, state }) {
    const c = this._config;
    const parts = [];
    const cl = this._clients(box);
    if (cl && cl.n !== null) parts.push(`<span>${cl.n} ${esc(this._tn("clients_n", cl.n))}</span>`);
    if (model) parts.push(`<span>${esc(model)}</span>`);
    if (firmware) parts.push(`<span>${esc(`${this._t("firmware")} ${firmware}`)}</span>`);
    if (!parts.length) parts.push(`<span>${esc(box.profile.name || this._t(`kind_${box.kind}`))}</span>`);
    const scene = state === "crit" ? "down" : state === "off" ? "off" : "ok";
    const night = rcIsNight(this._hass, c);
    const svg = rcSceneSvg({
      uid: this._uid,
      state: scene,
      kind: box.kind,
      pic: c.show_image !== false ? pic : null,
      href: adminUrl,
      label: this._t("admin"),
    });
    const btns = `${this._headerEnd()}${full ? this._restartBtn(box) : ""}`;
    const nb = (btns.match(/<button/g) || []).length;
    return `
      <div class="header banner${night ? " night" : ""}" style="--rc-nb:${nb}">
        ${svg}
        <div class="rc-ground ${scene === "down" ? "g-netdown" : "g-net"}"></div>
        <div class="htext">
          ${c.show_logo !== false ? brand : ""}
          <div class="titles">
            <div class="trow"><div class="name">${esc(name)}</div>${this._statusPill(box, true)}${full ? this._updatePill(box) : ""}</div>
            <div class="sub" title="${parts.join(" · ").replace(/<[^>]*>/g, "")}"><div class="parts">${parts.join("")}</div></div>
          </div>
        </div>
        ${nb ? `<div class="hbtns">${btns}</div>` : ""}
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
