# OCHA business card

A small web app that makes print-ready OCHA business cards. Staff fill in their
details, check the live preview, and download a PDF:

- **Avery 8371** — 10 cards on US Letter (3.5 × 2 in)
- **Avery C32011** — 10 cards on A4 (85 × 54 mm)
- **Print shop** — one card with 3 mm bleed, crop marks and CMYK colours, in either size

It also links to the **eBusiness Card app** ([bizcards.unocha.org](https://bizcards.unocha.org/))
for digital cards. It is built to be embedded on
[brand.unocha.org](https://brand.unocha.org/document/478637#/-/ocha-business-card).

## Why it replaces the fillable PDF templates

The old templates relied on PDF form fields. They only behaved in Adobe Acrobat,
fell back to Times New Roman/Courier when Roboto was missing, and needed manual
flattening before printing. This app produces a flat PDF with no fonts and no
form fields: all text is drawn as vector outlines. It prints the same from Acrobat,
Preview, Edge or Chrome, and print shops accept it as it is.

## Languages

English, French, Spanish, Russian, Chinese and Arabic. As on the 2025 printshop
cards, every card carries the vertical OCHA logo with the official name of the
office typeset below it in the card’s language. Each language uses the brand
fonts for its script (Roboto / Roboto Slab, Noto Sans, Noto Sans SC, Almarai +
Noto Sans Arabic).
Arabic cards are mirrored right-to-left. Phone numbers and emails always stay
left-to-right.

## Long text

Text first wraps. If it still doesn’t fit, it shrinks — down to 85% at most, with a
warning. Beyond that the app refuses to download and asks the user to shorten a
line. Below 85% the smallest text would go under 5 pt.

## Embed on brand.unocha.org

```html
<iframe src="https://un-ocha.github.io/business_card_BDU/" title="OCHA business card"
        style="width:100%;height:1100px;border:0" loading="lazy"></iframe>
```

## How it works

Everything runs in the browser. No server, nothing stored except the user’s last
card in their own browser (localStorage) for convenience.

| File | Role |
|---|---|
| `src/card.js` | Card design: sizes, spacing, type per language, fit rules |
| `src/formats.js` | Avery sheet positions and print-shop settings |
| `src/text.js` | Shaping (HarfBuzz) + bidi (bidi-js) → glyph outlines |
| `src/fonts.js` | Font loading and per-character font fallback |
| `src/pdf.js` | PDF writing (pdf-lib) |
| `src/app.js` | Interface |
| `src/logos.js` | Generated from the OCHA 2024 logo master set |

Card measurements come from the 2025 printshop masters
(`business_card/2025/print_card/…/UNOCHA_Business_Cards_*.ai`).

### Maintenance

- **Logo changed?** `python3 scripts/build_logos.py`. It reads the 2024 master set from the
  OCHA DMU team Dropbox (`Design/Logos/ocha_logo/2024/…`) and finds it wherever your Dropbox
  folder sits. The generated `src/logos.js` is committed, so this is only needed when the
  master logo itself changes.
- **Test all languages and formats:** `node scripts/render_samples.mjs` → PDFs in `tests/out/`.
- **Styling** comes from the OCHA App Kit (`vendor/ocha-app-kit.css`). See below:
  App Kit changes are made by Javier only.
- Third-party code in `vendor/` (pdf-lib, harfbuzzjs, bidi-js — MIT) and fonts in
  `fonts/` (SIL OFL / Apache 2.0) are served from this repo, so the app works behind
  firewalls that block CDNs.

## Working on this project

Each person works in their own copy and their own Claude session — never two people
in the same Dropbox folder at once.

1. Clone the repo into a folder on your own Mac (outside Dropbox).
2. Make a branch for each change, then open a pull request. Javier reviews and merges.
   The live site only updates from `main`.
3. Before opening a pull request, run `node scripts/render_samples.mjs` and open a few of
   the PDFs in `tests/out/` in Preview.
4. **App Kit (all colours, buttons, inputs, tabs, alerts): changes go through Javier.**
   `vendor/ocha-app-kit.css` is a synced copy of the OCHA design system and is
   overwritten on every sync. Never edit it in this repo. If a component needs to look
   or behave differently, ask Javier: he decides whether it becomes the OCHA standard,
   changes it in the App Kit and syncs it here. `app.css` is for layout only.
5. Card design numbers (`src/card.js`) were measured from the 2025 `.ai` masters, and
   Avery positions (`src/formats.js`) from Avery’s published layouts. Don’t adjust one to
   compensate for the other.

## Project owner
Javier Cueto, Head of the Brand and Design Unit (BDU), OCHA

## Maintained by
**OCHA Brand and Design Unit (BDU)**
- Team: ochavisual@un.org
- Focal point: Javier Cueto (cuetoj@un.org)
