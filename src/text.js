// Text shaping: turns a string + style into positioned glyph outlines.
//
// Why outlines instead of embedded fonts: the #1 failure of the old PDF form was
// fonts (missing Roboto → Times/Courier substitutes, broken Arabic). Shaping with
// HarfBuzz and emitting vector paths means the PDF needs no fonts at all and
// prints identically everywhere — print shops also prefer outlined text.
//
// Pipeline per span: bidi levels (bidi-js) → visual runs → per-run font
// fallback → HarfBuzz shaping → glyph outlines placed in card space (pt, y down).

import { FALLBACK_CHAIN } from './fonts.js';

export class Shaper {
  constructor(hb, bidi, store) {
    this.hb = hb;
    this.bidi = bidi;
    this.store = store;
    this.pathCache = new Map();
  }

  // Shape one span. style = { family, weight, size }. dir = 'ltr' | 'rtl'.
  // Returns { width, glyphs: [{ family, weight, gid, x, y }] } with x/y in pt
  // relative to the span's left edge / baseline.
  shape(text, style, dir) {
    if (!text) return { width: 0, glyphs: [] };
    const { levels } = this.bidi.getEmbeddingLevels(text, dir);
    const runs = visualRuns(text, levels);
    const glyphs = [];
    let penX = 0;
    for (const run of runs) {
      const rtl = run.level % 2 === 1;
      const pieces = this.#splitByFont(run.text, style.family);
      if (rtl) pieces.reverse(); // font pieces are logical; RTL runs place them right-to-left
      for (const piece of pieces) {
        penX += this.#shapePiece(piece.text, piece.family, style, rtl, penX, glyphs);
      }
    }
    return { width: penX, glyphs };
  }

  #splitByFont(text, primary) {
    const pieces = [];
    for (const ch of text) {
      const cp = ch.codePointAt(0);
      const fam = this.#familyFor(cp, primary);
      const last = pieces[pieces.length - 1];
      // Spaces and marks stay with the current piece so words don't fragment.
      if (last && (last.family === fam || isNeutral(cp))) last.text += ch;
      else pieces.push({ family: fam, text: ch });
    }
    return pieces;
  }

  #familyFor(cp, primary) {
    if (this.store.has(primary, cp)) return primary;
    for (const fam of FALLBACK_CHAIN) {
      if (fam !== primary && this.store.isLoaded(fam) && this.store.has(fam, cp)) return fam;
    }
    return primary; // renders .notdef — layout reports it via missingGlyphs
  }

  #shapePiece(text, family, style, rtl, penX, out) {
    const hb = this.hb;
    const font = this.store.font(family, style.weight);
    const scale = style.size / this.store.upem(family);
    const buf = new hb.Buffer();
    buf.addText(text);
    buf.guessSegmentProperties();
    buf.setDirection(rtl ? hb.Direction.RTL : hb.Direction.LTR);
    hb.shape(font, buf);
    const infos = buf.getGlyphInfos();
    const pos = buf.getGlyphPositions();
    let x = 0;
    for (let i = 0; i < infos.length; i++) {
      const p = pos[i];
      out.push({
        family, weight: style.weight, gid: infos[i].codepoint, scale,
        x: penX + (x + p.xOffset) * scale,
        y: -p.yOffset * scale,
      });
      x += p.xAdvance;
    }
    return x * scale;
  }

  // Outlines of the shaped span, placed with its left edge at (ox, baseline oy).
  // One path per glyph, never merged: glyphs from different fonts can wind in
  // opposite directions, and overlapping ones (Arabic joins, accents) would
  // cancel out under the nonzero fill rule — the same bug that inverted the
  // continents on the UN globe when the logo shapes were merged.
  toPaths(shaped, ox, oy) {
    const out = [];
    for (const g of shaped.glyphs) {
      const raw = this.#glyphPath(g.family, g.weight, g.gid);
      if (raw) out.push(transformPath(raw, ox + g.x, oy + g.y, g.scale));
    }
    return out;
  }

  #glyphPath(family, weight, gid) {
    const key = `${family}:${weight}:${gid}`;
    if (!this.pathCache.has(key)) {
      this.pathCache.set(key, this.store.font(family, weight).glyphToPath(gid));
    }
    return this.pathCache.get(key);
  }
}

// UAX #9 rule L2: split into runs of equal level, then reverse sequences from the
// highest level down to the lowest odd level.
function visualRuns(text, levels) {
  const runs = [];
  let start = 0;
  for (let i = 1; i <= text.length; i++) {
    if (i === text.length || levels[i] !== levels[start]) {
      runs.push({ text: text.slice(start, i), level: levels[start] });
      start = i;
    }
  }
  const max = Math.max(...runs.map((r) => r.level));
  const minOdd = Math.min(...runs.map((r) => (r.level % 2 ? r.level : r.level + 1)));
  for (let lvl = max; lvl >= minOdd; lvl--) {
    for (let i = 0; i < runs.length; ) {
      if (runs[i].level >= lvl) {
        let j = i;
        while (j < runs.length && runs[j].level >= lvl) j++;
        const seq = runs.slice(i, j).reverse();
        runs.splice(i, j - i, ...seq);
        i = j;
      } else i++;
    }
  }
  return runs;
}

function isNeutral(cp) {
  return cp === 0x20 || cp === 0xa0 || (cp >= 0x300 && cp <= 0x36f);
}

// HarfBuzz emits absolute M/L/Q/C/Z in font units, y up. Map to card space
// (pt, y down): x' = ox + x*s, y' = oy - y*s.
function transformPath(raw, ox, oy, s) {
  let out = '';
  const re = /([MLQCZ])([^MLQCZ]*)/g;
  let m;
  while ((m = re.exec(raw))) {
    out += m[1];
    if (m[1] === 'Z') continue;
    const nums = m[2].split(/[\s,]+/).filter(Boolean).map(Number);
    for (let i = 0; i < nums.length; i += 2) {
      out += (i ? ' ' : '') + r3(ox + nums[i] * s) + ' ' + r3(oy - nums[i + 1] * s);
    }
  }
  return out;
}

const r3 = (v) => Math.round(v * 1000) / 1000;
