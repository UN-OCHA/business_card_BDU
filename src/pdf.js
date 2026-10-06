// PDF writer. Takes a laid-out card (see card.js) and places it on a sheet or a
// print-shop page. No fonts and no form fields go into the file: everything is
// vector outlines, so it opens and prints the same in Acrobat, Preview, Edge,
// Chrome and print-shop RIPs.

import { FORMATS, COLOURS, cardOrigins } from './formats.js';

export async function buildPdf(PDFLib, card, formatId, meta = {}) {
  const { PDFDocument, rgb, cmyk } = PDFLib;
  const format = FORMATS[formatId];
  const size = card.size;
  const pal = COLOURS[format.colour];
  const colour = (c) => (format.colour === 'cmyk' ? cmyk(...c) : rgb(...c));
  const brand = colour(pal.brand);
  const ink = colour(pal.ink);

  const doc = await PDFDocument.create();
  doc.setTitle(meta.title || 'OCHA business card');
  doc.setAuthor('OCHA');
  doc.setCreator('OCHA business card generator — ochavisual@un.org');
  doc.setProducer('OCHA BDU');

  // drawSvgPath takes SVG coordinates (y down) anchored at (x, y) in PDF space (y up).
  const drawCard = (page, ox, oyTop) => {
    const pageH = page.getHeight();
    const l = card.logo;
    // Each shape is its own fill — see build_logos.py for why they are never merged.
    for (const d of l.paths) {
      page.drawSvgPath(d, { x: ox + l.x, y: pageH - (oyTop + l.y), scale: l.scale, color: brand, borderWidth: 0 });
    }
    for (const d of card.brand) page.drawSvgPath(d, { x: ox, y: pageH - oyTop, color: brand, borderWidth: 0 });
    for (const d of card.ink) page.drawSvgPath(d, { x: ox, y: pageH - oyTop, color: ink, borderWidth: 0 });
  };

  if (format.kind === 'sheet') {
    const page = doc.addPage([format.page.w, format.page.h]);
    for (const o of cardOrigins(format, size)) drawCard(page, o.x, o.y);
  } else {
    const off = format.bleed + format.slug;
    const W = size.w + 2 * off;
    const H = size.h + 2 * off;
    const page = doc.addPage([W, H]);
    page.setTrimBox(off, off, size.w, size.h);
    page.setBleedBox(off - format.bleed, off - format.bleed, size.w + 2 * format.bleed, size.h + 2 * format.bleed);
    drawCard(page, off, off);
    drawCropMarks(page, off, size, format.bleed, ink);
  }
  return doc.save();
}

// Crop marks sit outside the bleed so they never print on the trimmed card.
function drawCropMarks(page, off, size, bleed, color) {
  const len = 5 * (72 / 25.4);
  const gap = bleed;
  const t = 0.25;
  const xs = [off, off + size.w];
  const ys = [off, off + size.h];
  for (const x of xs) for (const y of ys) {
    const dirX = x === off ? -1 : 1;
    const dirY = y === off ? -1 : 1;
    page.drawLine({ start: { x: x + dirX * gap, y }, end: { x: x + dirX * (gap + len), y }, thickness: t, color });
    page.drawLine({ start: { x, y: y + dirY * gap }, end: { x, y: y + dirY * (gap + len) }, thickness: t, color });
  }
}

export function fileName(data, formatId, lang) {
  const slug = (s) => (s || '').normalize('NFKD').replace(/[̀-ͯ]/g, '')
    .replace(/[^\p{L}\p{N}]+/gu, '_').replace(/^_|_$/g, '');
  const who = slug(`${data.firstName || ''} ${data.lastName || ''}`) || 'card';
  return `OCHA_business_card_${who}_${lang.toUpperCase()}_${formatId}.pdf`;
}
