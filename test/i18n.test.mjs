import assert from "node:assert/strict";
import { test } from "node:test";
import { load } from "./load.mjs";

const { STRINGS, RATE_UNITS, LANGUAGES, lang, tn, RouterCardEditor, RouterMiniCardEditor, OWN_KEYS, SPEEDTEST_KEYS, THRESHOLDS } = load("router-card.js", [
  "STRINGS",
  "RATE_UNITS",
  "LANGUAGES",
  "lang",
  "tn",
  "RouterCardEditor",
  "RouterMiniCardEditor",
  "OWN_KEYS",
  "SPEEDTEST_KEYS",
  "THRESHOLDS",
]);

const LANGS = ["en", "fr", "de", "es", "sr", "sr-Latn", "it", "nl", "pt", "pl", "ro", "da", "sv", "bg", "ru", "uk", "hu", "sk", "cs", "sl", "lv", "el"];
// Plural variants (key_zero/_one/_two/_few/_many) are optional: a language without them uses the plain key.
const PLURAL = /_(zero|one|two|few|many)$/;
const baseKeys = (l) => Object.keys(STRINGS[l]).filter((k) => !PLURAL.test(k)).sort();

test("every language of the editor has its texts and rate units", () => {
  assert.deepEqual(JSON.parse(JSON.stringify(LANGUAGES.map(([l]) => l))), LANGS);
  assert.deepEqual(Object.keys(STRINGS).sort(), [...LANGS].sort());
  for (const l of LANGS) assert.ok(RATE_UNITS[l], l);
});

for (const l of LANGS) {
  test(`${l}: same keys as English, no empty text, plural forms of plain keys only`, () => {
    assert.deepEqual(baseKeys(l), baseKeys("en"));
    for (const [k, v] of Object.entries(STRINGS[l])) {
      assert.ok(typeof v === "string" && v.trim(), `${l}.${k} is empty`);
      if (PLURAL.test(k)) {
        const base = k.replace(PLURAL, "");
        assert.ok(base in STRINGS[l], `${l}.${k} has no ${base}`);
        const form = k.match(PLURAL)[1];
        const forms = new Intl.PluralRules(l === "pt" ? "pt-PT" : l).resolvedOptions().pluralCategories;
        assert.ok(forms.includes(form), `${l} has no "${form}" plural form`);
      }
    }
  });
}

test("the language falls back to its base, then English", () => {
  assert.equal(lang({ language: "fr-CA" }, {}), "fr");
  assert.equal(lang({ language: "sr-Latn" }, {}), "sr-Latn");
  assert.equal(lang({ language: "ja" }, {}), "en");
  assert.equal(lang({ language: "fr" }, { language: "de" }), "de");
});

test("client counts agree with their number", () => {
  const hass = { language: "pl" };
  assert.equal(tn(hass, {}, "clients_n", 1), "klient");
  assert.equal(tn(hass, {}, "clients_n", 5), "klientów");
  assert.equal(tn({ language: "en" }, {}, "clients_n", 1), "client");
  assert.equal(tn({ language: "en" }, {}, "clients_n", 2), "clients");
  assert.equal(tn({ language: "ru" }, {}, "clients_n", 3), "клиента");
  assert.equal(tn({ language: "ru" }, {}, "clients_n", 11), "клиентов");
});

test("every editor field has a label in every language", () => {
  const fields = [
    "device", "title", "kind", "admin_url", "rate_unit", "language", "entities", "speedtest",
    ...RouterCardEditor.toggles, ...RouterMiniCardEditor.toggles, "show_title", "show_subtitle", "show_image", "show_logo",
    ...Object.keys(THRESHOLDS), ...[...OWN_KEYS, ...SPEEDTEST_KEYS].map((k) => `ent_${k}`),
  ];
  for (const f of fields) assert.ok(STRINGS.en[f], f);
});
