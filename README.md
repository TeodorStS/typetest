# typetest

A minimal, terminal-inspired typing test (monkeytype-style). No frameworks, no build step — just open `index.html` in a browser.

## Features

- ~350 common English words, randomly streamed
- Character-by-character highlighting: correct, incorrect, and pending
- Animated cursor that follows your position
- Three modes:
  - **Time** — 15s, 30s, 60s, 120s
  - **Words** — 10, 25, 50, 100 words
  - **Infinite** (∞) — no limit; a count-up clock runs and you press `Enter` to finish
- Live WPM and accuracy while typing
- Results screen with WPM, accuracy, correct words, errors, time, and your best WPM (with a "new best" badge)
- Best scores saved per mode in `localStorage`
- In-app theme switcher with 30 palettes — your choice is remembered. Includes dev favorites (dracula, nord, gruvbox, catppuccin, tokyo night, solarized, rosé pine, everforest), monkeytype-inspired ones (carbon, matrix, olivia, iceberg, nautilus), premium-keycap-inspired ones (white on black, black on white, red samurai, laser, mizu, modern dolch), light themes (latte, botanical, lavender), and more (mint, choc mint, claude, watermelon, synthwave, coral, coffee, amber)
- Restart with `Esc`, `Tab`, or the button; `Enter` ends a test early (and is how you finish infinite mode)

## Run it

Open `index.html` directly in any modern browser, or serve the folder:

```bash
python -m http.server 8000
```

Then visit `http://localhost:8000`.

## Project structure

- `index.html` — markup
- `style.css` — styles and animations (theme colors live in `:root` custom properties)
- `script.js` — all logic

## Theming

Pick a palette live via the **theme** button (bottom-right). To add your own, drop an entry into the `PALETTES` object in `script.js` (six colors: `bg`, `fg`, `dim`, `error`, `accent`, `muted`) and add its key to `THEME_ORDER` — the `--accent-soft` / `--error-bg` tints are derived automatically via `color-mix()`. The `:root` block in `style.css` holds the default theme and all fonts/spacing.

---

Built with assistance from Claude.
