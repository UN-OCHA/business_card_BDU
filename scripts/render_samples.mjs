// Renders sample cards in every language × format into tests/out/ so the
// output can be checked with real PDF viewers (pdftoppm, Preview).
// Run: node scripts/render_samples.mjs
import { readFile, mkdir, writeFile } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import * as hb from '../vendor/harfbuzzjs/index.mjs';
import bidiFactory from '../vendor/bidi-js/bidi.min.mjs';
import * as PDFLib from '../vendor/pdf-lib/pdf-lib.esm.min.js';
import { createEngine } from '../src/engine.js';
import { buildPdf, fileName } from '../src/pdf.js';
import { FORMATS } from '../src/formats.js';
import { SAMPLES } from './samples.mjs';

const root = new URL('..', import.meta.url);
const out = fileURLToPath(new URL('tests/out/', root));
await mkdir(out, { recursive: true });
const engine = await createEngine({
  hb, bidiFactory,
  loadBytes: (f) => readFile(fileURLToPath(new URL(`fonts/${f}`, root))),
});

const only = process.argv[2];
for (const s of SAMPLES) {
  if (only && s.id !== only) continue;
  for (const [fid, fmt] of Object.entries(FORMATS)) {
    if (s.formats && !s.formats.includes(fid)) continue;
    const t0 = Date.now();
    const card = await engine.layout(s.data, fmt.card, s.lang);
    const bytes = await buildPdf(PDFLib, card, fid, { title: s.id });
    const name = `${s.id}__${fileName(s.data, fid, s.lang)}`;
    await writeFile(out + name, bytes);
    console.log(`${name.padEnd(80)} scale=${card.scale.toFixed(2)} fits=${card.fits} problems=${JSON.stringify(card.problems)} ${Date.now() - t0}ms`);
  }
}
