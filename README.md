# typetest

A minimal, terminal-inspired typing test (monkeytype-style). No frameworks, no build step — just open `index.html` in a browser.

## Features

- Random common English words to type
- Character-by-character highlighting: correct, incorrect, and pending
- Animated amber cursor that follows your position
- Timer modes: 15s, 30s, 60s, 120s
- Live WPM and accuracy while typing
- Results screen showing WPM, accuracy, correct words, and errors
- Restart with `Esc`, `Tab`, or the button

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

Edit the variables in `:root` of `style.css` to reskin — e.g. change `--accent` for the highlight color or `--font-mono` for a different typeface.

---

Built with assistance from Claude.
