// ---------------------------------------------------------------------------
// Visual editors (ha-form)
// ---------------------------------------------------------------------------
import { DRAWINGS } from "./pictures.js";
import { THRESHOLDS, lang, sameSig, t } from "./helpers.js";
import { EDITOR_ENTITIES, OWN_KEYS, SPEEDTEST_KEYS, cleanEntities, discover, index, kindOf, listDevices } from "./entity-discovery.js";
import { STRINGS } from "./i18n/strings.js";

export const LANGUAGES = [
  ["en", "English"], ["fr", "Français"], ["de", "Deutsch"], ["es", "Español"], ["sr", "Српски"], ["sr-Latn", "Srpski (latinica)"],
  ["it", "Italiano"], ["nl", "Nederlands"], ["pt", "Português (Portugal)"], ["pl", "Polski"], ["ro", "Română"], ["da", "Dansk"],
  ["sv", "Svenska"], ["bg", "Български"], ["ru", "Русский"], ["uk", "Українська"], ["hu", "Magyar"], ["sk", "Slovenčina"],
  ["cs", "Čeština"], ["sl", "Slovenščina"], ["lv", "Latviešu"], ["el", "Ελληνικά"],
];

export class RouterEditorBase extends HTMLElement {
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
        name: "illustration_theme",
        selector: { select: { mode: "dropdown", options: ["auto", "day", "night"].map((v) => ({ value: v, label: tr(`theme_${v}`) })) } },
      },
      {
        type: "grid",
        name: "",
        schema: [
          { name: "show_title", selector: { boolean: {} } },
          { name: "show_subtitle", selector: { boolean: {} } },
          { name: "show_image", selector: { boolean: {} } },
          { name: "show_logo", selector: { boolean: {} } },
          { name: "illustration", selector: { boolean: {} } },
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
          if (v === "" || v === undefined || v === null || ((k.startsWith("show_") || k === "zoom" || k === "illustration") && v === true) || (k === "rate_unit" && v === "bytes") || (k === "illustration_theme" && v === "auto") || THRESHOLDS[k] === v)
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
    this._form.hass = this._hass;
    // The data is handed to the form only when the configuration changed, not on every state change.
    if (this._dataFor !== this._config) {
      this._dataFor = this._config;
      const data = { rate_unit: "bytes", kind: "", illustration_theme: "auto", ...THRESHOLDS, ...this._config };
      for (const name of ["show_title", "show_subtitle", "show_image", "show_logo", "illustration", ...this.constructor.toggles]) if (data[name] === undefined) data[name] = true;
      this._form.data = data;
    }
    // The schema (devices, detected kind, language) is built again only when the registries, the set of states, the
    // device or the language changed, and handed to the form only when it differs, so ha-form does not re-render for
    // nothing.
    const deps = [index(this._hass), this._hass.devices, this._config.device, lang(this._hass, this._config)];
    if (!sameSig(deps, this._schemaDeps)) {
      this._schemaDeps = deps;
      const schema = this._schema();
      const key = JSON.stringify(schema);
      if (key !== this._schemaKey) {
        this._schemaKey = key;
        this._form.schema = schema;
      }
    }
  }
}

export class RouterCardEditor extends RouterEditorBase {
  static get toggles() {
    return ["show_network", "show_history", "show_speedtest", "show_system", "show_nodes", "show_lan"];
  }
}

export class RouterMiniCardEditor extends RouterEditorBase {
  static get toggles() {
    // The mini card's detail view is the full card: its options too, as on the other cards.
    return ["show_network", "show_history", "show_speedtest", "show_system", "show_nodes", "show_lan", "zoom"];
  }
}
