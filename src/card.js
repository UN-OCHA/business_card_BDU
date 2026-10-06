// Card design: sizes, typography, language rules and the fit logic.
// All measurements are in PostScript points (1 pt = 1/72 in), y pointing down,
// origin at the card's top-left trim corner.
//
// Spacing and sizes were measured from the 2025 printshop masters
// (UNOCHA_Business_Cards_US.ai / _International.ai) so the generated card
// matches the approved design.

import { LOGO } from './logos.js';

const MM = 72 / 25.4;

export const CARD_SIZES = {
  us:   { id: 'us',   label: '3.5 × 2 in', w: 252, h: 144,
          logo: { x: 20.48, y: 9.86, w: 45.35 }, textX: 85.9, firstBaseline: 20.25 },
  intl: { id: 'intl', label: '85 × 54 mm', w: 85 * MM, h: 54 * MM,
          logo: { x: 19.66, y: 10.99, w: 45.35 }, textX: 79.6, firstBaseline: 21.25 },
};

// Right and bottom limits: 4 mm keeps text well inside the 3 mm safe zone
// print shops ask for; the bottom limit is measured to the last baseline.
const RIGHT_MARGIN = 4 * MM;
const BOTTOM_LIMIT = 11.5;

// Text may shrink to 85% before we refuse. Below that the smallest text
// (the 6 pt phone labels) would drop under 5 pt and stop being legible.
export const MIN_SCALE = 0.85;

// Section gaps: baseline of the previous line → first baseline of the section.
const GAP_BEFORE = { title: 12.45, units: 13.4, contact: 12.4, address: 15.0 };

// Distance from the top of the name's capitals to its first baseline (12 pt Roboto Slab).
const CAP_TOP = 8.55;

// Name of the office, typeset under the vertical logo — as in the 2025 .ai masters,
// not taken from the spelled-out logo files (their text is too small at card size).
// Wording is the official one from the 2024 spelled-out logos; line breaks are
// ours, chosen to fit the logo's width. EN breaks copy the .ai master exactly.
// Measured from the US master: Roboto Regular 6 pt, 7 pt leading, centred on the
// logo, first baseline 66.54 pt below the top of the logo.
const DESCRIPTOR_STYLE = { size: 6, lh: 7, weight: 400, firstBaseline: 66.54 };
const DESCRIPTOR = {
  en: ['United Nations', 'Office for the', 'Coordination of', 'Humanitarian', 'Affairs'],
  fr: ['Nations Unies', 'Bureau de la', 'coordination des', 'affaires', 'humanitaires'],
  es: ['Naciones Unidas', 'Oficina de', 'Coordinación de', 'Asuntos', 'Humanitarios'],
  ru: ['Управление', 'Организации', 'Объединенных', 'Наций по', 'координации', 'гуманитарных', 'вопросов'],
  zh: ['联合国', '人道主义事务', '协调厅'],
  ar: ['الأمم المتحدة', 'مكتب تنسيق', 'الشؤون الإنسانية'],
};
const DESCRIPTOR_FAMILY = { en: 'roboto', fr: 'roboto', es: 'roboto', ru: 'notoSans', zh: 'notoSC', ar: 'notoArabic' };

const LATIN = {
  name:    { family: 'robotoSlab', weight: 700, size: 12, lh: 13 },
  title:   { family: 'roboto', weight: 700, size: 8, lh: 9.5 },
  units:   { family: 'roboto', weight: 500, size: 7, lh: 9 },
  contact: { family: 'roboto', weight: 500, size: 8, lh: 9.5 },
  label:   { family: 'roboto', weight: 500, size: 6 },
  address: { family: 'roboto', weight: 500, size: 7, lh: 9 },
};

const withFamily = (styles, map) =>
  Object.fromEntries(Object.entries(styles).map(([k, s]) => [k, { ...s, family: map(k, s) }]));

// Brand typography per language (brand.unocha.org → typography):
// Russian → Noto Sans, Chinese → Noto Sans SC, Arabic → Almarai titles + Noto Sans Arabic body.
// Phone numbers and emails always use Roboto so digits look the same on every card.
export const LANGUAGES = {
  en: { id: 'en', label: 'English',  dir: 'ltr', styles: LATIN, labels: { office: 'Office', mobile: 'Mobile' } },
  fr: { id: 'fr', label: 'Français', dir: 'ltr', styles: LATIN, labels: { office: 'Bureau', mobile: 'Portable' } },
  es: { id: 'es', label: 'Español',  dir: 'ltr', styles: LATIN, labels: { office: 'Oficina', mobile: 'Móvil' } },
  ru: { id: 'ru', label: 'Русский',  dir: 'ltr', labels: { office: 'Тел.', mobile: 'Моб.' },
        styles: withFamily(LATIN, (k) => (k === 'contact' ? 'roboto' : 'notoSans')) },
  zh: { id: 'zh', label: '中文',      dir: 'ltr', labels: { office: '办公室', mobile: '手机' },
        styles: withFamily(LATIN, (k) => (k === 'contact' ? 'roboto' : 'notoSC')) },
  ar: { id: 'ar', label: 'العربية',   dir: 'rtl', labels: { office: 'المكتب', mobile: 'الجوال' },
        styles: withFamily(LATIN, (k) => (k === 'name' ? 'almarai' : k === 'contact' ? 'roboto' : 'notoArabic')) },
};

export function familiesForLanguage(lang) {
  return [...new Set([...Object.values(LANGUAGES[lang].styles).map((s) => s.family), DESCRIPTOR_FAMILY[lang]])];
}

// Fields the form collects. `ltr` fields are data (numbers, addresses) that must
// never be reordered by the bidi algorithm — an Arabic card would otherwise
// print "+1 212 963" as "963 212 +1".
export const FIELDS = [
  { id: 'firstName', section: 'name' },
  { id: 'lastName',  section: 'name' },
  { id: 'title',     section: 'title' },
  { id: 'units',     section: 'units', multiline: true },
  { id: 'office',    section: 'contact', ltr: true, label: 'office' },
  { id: 'mobile',    section: 'contact', ltr: true, label: 'mobile' },
  { id: 'email',     section: 'contact', ltr: true },
  { id: 'address',   section: 'address', multiline: true },
];

// Lay out a card. Returns { scale, fits, problems[], ink: d, logo } where `ink`
// is one SVG path (card space) for all text, and `logo` is placement info.
export function layoutCard(shaper, data, sizeId, lang) {
  const size = CARD_SIZES[sizeId];
  const L = LANGUAGES[lang];
  let result;
  for (let s = 1; s >= MIN_SCALE - 1e-9; s = Math.round((s - 0.01) * 100) / 100) {
    result = tryLayout(shaper, data, size, L, s);
    if (result.fits) break;
  }
  return result;
}

function tryLayout(shaper, data, size, L, s) {
  const rtl = L.dir === 'rtl';
  const maxW = size.w - size.textX - RIGHT_MARGIN;
  const st = (k) => ({ ...L.styles[k], size: L.styles[k].size * s, lh: (L.styles[k].lh || 0) * s });
  const lines = [];   // { spans:[{shaped}], width, baseline, field }
  const problems = [];
  let y = null;       // current baseline; null = nothing placed yet

  const place = (section, spans, field, lh) => {
    lines.push({ spans, width: spans.reduce((w, sp) => w + sp.shaped.width + (sp.gap || 0), 0), baseline: y, field });
    y += lh;
  };
  const startSection = (section) => {
    // Keep the top margin fixed when text shrinks: only the cap height scales.
    if (y === null) { y = size.firstBaseline - (1 - s) * CAP_TOP; return; }
    // `y` sits one line-height past the last baseline; rewind, then add the gap.
    const last = lines[lines.length - 1];
    y = last.baseline + GAP_BEFORE[section] * s;
  };

  const text = (id) => (data[id] || '').trim();

  // Name: first and last name each on their own line, wrapping if too long.
  const nameStyle = st('name');
  const nameParts = [text('firstName'), text('lastName')].filter(Boolean);
  if (nameParts.length) {
    startSection('name');
    for (const part of nameParts) {
      for (const ln of wrap(shaper, part, nameStyle, L.dir, maxW)) place('name', [{ shaped: ln }], 'name', nameStyle.lh);
    }
  }

  const block = (section, id, style) => {
    const paras = text(id).split('\n').map((p) => p.trim()).filter(Boolean);
    if (!paras.length) return;
    startSection(section);
    for (const p of paras) {
      for (const ln of wrap(shaper, p, style, L.dir, maxW)) place(section, [{ shaped: ln }], id, style.lh);
    }
  };

  block('title', 'title', st('title'));
  block('units', 'units', st('units'));

  // Contact block: labelled phone lines, then email. Never wrapped — a broken
  // phone number or email is worse than slightly smaller text.
  const cs = st('contact');
  const ls = st('label');
  const contact = FIELDS.filter((f) => f.section === 'contact' && text(f.id));
  if (contact.length) {
    startSection('contact');
    for (const f of contact) {
      const value = { shaped: shaper.shape(text(f.id), cs, 'ltr') };
      // Label → number gap = one Roboto space at label size, as in the .ai master.
      const spans = f.label
        ? [{ shaped: shaper.shape(L.labels[f.label], ls, L.dir), gap: ls.size * 0.25 }, value]
        : [value];
      place('contact', spans, f.id, cs.lh);
    }
  }

  block('address', 'address', st('address'));

  // Fit checks.
  for (const ln of lines) {
    if (ln.width > maxW + 0.01) problems.push({ kind: 'width', field: ln.field });
    for (const sp of ln.spans) {
      if (sp.shaped.glyphs.some((g) => g.gid === 0)) problems.push({ kind: 'glyph', field: ln.field });
    }
  }
  const lastBaseline = lines.length ? lines[lines.length - 1].baseline : 0;
  if (lastBaseline > size.h - BOTTOM_LIMIT) problems.push({ kind: 'height' });

  // Text → one outline per glyph (see Shaper.toPaths for why they stay separate).
  const ink = [];
  for (const ln of lines) {
    let x = rtl ? size.w - size.textX : size.textX;
    for (const sp of ln.spans) {
      const w = sp.shaped.width;
      if (rtl) { x -= w; ink.push(...shaper.toPaths(sp.shaped, x, ln.baseline)); x -= sp.gap || 0; }
      else { ink.push(...shaper.toPaths(sp.shaped, x, ln.baseline)); x += w + (sp.gap || 0); }
    }
  }

  // Logo block: vertical logo + office name, mirrored to the right on RTL cards.
  const lw = size.logo.w;
  const lx = rtl ? size.w - size.logo.x - lw : size.logo.x;
  const logo = { paths: LOGO.paths, scale: lw / LOGO.w, x: lx, y: size.logo.y };
  const brand = [];
  const ds = { family: DESCRIPTOR_FAMILY[L.id], weight: DESCRIPTOR_STYLE.weight, size: DESCRIPTOR_STYLE.size };
  DESCRIPTOR[L.id].forEach((line, i) => {
    const shaped = shaper.shape(line, ds, L.dir);
    const baseline = size.logo.y + DESCRIPTOR_STYLE.firstBaseline + i * DESCRIPTOR_STYLE.lh;
    brand.push(...shaper.toPaths(shaped, lx + (lw - shaped.width) / 2, baseline));
  });

  const fits = !problems.some((p) => p.kind === 'width' || p.kind === 'height');
  return { scale: s, fits, problems, ink, brand, logo, size };
}

// Widest office-name line per language, for the tests (must stay near the logo width).
export function descriptorWidths(shaper) {
  return Object.fromEntries(Object.keys(DESCRIPTOR).map((lang) => {
    const ds = { family: DESCRIPTOR_FAMILY[lang], weight: DESCRIPTOR_STYLE.weight, size: DESCRIPTOR_STYLE.size };
    return [lang, Math.max(...DESCRIPTOR[lang].map((l) => shaper.shape(l, ds, LANGUAGES[lang].dir).width))];
  }));
}

// Greedy line breaking. Breaks at spaces; CJK text may break between any two
// ideographs (there are no spaces to break at).
function wrap(shaper, text, style, dir, maxW) {
  const tokens = text.match(/[⺀-鿿豈-﫿　-〿＀-￯]|[^\s⺀-鿿豈-﫿　-〿＀-￯]+|\s+/g) || [];
  const lines = [];
  let cur = '';
  for (const t of tokens) {
    const next = cur + t;
    if (cur.trim() && !/^\s+$/.test(t) && shaper.shape(next.trim(), style, dir).width > maxW) {
      lines.push(cur.trim());
      cur = t.trimStart();
    } else cur = next;
  }
  if (cur.trim()) lines.push(cur.trim());
  return lines.map((l) => shaper.shape(l, style, dir));
}
