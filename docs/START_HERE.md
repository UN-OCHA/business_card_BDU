# Start here — first tasks on the business card generator

Welcome, Maryam. This is your first web app project, and the plan is that **you are
the one who ships it**. The generator already works; your job is to check it
properly, improve it, and take it live on brand.unocha.org with Javi.

You don’t need to know how to code. Work with Claude: ask it to explain anything
you don’t understand, and ask it to show you what it changed. A good first prompt:

> “I’m new to web apps. Read docs/START_HERE.md and walk me through task 1.”

Tip: in the Claude app settings, the **Learning** output style makes Claude explain
what it is doing and leave small parts for you to try yourself.

---

## How we work (read once)

- **Your copy, your session.** Keep the project in a folder on your own Mac, outside
  Dropbox. Javi works in his own copy.
- **Write down what you find, then fix it.** Each problem or idea becomes a GitHub
  issue (Claude can create them for you). Each fix gets its own branch and a pull
  request. Javi reviews and merges; the live site only changes when he does.
- **Colours, buttons, fields, tabs, alerts** come from the OCHA App Kit. If one of
  them needs to change, note it and ask Javi. Don’t change them in this project.
- **Where the old card files are** (team Dropbox):
  `Design/Branding_Materials/business_card/2025/print_card/`
  — the `.ai` print-shop masters and the old self-print PDF templates.

---

## Task 1 — Get it running on your Mac

Ask Claude to clone `UN-OCHA/business_card_BDU`, start it locally and open it in the
browser pane. Fill in your own details and download each of the four PDFs.

**Done when:** you can open the app on your Mac and you understand the difference
between “running on my computer” and “live on the web”.

## Task 2 — Test it against the current business card

Compare the generated cards with the 2025 `.ai` masters and the old self-print PDFs.

- **Layout:** logo size and position, margins, spacing between lines, font sizes.
  Put the old and new cards side by side at the same zoom.
- **Long text:** very long names, double surnames, long job titles, three unit lines,
  long emails. When does the text shrink? Is the warning clear? When does it refuse?
- **Languages:** make a card in each of the six languages. Check the office name under
  the logo, the “Office” / “Mobile” labels, and that Arabic reads right to left with
  phone numbers still left to right. Arrange a check by a native speaker for the
  translations (see Task 6).
- **The four formats:** both Avery sheets and both print-shop cards.

**Done when:** every difference you found is a GitHub issue, with a screenshot.

## Task 3 — Review the interface for non-technical colleagues

Most people using this will never have made a PDF for printing before.

- Use it as if you were a colleague in a country office. Is it obvious what to do
  first, which format to pick and what to do with the PDF?
- Ask one or two colleagues to make their card **without any help** while you watch
  silently. Note every hesitation.
- Read every word on screen. Is it plain English? OCHA house style applies
  (ask Claude to use the `ocha-editorial-style` skill).

**Done when:** you have a short list of improvements, each as an issue, and the
first ones fixed through pull requests.

## Task 4 — Check it follows OCHA web standards

Use the Word Mark Generator as the reference for how a BDU web app should look:
https://un-ocha.github.io/humanitarian-icons-2026-BDU/word-mark-generator/

Things to compare (some are already known gaps):
- **Footer:** the reference has the OCHA footer (OCHA logo, mandate, CC BY licence).
  This app has none yet.
- **Favicon** (the small icon in the browser tab): the reference has one, this app doesn’t.
- **Header, fonts, colours, buttons, spacing, how it looks on a phone.**
- Remember this app will sit **inside** the brand site page, so check what looks
  right when it is embedded (a header may be unnecessary there, a footer may not).

Use the `ocha-visual-identity` skill. Anything that needs the App Kit itself to
change goes to Javi.

**Done when:** the gaps are issues, and the ones that only need this app’s own page
(like adding the footer and favicon) are fixed through pull requests.

## Task 5 — Test printing in the Geneva office

In Geneva the A4 sheet is the one that matters: **Avery C32011** (85 × 54 mm,
10 per sheet). Ask Joel if you need card sheets.

1. Print the A4 sheet on **plain paper** first, with the scale set to **Actual size /
   100%**. Hold it against a card sheet up to the light: do the cards line up?
2. If it lines up, print on the real card sheet and separate the cards.
3. If it’s off, **measure** how far (with a ruler, in mm) and in which direction, and
   whether it’s the same on every card.
4. Try a second printer if you can.

How to adjust:
- **Same offset on every printer** → the sheet positions in the app need adjusting.
  Ask Claude to change `src/formats.js`, with your measurements.
- **Only one printer is off** → it’s that printer, not the app. Don’t change the code;
  note it in the printing instructions instead if it’s likely to happen to others.
- Never move the design of the card itself to fix alignment.

If you can, also print the US Letter sheet (Avery 8371) and ask a print shop to look
at the print-shop PDF.

**Done when:** a printed sheet of real cards lines up, and photos of the test are in
the GitHub issue.

## Task 6 — More checks

- **UN Windows laptop:** most colleagues will use Edge on Windows. Try the app there,
  and open the downloaded PDF in Edge and in Adobe Acrobat Reader.
- **Native speakers:** ask colleagues to check the French, Spanish, Russian, Chinese
  and Arabic cards (the labels and the office name under the logo).
- **Keyboard and zoom:** can you fill in the whole form and download using only the
  keyboard? Does it still work at 200% browser zoom?

## Task 7 — Ship it (with Javi)

1. Turn on GitHub Pages so the app gets its public address.
2. Add the app to the business card page on brand.unocha.org (embed code in the README)
   and update the text around it.
3. Agree with Javi what happens to the old self-print templates on SharePoint.

**Done when:** colleagues can make their card from brand.unocha.org.

---

Questions: Javi (cuetoj@un.org) · ochavisual@un.org
