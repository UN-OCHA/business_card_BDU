// Output formats. Sheet positions are Avery's published layouts — if a sheet
// prints offset, check these numbers first, never "nudge" the card design.

const MM = 72 / 25.4;

export const FORMATS = {
  // Avery 8371 / 5371 / 28371 — US Letter, 10 cards, 0.75 in sides, 0.5 in top, no gutters.
  // Source: https://www.avery.com/templates/8371
  'avery-8371': {
    kind: 'sheet', card: 'us', label: 'US Letter sheet — Avery 8371',
    page: { w: 612, h: 792 }, cols: 2, rows: 5,
    left: 54, top: 36, gapX: 0, gapY: 0,
    colour: 'rgb',
  },
  // Avery C32011 / L7415-compatible — A4, 10 cards, 15 mm sides, 13.5 mm top,
  // 10 mm gap between the columns, no gap between rows. Matches the column pitch
  // (95 mm) and row pitch (54 mm) of the 2025 OCHA A4 template.
  'avery-c32011': {
    kind: 'sheet', card: 'intl', label: 'A4 sheet — Avery C32011',
    page: { w: 210 * MM, h: 297 * MM }, cols: 2, rows: 5,
    left: 15 * MM, top: 13.5 * MM, gapX: 10 * MM, gapY: 0,
    colour: 'rgb',
  },
  // Print shop: one card, 3 mm bleed, crop marks, CMYK.
  'pro-us': {
    kind: 'pro', card: 'us', label: 'Print shop — 3.5 × 2 in', bleed: 3 * MM, slug: 10 * MM,
    colour: 'cmyk',
  },
  'pro-intl': {
    kind: 'pro', card: 'intl', label: 'Print shop — 85 × 54 mm', bleed: 3 * MM, slug: 10 * MM,
    colour: 'cmyk',
  },
};

// Brand colours. CMYK values are the official OCHA print specs; text is
// 100% K (not rich black) so small type can't blur from plate misregistration.
export const COLOURS = {
  rgb:  { brand: [0, 158 / 255, 219 / 255], ink: [0, 0, 0] },
  cmyk: { brand: [0.8, 0.2, 0, 0], ink: [0, 0, 0, 1] },
};

export function cardOrigins(format, card) {
  const out = [];
  for (let r = 0; r < format.rows; r++) {
    for (let c = 0; c < format.cols; c++) {
      out.push({ x: format.left + c * (card.w + format.gapX), y: format.top + r * (card.h + format.gapY) });
    }
  }
  return out;
}
