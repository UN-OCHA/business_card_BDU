// UI: form → live preview → PDF download. Everything runs in the browser;
// nobody's details leave their machine.

import * as hb from '../vendor/harfbuzzjs/index.mjs';
import bidiFactory from '../vendor/bidi-js/bidi.min.mjs';
import * as PDFLib from '../vendor/pdf-lib/pdf-lib.esm.min.js';
import { createEngine } from './engine.js';
import { LANGUAGES, FIELDS } from './card.js';
import { FORMATS } from './formats.js';
import { buildPdf, fileName } from './pdf.js';

const $ = (id) => document.getElementById(id);
const STORE_KEY = 'ocha-business-card:v1';

const engine = await createEngine({
  hb, bidiFactory,
  loadBytes: async (file) => {
    const res = await fetch(new URL(`../fonts/${file}`, import.meta.url));
    if (!res.ok) throw new Error(`Could not load font ${file} (${res.status})`);
    return new Uint8Array(await res.arrayBuffer());
  },
});

// ---- Tabs -------------------------------------------------------------------
const tabs = [...document.querySelectorAll('.mode-tab')];
tabs.forEach((tab) => tab.addEventListener('click', () => selectTab(tab)));
tabs.forEach((tab, i) => tab.addEventListener('keydown', (e) => {
  if (e.key !== 'ArrowRight' && e.key !== 'ArrowLeft') return;
  const next = tabs[(i + (e.key === 'ArrowRight' ? 1 : tabs.length - 1)) % tabs.length];
  selectTab(next); next.focus();
}));
function selectTab(tab) {
  for (const t of tabs) {
    const on = t === tab;
    t.classList.toggle('is-active', on);
    t.setAttribute('aria-selected', String(on));
    t.tabIndex = on ? 0 : -1;
    $(t.getAttribute('aria-controls')).hidden = !on;
  }
}

// ---- Form -------------------------------------------------------------------
const langSelect = $('f-lang');
for (const [id, L] of Object.entries(LANGUAGES)) {
  langSelect.add(new Option(L.label, id));
}

const formatList = $('format-list');
const FORMAT_HINTS = {
  'avery-8371': 'Print it yourself · 10 cards on US Letter',
  'avery-c32011': 'Print it yourself · 10 cards on A4',
  'pro-us': 'Send to a print shop · one card with bleed and crop marks',
  'pro-intl': 'Send to a print shop · one card with bleed and crop marks',
};
for (const [id, f] of Object.entries(FORMATS)) {
  const label = document.createElement('label');
  label.innerHTML = `<input type="radio" name="format" value="${id}">
    <span><span>${f.label}</span><span class="app-hint">${FORMAT_HINTS[id]}</span></span>`;
  formatList.append(label);
}

const state = loadState();
langSelect.value = state.lang;
for (const f of FIELDS) $(`f-${f.id}`).value = state.data[f.id] || '';
formatList.querySelector(`input[value="${state.format}"]`).checked = true;

$('card-form').addEventListener('input', onChange);
formatList.addEventListener('change', onChange);
langSelect.addEventListener('change', onChange);

function readForm() {
  const data = {};
  for (const f of FIELDS) data[f.id] = $(`f-${f.id}`).value;
  return {
    lang: langSelect.value,
    format: formatList.querySelector('input:checked').value,
    data,
  };
}

// ---- Preview ----------------------------------------------------------------
let current = null;   // last good layout
let seq = 0;
let timer = null;

function onChange() {
  clearTimeout(timer);
  timer = setTimeout(render, 120);
}

async function render() {
  const mine = ++seq;
  const s = readForm();
  saveState(s);
  const fmt = FORMATS[s.format];
  $('howto-sheet').hidden = fmt.kind !== 'sheet';
  $('howto-pro').hidden = fmt.kind !== 'pro';
  $('howto-avery').textContent = s.format === 'avery-8371' ? 'Avery 8371' : 'Avery C32011';
  $('f-units').dir = $('f-address').dir = $('f-firstName').dir = $('f-lastName').dir = $('f-title').dir =
    LANGUAGES[s.lang].dir;

  if (s.lang === 'zh' || /[⺀-鿿]/.test(Object.values(s.data).join(''))) {
    showFit('status', 'Loading Chinese font…');
  }
  let card;
  try {
    card = await engine.layout(s.data, fmt.card, s.lang);
  } catch (err) {
    console.error(err);
    showFit('error', 'Something went wrong preparing the card. Reload the page and try again.');
    return;
  }
  if (mine !== seq) return; // a newer edit is already rendering
  current = { card, ...s };
  $('preview').innerHTML = cardSvg(card);
  $('preview-caption').textContent = `Preview · ${card.size.label}`;
  reportFit(card, s.data);
}

function cardSvg(card) {
  const { w, h } = card.size;
  const l = card.logo;
  const paths = (list, fill) => list.map((d) => `<path fill="${fill}" d="${d}"/>`).join('');
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${w} ${h}" aria-hidden="true" focusable="false">
    <g transform="translate(${l.x} ${l.y}) scale(${l.scale})">${paths(l.paths, '#009EDB')}</g>
    ${paths(card.brand, '#009EDB')}${paths(card.ink, '#000')}
  </svg>`;
}

const FIELD_NAMES = {
  name: 'name', title: 'job title', units: 'unit lines', office: 'office phone',
  mobile: 'mobile phone', email: 'email', address: 'address lines',
};

function reportFit(card, data) {
  const download = $('download');
  const empty = !FIELDS.some((f) => (data[f.id] || '').trim());
  const missing = card.problems.find((p) => p.kind === 'glyph');
  if (empty) {
    download.disabled = true;
    showFit('status', 'Fill in your details to see your card.');
    return;
  }
  if (!card.fits) {
    download.disabled = true;
    const wide = card.problems.find((p) => p.kind === 'width');
    showFit('error', wide
      ? `Your ${FIELD_NAMES[wide.field]} is too long for the card, even with smaller text. Please shorten it.`
      : 'There is too much text for the card, even with smaller text. Please shorten the job title, unit or address lines.');
    return;
  }
  download.disabled = false;
  if (missing) {
    showFit('warning', `Some characters in the ${FIELD_NAMES[missing.field]} can’t be printed with the OCHA fonts. Check the preview.`);
  } else if (card.scale < 1) {
    const pct = Math.round(card.scale * 100);
    showFit('warning', `The text was reduced to ${pct}% to fit. It is still readable, but shortening a line will print it at full size.`);
  } else {
    showFit('status', 'Your card fits. Ready to download.');
  }
}

function showFit(kind, msg) {
  const box = $('fit');
  box.className = `cd-alert cd-alert--${kind}`;
  box.setAttribute('role', kind === 'error' ? 'alert' : 'status');
  $('fit-msg').textContent = msg;
  box.hidden = false;
}

// ---- Download ---------------------------------------------------------------
$('download').addEventListener('click', async () => {
  if (!current || !current.card.fits) return;
  const btn = $('download');
  btn.disabled = true;
  try {
    const bytes = await buildPdf(PDFLib, current.card, current.format, {
      title: `OCHA business card — ${current.data.firstName} ${current.data.lastName}`.trim(),
    });
    const url = URL.createObjectURL(new Blob([bytes], { type: 'application/pdf' }));
    const a = document.createElement('a');
    a.href = url;
    a.download = fileName(current.data, current.format, current.lang);
    document.body.append(a);
    a.click();
    a.remove();
    setTimeout(() => URL.revokeObjectURL(url), 10000);
  } catch (err) {
    console.error(err);
    showFit('error', 'The PDF could not be created. Reload the page and try again.');
  } finally {
    btn.disabled = false;
  }
});

// ---- Remember the last card on this device (convenience only) ---------------
function loadState() {
  const fallback = { lang: 'en', format: 'avery-8371', data: {} };
  try {
    const s = JSON.parse(localStorage.getItem(STORE_KEY));
    if (s && LANGUAGES[s.lang] && FORMATS[s.format]) return s;
  } catch { /* storage blocked or empty */ }
  return fallback;
}
function saveState(s) {
  try { localStorage.setItem(STORE_KEY, JSON.stringify(s)); } catch { /* storage blocked */ }
}

render();
