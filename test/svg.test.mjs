// The device pictures are inline SVG data URIs: every id they declare must be a valid, space-free XML name, and every
// url(#id) they use must point at one of them (an invalid reference makes the browser paint the shape black).
import assert from "node:assert/strict";
import { test } from "node:test";
import { load } from "./load.mjs";

const { IMG_DEVICE, devicePic } = load("router-card.js", ["IMG_DEVICE", "devicePic"]);

for (const kind of Object.keys(IMG_DEVICE)) {
  for (const [variant, uri] of [["neutral", IMG_DEVICE[kind]], ["tinted", devicePic(kind, "#c8332d")]]) {
    test(`${kind} (${variant}): SVG ids are valid and every url(#id) resolves`, () => {
      const svg = decodeURIComponent(uri.slice("data:image/svg+xml,".length));
      const ids = [...svg.matchAll(/\sid="([^"]*)"/g)].map((m) => m[1]);
      for (const id of ids) assert.match(id, /^[A-Za-z_][\w.-]*$/, `invalid id "${id}"`);
      assert.equal(new Set(ids).size, ids.length, "duplicate id");
      for (const [, ref] of svg.matchAll(/url\(#([^)]*)\)/g)) assert.ok(ids.includes(ref), `url(#${ref}) has no target`);
    });
  }
}
