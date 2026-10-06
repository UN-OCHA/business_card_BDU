// Font registry: loads brand fonts into HarfBuzz and answers "which font draws
// this character". Environment-agnostic: the caller injects `loadBytes(file)`
// (fetch in the browser, fs in Node tests), so the same engine runs in both.

// Families are variable fonts from google/fonts; a "face" below is a family at a
// fixed weight. Weights mirror the 2025 printshop master (.ai):
// name = Roboto Slab Bold, title = Roboto Bold, everything else = Roboto Medium.
export const FAMILIES = {
  roboto:      { file: 'Roboto-VF.ttf' },
  robotoSlab:  { file: 'RobotoSlab-VF.ttf' },
  notoSans:    { file: 'NotoSans-VF.ttf' },
  notoArabic:  { file: 'NotoSansArabic-VF.ttf' },
  almarai:     { file: 'Almarai-Bold.ttf', static: true },
  notoSC:      { file: 'NotoSansSC-VF.ttf' },   // ~17 MB — only loaded when needed
};

// Scripts we can detect cheaply, and which family covers them when the card
// language's own font does not (e.g. a Chinese name typed on an English card).
const SCRIPT_FALLBACK = [
  { re: /[؀-ۿݐ-ݿࢠ-ࣿﭐ-﷿ﹰ-﻿]/, family: 'notoArabic' },
  { re: /[⺀-鿿豈-﫿＀-￯　-〿]/, family: 'notoSC' },
];

export class FontStore {
  constructor(hb, loadBytes) {
    this.hb = hb;
    this.loadBytes = loadBytes;
    this.families = {};   // name -> { face, blob, unicodes:Set, upem, static }
    this.fonts = {};      // `${family}:${weight}` -> hb.Font
    this.pending = {};
  }

  async ensure(names) {
    await Promise.all(names.map((n) => this.#load(n)));
  }

  #load(name) {
    if (this.families[name]) return Promise.resolve();
    if (!this.pending[name]) {
      const spec = FAMILIES[name];
      this.pending[name] = this.loadBytes(spec.file).then((bytes) => {
        const blob = new this.hb.Blob(bytes);
        const face = new this.hb.Face(blob, 0);
        this.families[name] = {
          face, blob, static: !!spec.static,
          upem: face.upem,
          unicodes: new Set(face.collectUnicodes()),
        };
      });
    }
    return this.pending[name];
  }

  isLoaded(name) { return !!this.families[name]; }

  has(name, codePoint) { return this.families[name].unicodes.has(codePoint); }

  upem(name) { return this.families[name].upem; }

  font(name, weight) {
    const key = `${name}:${weight}`;
    if (!this.fonts[key]) {
      const fam = this.families[name];
      const f = new this.hb.Font(fam.face);
      if (!fam.static) f.setVariations([new this.hb.Variation('wght', weight)]);
      this.fonts[key] = f;
    }
    return this.fonts[key];
  }
}

// Families a set of strings will need, beyond the language's own ones.
export function familiesForText(texts) {
  const need = new Set();
  const all = texts.join('');
  for (const s of SCRIPT_FALLBACK) if (s.re.test(all)) need.add(s.family);
  return [...need];
}

// Fallback order after the style's own family. Roboto first keeps Latin
// digits/emails consistent across languages; Noto covers the rest.
export const FALLBACK_CHAIN = ['roboto', 'notoSans', 'notoArabic', 'notoSC'];
