/* =========================================================================
   typetest — typing test logic
   No frameworks. Plain DOM + a small state machine.
   ========================================================================= */

/* ---- Word pool: ~350 common English words ---- */
const WORDS = [
  'the','be','of','and','a','to','in','he','have','it','that','for','they','with','as',
  'not','on','she','at','by','this','we','you','do','but','from','or','which','one','would',
  'all','will','there','say','who','make','when','can','more','if','no','man','out','other','so',
  'what','time','up','go','about','than','into','could','state','only','new','year','some','take','come',
  'these','know','see','use','get','like','then','first','any','work','now','may','such','give','over',
  'think','most','even','find','day','also','after','way','many','must','look','before','great','back','through',
  'long','where','much','should','well','people','down','own','just','because','good','each','those','feel','seem',
  'how','high','too','place','little','world','very','still','nation','hand','old','life','tell','write','become',
  'here','show','house','both','between','need','mean','call','develop','under','last','right','move','thing','general',
  'school','never','same','another','begin','while','number','part','turn','real','leave','might','want','point','form',
  'off','child','few','small','since','against','ask','late','home','interest','large','person','end','open','public',
  'follow','during','present','without','again','hold','govern','around','possible','head','consider','word','program','problem','however',
  'lead','system','set','order','eye','plan','run','keep','face','fact','group','play','stand','increase','early',
  'course','change','help','line','city','put','close','case','force','meet','once','water','upon','war','build',
  'hear','light','unite','live','every','country','bring','center','let','side','try','provide','continue','name','certain',
  'power','pay','result','question','study','woman','until','far','night','always','service','away','report','something','company',
  'week','church','toward','start','social','room','figure','nature','though','young','less','enough','almost','read','include',
  'president','nothing','yet','better','big','boy','cost','business','value','second','why','clear','expect','family','complete',
  'act','sense','mind','experience','art','next','near','direct','car','law','industry','important','girl','god','several',
  'matter','usual','rather','per','often','kind','among','white','reason','action','return','foot','care','simple','within',
  'love','human','along','appear','doctor','believe','speak','active','student','month','drive','concern','best','door','hope',
  'example','inform','body','ever','least','probable','understand','reach','effect','different','idea','whole','control','condition','field',
  'pass','fall','note','special','talk','particular','today','measure','walk','teach','low','hour','type','carry','rate',
  'remain','full','street','easy','although','record','sit','determine','level','local','sure','receive','thus','moment','spirit',
  'train','college','religion','perhaps','music','grow','free','cause','serve','age','book','board','recent','sound','office',
  'cut','step','class','true','history','position','above','strong','friend','necessary','add','court','deal','tax','support',
  'party','whether','either','land','material','happen','education','death','agree','arm','mother','across','quite','anything','town',
  'past','view','society','manage','answer','break','organize','half','fire','lose','money','stop','actual','already','effort',
  'wait','department','able','political','learn','voice','air','together','shall','cover','common','subject','draw','short','wife',
  'treat','limit','road','letter','color','behind','produce','send','term','total','university','rise','century','success','minute',
  'remember','purpose','test','fight','watch','situation','stage','father','table','rest','bear','entire','market','prepare','explain',
  'offer','plant','charge','ground','west','picture','hard','front','lie','modern','dark','surface','rule','regard','dance',
  'peace','observe','future','wall','farm','claim','firm','operation','further','pressure','property','morning','amount','top','outside',
  'piece','sometimes','beauty','trade','fear','demand','paper','exist','wear','marry','north','single','sell','please','finish'
];

/* ---- Mode options ---- */
const AMOUNTS = {
  time:  [15, 30, 60, 120], // seconds
  words: [10, 25, 50, 100], // word goal
};

/* =========================================================================
   Color palettes — each defines the six themeable CSS variables.
   --accent-soft and --error-bg are derived from these via color-mix() in CSS.
   Add a palette here and to THEME_ORDER to extend the switcher.
   ========================================================================= */
const PALETTES = {
  amber:        { label: 'amber',      bg: '#0e0e0f', fg: '#d4d4d6', dim: '#555558', error: '#e0533d', accent: '#e2b341', muted: '#6b6b70' },
  dracula:      { label: 'dracula',    bg: '#282a36', fg: '#f8f8f2', dim: '#44475a', error: '#ff5555', accent: '#bd93f9', muted: '#6272a4' },
  nord:         { label: 'nord',       bg: '#2e3440', fg: '#eceff4', dim: '#434c5e', error: '#bf616a', accent: '#88c0d0', muted: '#616e88' },
  gruvbox:      { label: 'gruvbox',    bg: '#282828', fg: '#ebdbb2', dim: '#504945', error: '#fb4934', accent: '#fabd2f', muted: '#928374' },
  catppuccin:   { label: 'catppuccin', bg: '#1e1e2e', fg: '#cdd6f4', dim: '#45475a', error: '#f38ba8', accent: '#cba6f7', muted: '#6c7086' },
  'tokyo-night':{ label: 'tokyo night',bg: '#1a1b26', fg: '#c0caf5', dim: '#3b4261', error: '#f7768e', accent: '#7aa2f7', muted: '#565f89' },
  solarized:    { label: 'solarized',  bg: '#002b36', fg: '#93a1a1', dim: '#34555e', error: '#dc322f', accent: '#b58900', muted: '#657b83' },
  'rose-pine':  { label: 'rosé pine',  bg: '#191724', fg: '#e0def4', dim: '#403d52', error: '#eb6f92', accent: '#ebbcba', muted: '#6e6a86' },
  everforest:   { label: 'everforest', bg: '#2d353b', fg: '#d3c6aa', dim: '#4f5b58', error: '#e67e80', accent: '#a7c080', muted: '#859289' },
  latte:        { label: 'latte',      bg: '#eff1f5', fg: '#4c4f69', dim: '#bcc0cc', error: '#d20f39', accent: '#df8e1d', muted: '#8c8fa1' },

  /* ---- Added palettes ---- */
  mint:         { label: 'mint',        bg: '#0f1a17', fg: '#d6e7e0', dim: '#3a4f49', error: '#ff6b6b', accent: '#54e0b0', muted: '#6a8079' },
  'choc-mint':  { label: 'choc mint',   bg: '#2a201c', fg: '#e9ded6', dim: '#5a4a40', error: '#e8716a', accent: '#7fe3c0', muted: '#9a847a' },
  claude:       { label: 'claude',      bg: '#141413', fg: '#faf9f5', dim: '#54524c', error: '#cc5b49', accent: '#d97757', muted: '#b0aea5' },
  watermelon:   { label: 'watermelon',  bg: '#16271b', fg: '#f6eef0', dim: '#3c5a44', error: '#c1352f', accent: '#ff4d6d', muted: '#5fa46b' },
  carbon:       { label: 'carbon',      bg: '#313131', fg: '#f2e2c9', dim: '#5e5e5e', error: '#da3333', accent: '#f66e0d', muted: '#868686' },
  matrix:       { label: 'matrix',      bg: '#0d0208', fg: '#00ff41', dim: '#045a1e', error: '#ff3131', accent: '#00ff41', muted: '#138a35' },
  olivia:       { label: 'olivia',      bg: '#1d1b1a', fg: '#f0e9e9', dim: '#4a4544', error: '#d96b6b', accent: '#e9bdb1', muted: '#6d6868' },
  iceberg:      { label: 'iceberg',     bg: '#161821', fg: '#c6c8d1', dim: '#3a3f52', error: '#e27878', accent: '#84a0c6', muted: '#6b7089' },
  nautilus:     { label: 'nautilus',    bg: '#0f1c2e', fg: '#cfe3f2', dim: '#2b4257', error: '#ff6b6b', accent: '#2bb8e6', muted: '#5b7a93' },
  botanical:    { label: 'botanical',   bg: '#e7ecd8', fg: '#43503b', dim: '#aeb89c', error: '#b5483d', accent: '#5d8a6f', muted: '#8a9579' },
  lavender:     { label: 'lavender',    bg: '#efeaff', fg: '#443a63', dim: '#c3bbe0', error: '#d4567f', accent: '#8a6fe8', muted: '#948cb5' },
  synthwave:    { label: 'synthwave',   bg: '#1a1033', fg: '#f5e6ff', dim: '#463a6b', error: '#ff5c8a', accent: '#ff2e97', muted: '#7a6ba8' },
  coral:        { label: 'coral',       bg: '#2b1e2e', fg: '#ffe8df', dim: '#5a4150', error: '#ff5a5a', accent: '#ff7e5f', muted: '#9a7488' },
  coffee:       { label: 'coffee',      bg: '#211710', fg: '#ece0d1', dim: '#4f3d2e', error: '#e07a5f', accent: '#c8956c', muted: '#8a7058' },
};
const THEME_ORDER = [
  'amber', 'dracula', 'nord', 'gruvbox', 'catppuccin',
  'tokyo-night', 'solarized', 'rose-pine', 'everforest', 'latte',
  'mint', 'choc-mint', 'claude', 'watermelon', 'carbon',
  'matrix', 'olivia', 'iceberg', 'nautilus', 'botanical',
  'lavender', 'synthwave', 'coral', 'coffee',
];

/* localStorage keys */
const LS_THEME = 'typetest-theme';
const bestKey = () =>
  state.mode === 'infinite'
    ? 'typetest-best-infinite'
    : `typetest-best-${state.mode}-${state.amount}`;

/* ---- DOM references ---- */
const els = {
  modes:       document.getElementById('modes'),
  typeGroup:   document.getElementById('typeGroup'),
  amountGroup: document.getElementById('amountGroup'),
  live:        document.getElementById('live'),
  liveTimer:   document.getElementById('liveTimer'),
  liveWpm:     document.getElementById('liveWpm'),
  liveAcc:     document.getElementById('liveAcc'),
  test:        document.getElementById('test'),
  words:       document.getElementById('words'),
  capture:     document.getElementById('capture'),
  results:     document.getElementById('results'),
  newBest:     document.getElementById('newBest'),
  resWpm:      document.getElementById('resWpm'),
  resAcc:      document.getElementById('resAcc'),
  resCorrect:  document.getElementById('resCorrect'),
  resErrors:   document.getElementById('resErrors'),
  resBest:     document.getElementById('resBest'),
  resTime:     document.getElementById('resTime'),
  restart:     document.getElementById('restart'),
  themePicker: document.getElementById('themePicker'),
  themeToggle: document.getElementById('themeToggle'),
  themeDot:    document.getElementById('themeDot'),
  themeMenu:   document.getElementById('themeMenu'),
};

/* The animated cursor element — created once, repositioned constantly */
const cursor = document.createElement('div');
cursor.className = 'cursor';

/*
 * Inner wrapper that actually holds the word spans + cursor.
 * `.words` is a fixed-height clipping viewport; `inner` is the strip we
 * translate upward to scroll through lines. Keeping the transform on the
 * inner strip (not the viewport) is what makes scrolling behave.
 */
const inner = document.createElement('div');
inner.className = 'words-inner';

/* The active theme — kept outside `state` so it survives restarts */
let currentTheme = 'amber';

/* =========================================================================
   State
   ========================================================================= */
let state = {
  mode: 'time',        // 'time' | 'words'
  amount: 30,          // seconds (time mode) or word goal (words mode)
  words: [],           // array of target word strings
  typed: [],           // array of arrays: typed[wordIndex] = ['t','h',...]
  wordIndex: 0,        // current word being typed
  charIndex: 0,        // current char position within current word
  started: false,      // has the user typed the first key?
  finished: false,     // has the test ended?
  startTime: null,     // performance.now() at first keystroke
  finishTime: null,    // performance.now() at finish (freezes elapsed)
  intervalId: null,    // setInterval handle for the ticking clock
  // Tallies updated live as keys are pressed:
  correctChars: 0,     // total correctly typed characters (for WPM)
  incorrectChars: 0,   // total mistakes
  typedEntries: 0,     // total keypresses counted toward accuracy
};

/* =========================================================================
   Theming
   ========================================================================= */

/** Apply a palette by setting the themeable CSS variables on :root. */
function applyTheme(name) {
  const p = PALETTES[name];
  if (!p) return;
  const root = document.documentElement.style;
  root.setProperty('--bg', p.bg);
  root.setProperty('--fg', p.fg);
  root.setProperty('--dim', p.dim);
  root.setProperty('--error', p.error);
  root.setProperty('--accent', p.accent);
  root.setProperty('--muted', p.muted);

  currentTheme = name;
  els.themeDot.style.background = p.accent;
  // Highlight the active item in the menu
  [...els.themeMenu.children].forEach((b) =>
    b.classList.toggle('active', b.dataset.theme === name)
  );
  try { localStorage.setItem(LS_THEME, name); } catch (e) { /* ignore */ }
}

/** Build the theme menu items (a swatch + name per palette). */
function buildThemeMenu() {
  els.themeMenu.innerHTML = '';
  THEME_ORDER.forEach((name) => {
    const p = PALETTES[name];
    const btn = document.createElement('button');
    btn.type = 'button';
    btn.className = 'theme-item';
    btn.dataset.theme = name;
    btn.setAttribute('role', 'menuitemradio');
    btn.innerHTML =
      `<span class="theme-swatch" style="background:${p.bg}">` +
        `<span class="theme-dot-sm" style="background:${p.accent}"></span>` +
        `<span class="theme-dot-sm" style="background:${p.fg}"></span>` +
      `</span>` +
      `<span class="theme-name">${p.label}</span>`;
    els.themeMenu.appendChild(btn);
  });
}

function openThemeMenu() {
  els.themeMenu.hidden = false;
  els.themeToggle.setAttribute('aria-expanded', 'true');
}
function closeThemeMenu() {
  els.themeMenu.hidden = true;
  els.themeToggle.setAttribute('aria-expanded', 'false');
}
function toggleThemeMenu() {
  if (els.themeMenu.hidden) openThemeMenu();
  else closeThemeMenu();
}

/* =========================================================================
   Word generation + rendering
   ========================================================================= */

/** Pick `count` random words from the pool. */
function generateWords(count) {
  const out = [];
  for (let i = 0; i < count; i++) {
    out.push(WORDS[Math.floor(Math.random() * WORDS.length)]);
  }
  return out;
}

/** Build a `.word` span (with per-character `.char` spans) for a target word. */
function buildWordEl(word, index) {
  const wordEl = document.createElement('span');
  wordEl.className = 'word';
  wordEl.dataset.index = index;
  [...word].forEach((char) => {
    const charEl = document.createElement('span');
    charEl.className = 'char';
    charEl.textContent = char;
    wordEl.appendChild(charEl);
  });
  return wordEl;
}

/** Render the full word list into the DOM. */
function renderWords() {
  inner.innerHTML = '';
  state.words.forEach((word, w) => inner.appendChild(buildWordEl(word, w)));

  // Cursor lives inside the scrolling strip, after the words
  inner.appendChild(cursor);

  // Mount the strip into the viewport (idempotent)
  if (inner.parentElement !== els.words) {
    els.words.innerHTML = '';
    els.words.appendChild(inner);
  }
  moveCursor();
}

/** Append freshly generated words to the DOM (time mode's endless supply). */
function appendWords(newWords) {
  const startIndex = state.words.length - newWords.length;
  newWords.forEach((word, i) => {
    inner.insertBefore(buildWordEl(word, startIndex + i), cursor);
  });
}

/* =========================================================================
   Cursor positioning
   ========================================================================= */

/** Get the char span at a given word/char position (null if past the word end). */
function charElAt(wordIndex, charIndex) {
  const wordEl = inner.children[wordIndex];
  if (!wordEl) return null;
  return wordEl.children[charIndex] || null;
}

/**
 * Move the animated cursor to the current typing position.
 * Uses offsetLeft/offsetTop (relative to `inner`, the cursor's positioned
 * parent). These are immune to the scroll transform, unlike getBoundingClientRect.
 */
function moveCursor() {
  const wordEl = inner.children[state.wordIndex];
  if (!wordEl) return;

  const charEl = charElAt(state.wordIndex, state.charIndex);

  let left, top;
  if (charEl) {
    // Left edge of the next character to type
    left = charEl.offsetLeft;
    top = charEl.offsetTop;
  } else {
    // Past the last char of the word — sit just after it
    const lastChar = wordEl.children[wordEl.children.length - 1];
    if (lastChar) {
      left = lastChar.offsetLeft + lastChar.offsetWidth;
      top = lastChar.offsetTop;
    } else {
      left = wordEl.offsetLeft;
      top = wordEl.offsetTop;
    }
  }

  cursor.style.left = `${left}px`;
  cursor.style.top = `${top}px`;

  keepCursorInView();
}

/**
 * Scroll the strip so the active line stays visible.
 * Recomputed from scratch each move (idempotent — no accumulating offset):
 * keep the active line as the second of the three visible lines.
 */
function keepCursorInView() {
  const wordEl = inner.children[state.wordIndex];
  if (!wordEl) return;
  const lineHeight = parseFloat(getComputedStyle(els.words).lineHeight);
  const offset = Math.max(0, wordEl.offsetTop - lineHeight);
  inner.style.transform = `translateY(-${offset}px)`;
}

/* =========================================================================
   Timer + live stats
   ========================================================================= */

/** Seconds since the test started (frozen once finished). */
function elapsedSeconds() {
  if (!state.startTime) return 0;
  const end = state.finishTime || performance.now();
  return (end - state.startTime) / 1000;
}

function startClock() {
  state.startTime = performance.now();
  state.intervalId = setInterval(tick, 100);
  tick();
}

/** Format a number of seconds as m:ss (for infinite mode's count-up clock). */
function formatTime(totalSec) {
  const s = Math.floor(totalSec);
  return `${Math.floor(s / 60)}:${String(s % 60).padStart(2, '0')}`;
}

/** Per-tick update of the clock display + live stats; ends the test when due. */
function tick() {
  if (state.finished) return;
  if (state.mode === 'time') {
    const remaining = state.amount - elapsedSeconds();
    els.liveTimer.textContent = Math.max(0, Math.ceil(remaining));
    if (remaining <= 0) { finish(); return; }
  } else if (state.mode === 'words') {
    els.liveTimer.textContent = `${Math.min(state.wordIndex, state.amount)}/${state.amount}`;
  } else { // infinite — count up, never auto-finishes
    els.liveTimer.textContent = formatTime(elapsedSeconds());
  }
  updateLiveStats();
}

/** WPM = (correct chars / 5) / minutes elapsed. Standard typing convention. */
function computeWpm() {
  const minutes = elapsedSeconds() / 60;
  if (minutes <= 0) return 0;
  return Math.round((state.correctChars / 5) / minutes);
}

/** Accuracy = correct entries / total entries, as a percentage. */
function computeAccuracy() {
  if (state.typedEntries === 0) return 100;
  return Math.round((state.correctChars / state.typedEntries) * 100);
}

function updateLiveStats() {
  els.liveWpm.textContent = computeWpm();
  els.liveAcc.textContent = computeAccuracy();
}

/* =========================================================================
   Typing handling
   ========================================================================= */

/** Begin the test on the first keystroke. */
function beginTest() {
  state.started = true;
  els.live.classList.add('visible');
  startClock();
}

/** Re-evaluate and repaint the current word's character states. */
function paintWord(wordIndex) {
  const wordEl = inner.children[wordIndex];
  const target = state.words[wordIndex];
  const typed = state.typed[wordIndex] || [];

  // Remove any previously-added "extra" spans so we can rebuild them
  [...wordEl.querySelectorAll('.char.extra')].forEach((e) => e.remove());

  // Paint the target characters
  [...target].forEach((char, i) => {
    const charEl = wordEl.children[i];
    charEl.classList.remove('correct', 'incorrect');
    if (i < typed.length) {
      charEl.classList.add(typed[i] === char ? 'correct' : 'incorrect');
    }
  });

  // Any typed characters beyond the word length are shown as "extra" errors
  for (let i = target.length; i < typed.length; i++) {
    const extra = document.createElement('span');
    extra.className = 'char extra incorrect';
    extra.textContent = typed[i];
    wordEl.appendChild(extra);
  }
}

/** Handle a single printable character. */
function handleChar(char) {
  if (state.finished) return;
  if (!state.started) beginTest();

  const target = state.words[state.wordIndex];
  const typed = state.typed[state.wordIndex];

  typed.push(char);

  // Live tallies: correct vs incorrect (extra chars past the word count as errors)
  if (state.charIndex < target.length && char === target[state.charIndex]) {
    state.correctChars++;
  } else {
    state.incorrectChars++;
  }
  state.typedEntries++;

  state.charIndex++;
  paintWord(state.wordIndex);
  flickCursor();
  moveCursor();
  updateLiveStats();

  // Words mode: finishing the final word exactly ends the test (no trailing space needed)
  if (
    state.mode === 'words' &&
    state.wordIndex === state.amount - 1 &&
    typed.join('') === target
  ) {
    finish();
  }
}

/** Handle backspace within the current word. */
function handleBackspace() {
  if (state.finished) return;
  const typed = state.typed[state.wordIndex];

  if (state.charIndex === 0) {
    // At the start of a word — jump back into the previous word (if any)
    if (state.wordIndex > 0) {
      state.wordIndex--;
      state.charIndex = state.typed[state.wordIndex].length;
    }
  } else {
    state.charIndex--;
    const removed = typed.pop();
    const target = state.words[state.wordIndex];

    // Roll back the live tally for the character we just deleted
    if (state.charIndex < target.length && removed === target[state.charIndex]) {
      state.correctChars = Math.max(0, state.correctChars - 1);
    } else {
      state.incorrectChars = Math.max(0, state.incorrectChars - 1);
    }
    state.typedEntries = Math.max(0, state.typedEntries - 1);
  }

  paintWord(state.wordIndex);
  flickCursor();
  moveCursor();
  updateLiveStats();
}

/** Handle space — advance to the next word. */
function handleSpace() {
  if (state.finished || !state.started) return;
  // Ignore leading spaces (don't advance on an empty word)
  if (state.charIndex === 0) return;

  state.wordIndex++;
  state.charIndex = 0;

  if (state.mode === 'words') {
    // Reached the goal — submit and finish
    if (state.wordIndex >= state.amount) { finish(); return; }
    els.liveTimer.textContent = `${state.wordIndex}/${state.amount}`;
  } else {
    // Time mode: keep an endless supply of words
    if (state.wordIndex >= state.words.length - 10) {
      const more = generateWords(40);
      state.words.push(...more);
      more.forEach(() => state.typed.push([]));
      appendWords(more);
    }
  }

  flickCursor();
  moveCursor();
}

/** Briefly disable the cursor blink so movement reads as smooth. */
let flickTimeout = null;
function flickCursor() {
  cursor.classList.add('typing');
  clearTimeout(flickTimeout);
  flickTimeout = setTimeout(() => cursor.classList.remove('typing'), 400);
}

/* =========================================================================
   Finish + results
   ========================================================================= */

function finish() {
  if (state.finished) return;
  state.finished = true;
  state.finishTime = performance.now(); // freeze the clock for final stats
  clearInterval(state.intervalId);

  // Tally complete words: a word is "correct" if every char matches exactly.
  let correctWords = 0;
  let errorChars = 0;
  // Only judge words the user actually reached.
  const reached = state.charIndex > 0 ? state.wordIndex + 1 : state.wordIndex;
  for (let w = 0; w < reached; w++) {
    const target = state.words[w];
    const typed = state.typed[w] || [];
    if (typed.join('') === target) {
      correctWords++;
    } else {
      // Count mismatched / missing / extra characters as errors
      const len = Math.max(target.length, typed.length);
      for (let i = 0; i < len; i++) {
        if (typed[i] !== target[i]) errorChars++;
      }
    }
  }

  const wpm = computeWpm();

  // Best-score tracking (per mode + amount), persisted in localStorage
  const prevBest = getBest();
  const isNewBest = wpm > prevBest;
  if (isNewBest) setBest(wpm);

  // Reveal results
  els.resWpm.textContent = wpm;
  els.resAcc.textContent = computeAccuracy() + '%';
  els.resCorrect.textContent = correctWords;
  els.resErrors.textContent = errorChars;
  els.resBest.textContent = Math.max(wpm, prevBest);
  els.resTime.textContent = Math.round(elapsedSeconds()) + 's';
  els.newBest.classList.toggle('show', isNewBest);

  els.test.style.display = 'none';
  els.live.classList.remove('visible');
  els.results.classList.add('visible');
  els.results.setAttribute('aria-hidden', 'false');
}

function getBest() {
  try { return parseInt(localStorage.getItem(bestKey()), 10) || 0; }
  catch (e) { return 0; }
}
function setBest(v) {
  try { localStorage.setItem(bestKey(), String(v)); } catch (e) { /* ignore */ }
}

/* =========================================================================
   Restart
   ========================================================================= */

function restart() {
  clearInterval(state.intervalId);

  // Preserve the chosen mode + amount across the reset
  const { mode, amount } = state;
  state = {
    mode,
    amount,
    words: generateWords(mode === 'words' ? amount : 60),
    typed: [],
    wordIndex: 0,
    charIndex: 0,
    started: false,
    finished: false,
    startTime: null,
    finishTime: null,
    intervalId: null,
    correctChars: 0,
    incorrectChars: 0,
    typedEntries: 0,
  };
  state.words.forEach(() => state.typed.push([]));

  // Reset UI
  inner.style.transform = 'translateY(0)';
  els.test.style.display = '';
  els.results.classList.remove('visible');
  els.results.setAttribute('aria-hidden', 'true');
  els.newBest.classList.remove('show');
  els.live.classList.remove('visible');
  els.liveTimer.textContent =
    mode === 'time' ? amount : mode === 'words' ? `0/${amount}` : '0:00';
  els.liveWpm.textContent = '0';
  els.liveAcc.textContent = '100';

  renderWords();
  els.capture.focus();
}

/* =========================================================================
   Mode selection
   ========================================================================= */

/** Render the amount buttons for the current mode + reflect active states. */
function buildAmountButtons() {
  const isInfinite = state.mode === 'infinite';
  els.amountGroup.innerHTML = '';
  // Infinite has no amount — hide the divider + amount group via this class
  els.modes.classList.toggle('mode-no-amount', isInfinite);

  if (!isInfinite) {
    AMOUNTS[state.mode].forEach((n) => {
      const btn = document.createElement('button');
      btn.type = 'button';
      btn.className = 'mode';
      btn.dataset.amount = n;
      btn.textContent = n;
      btn.classList.toggle('active', n === state.amount);
      els.amountGroup.appendChild(btn);
    });
  }
  [...els.typeGroup.children].forEach((b) =>
    b.classList.toggle('active', b.dataset.type === state.mode)
  );
}

/** Switch between 'time', 'words', and 'infinite' modes. */
function setMode(mode) {
  if (mode === state.mode) return;
  state.mode = mode;
  // Keep a sensible amount if the current one isn't valid for the new mode
  if (mode !== 'infinite' && !AMOUNTS[mode].includes(state.amount)) {
    state.amount = mode === 'time' ? 30 : 25;
  }
  buildAmountButtons();
  restart();
}

/** Pick the amount (seconds or word goal) within the current mode. */
function setAmount(n) {
  state.amount = n;
  buildAmountButtons();
  restart();
}

/* =========================================================================
   Event wiring
   ========================================================================= */

// Mode: type toggle (time / words)
els.typeGroup.addEventListener('click', (e) => {
  const btn = e.target.closest('[data-type]');
  if (!btn) return;
  setMode(btn.dataset.type);
  els.capture.focus();
});

// Mode: amount selection
els.amountGroup.addEventListener('click', (e) => {
  const btn = e.target.closest('[data-amount]');
  if (!btn) return;
  setAmount(Number(btn.dataset.amount));
  els.capture.focus();
});

// Restart button
els.restart.addEventListener('click', () => {
  restart();
  els.capture.focus();
});

// Keep the hidden input focused so we always capture keystrokes
els.words.addEventListener('click', () => els.capture.focus());

// Theme switcher
els.themeToggle.addEventListener('click', toggleThemeMenu);
els.themeMenu.addEventListener('click', (e) => {
  const btn = e.target.closest('.theme-item');
  if (!btn) return;
  applyTheme(btn.dataset.theme);
  closeThemeMenu();
  els.capture.focus();
});
// Click outside the picker closes the menu
document.addEventListener('click', (e) => {
  if (!els.themePicker.contains(e.target) && !els.themeMenu.hidden) closeThemeMenu();
});

/**
 * Central keyboard handler.
 * Esc closes the theme menu if open; otherwise Tab / Esc restart.
 * Then route printable keys, space, and backspace into the test.
 */
document.addEventListener('keydown', (e) => {
  // Let Esc dismiss the theme menu first
  if (e.key === 'Escape' && !els.themeMenu.hidden) {
    e.preventDefault();
    closeThemeMenu();
    els.capture.focus();
    return;
  }

  // Restart shortcuts (work anytime)
  if (e.key === 'Tab' || e.key === 'Escape') {
    e.preventDefault();
    restart();
    els.capture.focus();
    return;
  }

  // Enter ends the current test early (the only way to finish in infinite mode)
  if (e.key === 'Enter') {
    e.preventDefault();
    if (state.started && !state.finished) finish();
    els.capture.focus();
    return;
  }

  if (e.key === 'Backspace') {
    e.preventDefault();
    handleBackspace();
    return;
  }

  if (e.key === ' ') {
    e.preventDefault();
    handleSpace();
    return;
  }

  // Printable single characters only (ignore Shift, Ctrl, arrows, etc.)
  if (e.key.length === 1 && !e.ctrlKey && !e.metaKey && !e.altKey) {
    e.preventDefault();
    handleChar(e.key);
  }
});

// Keep cursor aligned if the viewport changes (wrapping shifts positions)
window.addEventListener('resize', moveCursor);

/* =========================================================================
   Init
   ========================================================================= */
function init() {
  // Theme: restore saved choice (default amber)
  buildThemeMenu();
  let saved = 'amber';
  try { saved = localStorage.getItem(LS_THEME) || 'amber'; } catch (e) { /* ignore */ }
  applyTheme(PALETTES[saved] ? saved : 'amber');

  // Mode controls + first render
  buildAmountButtons();
  restart();
  els.capture.focus();
}

init();
