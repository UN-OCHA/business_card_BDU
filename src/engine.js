// Wires HarfBuzz + bidi-js + fonts into one object the UI (and tests) call.
import { FontStore, familiesForText } from './fonts.js';
import { Shaper } from './text.js';
import { layoutCard, familiesForLanguage, FIELDS } from './card.js';

export async function createEngine({ hb, bidiFactory, loadBytes }) {
  const store = new FontStore(hb, loadBytes);
  const shaper = new Shaper(hb, bidiFactory(), store);

  // Load every font this card needs (language fonts + any script the user typed),
  // then lay it out. The ~17 MB Chinese font is only fetched when it is needed.
  async function layout(data, sizeId, lang) {
    const texts = FIELDS.map((f) => data[f.id] || '');
    await store.ensure([...new Set(['roboto', ...familiesForLanguage(lang), ...familiesForText(texts)])]);
    return layoutCard(shaper, data, sizeId, lang);
  }
  return { layout };
}
