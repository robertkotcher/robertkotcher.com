import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

const root = new URL("../", import.meta.url);

test("publishes the complete résumé content and contact links", async () => {
  const page = await readFile(new URL("app/page.tsx", root), "utf8");

  assert.match(page, /Robert Kotcher/);
  assert.match(page, /Serial founding engineer/);
  assert.match(page, /Founder @/);
  assert.match(page, /Founding engineer @/);
  assert.match(page, /Product R&amp;D @ Codecov/);
  assert.match(page, /href="tel:\+12152923536"/);
  assert.match(page, /href="mailto:rkotcher@gmail\.com"/);
  assert.match(page, /linkedin\.com\/in\/robert-kotcher-639105196/);
  assert.match(page, /href="https:\/\/github\.com\/robertkotcher"/);
});

test("replaces the QR code and preserves publication links", async () => {
  const page = await readFile(new URL("app/page.tsx", root), "utf8");

  assert.match(page, /className="sidebar-link project-title-link"/);
  assert.match(page, /1LFjzmtWBJ3fqks8kKzOzf3_S7e0Y21-TdN0E6fmffho/);
  assert.match(page, /Cross-origin_pixel_stealing_Timing_attacks_using_CSS_filters/);
  assert.match(page, /OAuth_Demystified_for_Mobile_Application_Developers/);
  assert.doesNotMatch(page, /<img[^>]+qr/i);
  assert.doesNotMatch(page, />View project</);
});

test("sets résumé-specific metadata and responsive styles", async () => {
  const [layout, css] = await Promise.all([
    readFile(new URL("app/layout.tsx", root), "utf8"),
    readFile(new URL("app/globals.css", root), "utf8"),
  ]);

  assert.match(layout, /Robert Kotcher \| Serial Founding Engineer/);
  assert.match(layout, /https:\/\/www\.robertkotcher\.com/);
  assert.match(layout, /EB_Garamond/);
  assert.match(layout, /Ubuntu/);
  assert.match(css, /--navy:\s*#162e66/);
  assert.match(css, /@media \(max-width:\s*760px\)/);
  assert.match(css, /@media print/);
});
