/* =========================================================================
   typetest — typing test logic
   No frameworks. Plain DOM + a small state machine.
   ========================================================================= */

/* ---- Word pool: 200 most common English words ---- */
const WORDS = [
  'the','be','to','of','and','a','in','that','have','I','it','for','not','on','with',
  'he','as','you','do','at','this','but','his','by','from','they','we','say','her','she',
  'or','an','will','my','one','all','would','there','their','what','so','up','out','if',
  'about','who','get','which','go','me','when','make','can','like','time','no','just','him',
  'know','take','people','into','year','your','good','some','could','them','see','other','than',
  'then','now','look','only','come','its','over','think','also','back','after','use','two','how',
  'our','work','first','well','way','even','new','want','because','any','these','give','day','most',
  'us','is','are','was','were','been','has','had','said','each','she','do','their','more','very',
  'find','here','thing','great','man','world','life','still','hand','high','place','old','small','play',
  'large','put','end','does','part','again','off','went','number','great','tell','men','need','feel',
  'three','state','never','become','between','high','really','something','most','another','much','family','own',
  'leave','keep','student','great','seem','same','while','last','might','close','open','next','few','word',
  'long','little','around','show','every','under','home','read','hard','book','side','both','turn','start',
  'point','head','house','run','move','live','believe','hold','bring','happen','must','before','large','such'
];

/* ---- Timer durations available ---- */
const TIMES = [15, 30, 60, 120];

/* ---- DOM references ---- */
const els = {
  modes:      document.getElementById('modes'),
  live:       document.getElementById('live'),
  liveTimer:  document.getElementById('liveTimer'),
  liveWpm:    document.getElementById('liveWpm'),
  liveAcc:    document.getElementById('liveAcc'),
  test:       document.getElementById('test'),
  words:      document.getElementById('words'),
  capture:    document.getElementById('capture'),
  results:    document.getElementById('results'),
  resWpm:     document.getElementById('resWpm'),
  resAcc:     document.getElementById('resAcc'),
  resCorrect: document.getElementById('resCorrect'),
  resErrors:  document.getElementById('resErrors'),
  restart:    document.getElementById('restart'),
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

/* =========================================================================
   State
   ========================================================================= */
let state = {
  duration: 30,        // selected timer length (seconds)
  words: [],           // array of target word strings
  typed: [],           // array of arrays: typed[wordIndex] = ['t','h',...]
  wordIndex: 0,        // current word being typed
  charIndex: 0,        // current char position within current word
  started: false,      // has the user typed the first key?
  finished: false,     // has the test ended?
  timeLeft: 30,        // countdown remaining
  intervalId: null,    // setInterval handle for the timer
  // Tallies updated live as keys are pressed:
  correctChars: 0,     // total correctly typed characters (for WPM)
  incorrectChars: 0,   // total mistakes (for accuracy)
  typedEntries: 0,     // total keypresses counted toward accuracy
};

/* =========================================================================
   Word generation + rendering
   ========================================================================= */

/** Pick `count` random words from the pool. */
function generateWords(count = 60) {
  const out = [];
  for (let i = 0; i < count; i++) {
    out.push(WORDS[Math.floor(Math.random() * WORDS.length)]);
  }
  return out;
}

/** Render the word list into the DOM as nested spans. */
function renderWords() {
  inner.innerHTML = '';
  state.words.forEach((word, w) => {
    const wordEl = document.createElement('span');
    wordEl.className = 'word';
    wordEl.dataset.index = w;

    [...word].forEach((char) => {
      const charEl = document.createElement('span');
      charEl.className = 'char';
      charEl.textContent = char;
      wordEl.appendChild(charEl);
    });

    inner.appendChild(wordEl);
  });

  // Cursor lives inside the scrolling strip, after the words
  inner.appendChild(cursor);

  // Mount the strip into the viewport (idempotent)
  if (inner.parentElement !== els.words) {
    els.words.innerHTML = '';
    els.words.appendChild(inner);
  }
  moveCursor();
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

function startTimer() {
  state.timeLeft = state.duration;
  els.liveTimer.textContent = state.timeLeft;

  state.intervalId = setInterval(() => {
    state.timeLeft--;
    els.liveTimer.textContent = state.timeLeft;
    updateLiveStats();
    if (state.timeLeft <= 0) finish();
  }, 1000);
}

/** Elapsed seconds since the test started. */
function elapsedSeconds() {
  return state.duration - state.timeLeft;
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
  startTimer();
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

  // Live tallies: only count entries within the target word's length for accuracy
  if (state.charIndex < target.length) {
    if (char === target[state.charIndex]) {
      state.correctChars++;
    } else {
      state.incorrectChars++;
    }
    state.typedEntries++;
  } else {
    // Extra character past the word — counts as an error
    state.incorrectChars++;
    state.typedEntries++;
  }

  state.charIndex++;
  paintWord(state.wordIndex);
  flickCursor();
  moveCursor();
  updateLiveStats();
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
    if (state.charIndex < target.length) {
      if (removed === target[state.charIndex]) {
        state.correctChars = Math.max(0, state.correctChars - 1);
      } else {
        state.incorrectChars = Math.max(0, state.incorrectChars - 1);
      }
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

  // Generate more words if we're running low (endless supply)
  if (state.wordIndex >= state.words.length - 10) {
    const more = generateWords(40);
    state.words.push(...more);
    more.forEach(() => state.typed.push([]));
    appendWords(more);
  }

  flickCursor();
  moveCursor();
}

/** Append freshly generated words to the DOM without re-rendering everything. */
function appendWords(newWords) {
  const startIndex = state.words.length - newWords.length;
  newWords.forEach((word, i) => {
    const wordEl = document.createElement('span');
    wordEl.className = 'word';
    wordEl.dataset.index = startIndex + i;
    [...word].forEach((char) => {
      const charEl = document.createElement('span');
      charEl.className = 'char';
      charEl.textContent = char;
      wordEl.appendChild(charEl);
    });
    inner.insertBefore(wordEl, cursor);
  });
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
  clearInterval(state.intervalId);

  // Tally complete words: a word is "correct" if every char matches exactly.
  let correctWords = 0;
  let errorChars = 0;
  // Only judge words the user actually reached (up to the current word index).
  const reached = state.charIndex > 0 ? state.wordIndex + 1 : state.wordIndex;
  for (let w = 0; w < reached; w++) {
    const target = state.words[w];
    const typed = state.typed[w] || [];
    const joined = typed.join('');
    if (joined === target) {
      correctWords++;
    } else {
      // Count mismatched / missing / extra characters as errors
      const len = Math.max(target.length, typed.length);
      for (let i = 0; i < len; i++) {
        if (typed[i] !== target[i]) errorChars++;
      }
    }
  }

  // Reveal results
  els.resWpm.textContent = computeWpm();
  els.resAcc.textContent = computeAccuracy() + '%';
  els.resCorrect.textContent = correctWords;
  els.resErrors.textContent = errorChars;

  els.test.style.display = 'none';
  els.live.classList.remove('visible');
  els.results.classList.add('visible');
  els.results.setAttribute('aria-hidden', 'false');
}

/* =========================================================================
   Restart
   ========================================================================= */

function restart() {
  // Stop any running timer
  clearInterval(state.intervalId);

  // Reset state (preserve the chosen duration)
  const duration = state.duration;
  state = {
    duration,
    words: generateWords(60),
    typed: [],
    wordIndex: 0,
    charIndex: 0,
    started: false,
    finished: false,
    timeLeft: duration,
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
  els.live.classList.remove('visible');
  els.liveTimer.textContent = duration;
  els.liveWpm.textContent = '0';
  els.liveAcc.textContent = '100';

  renderWords();
  els.capture.focus();
}

/* =========================================================================
   Mode selection
   ========================================================================= */

function setDuration(seconds) {
  state.duration = seconds;
  // Update active button styling
  [...els.modes.children].forEach((btn) => {
    btn.classList.toggle('active', Number(btn.dataset.time) === seconds);
  });
  restart();
}

/* =========================================================================
   Event wiring
   ========================================================================= */

// Mode buttons
els.modes.addEventListener('click', (e) => {
  const btn = e.target.closest('.mode');
  if (!btn) return;
  setDuration(Number(btn.dataset.time));
});

// Restart button
els.restart.addEventListener('click', () => {
  restart();
  els.capture.focus();
});

// Keep the hidden input focused so we always capture keystrokes
els.words.addEventListener('click', () => els.capture.focus());

/**
 * Central keyboard handler.
 * Tab / Esc restart. Otherwise route printable keys, space, and backspace.
 */
document.addEventListener('keydown', (e) => {
  // Restart shortcuts (work anytime)
  if (e.key === 'Tab' || e.key === 'Escape') {
    e.preventDefault();
    restart();
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
  setDuration(30); // default mode; also performs the first render via restart()
  els.capture.focus();
}

init();
