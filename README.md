# DSA Patterns Playground

An interactive, in-browser playground to master Data Structures & Algorithms the
**pattern-first** way — read a full walkthrough for each question, practice in
modern ES6 JavaScript, run it safely, and compare against the reference Python
solution. Built with **vanilla JS + the Monaco editor** (the engine behind VS
Code), no build step required.

**Live demo:** https://varunjakkampudi-tech.github.io/dsa-roadmap-playground/

## Features

- **75 curated questions across 14 pattern categories** — Arrays & Hashing, Two
  Pointers, Sliding Window, Binary Search, Strings, Linked Lists, Stack & Queue,
  Trees & BST, Heap, Backtracking, Graphs, DP, Greedy, Bit Manipulation — in the
  exact order of the interview guide.
- **Full walkthrough per question** — why it matters, the pattern, brute-force &
  optimal approaches, step-by-step intuition, dry run, time/space complexity,
  common mistakes, interview follow-ups, a Python reference solution, and the key
  takeaway.
- **Monaco editor** with syntax highlighting, IntelliSense/function suggestions,
  and code formatting.
- **Run** — execute your JavaScript in a sandboxed Web Worker (with an
  infinite-loop timeout).
- **Multiple solutions per problem** with independent tabs and execution timing.
- **Gamification** — XP, daily streaks, achievement badges, confetti, and four
  learning tiers (Foundations → Interview Mastery).
- **Common login** with isolated per-name progress.
- **Export / Import** your progress as a JSON backup.
- Auto-saves everything to `localStorage`.

## Run locally

It's a static site — just serve the folder:

```bash
# any static server, e.g.
npx serve .
# or VS Code Live Server, then open index.html
```

Then open `index.html`.

## Sign in

The login is a lightweight client-side gate (this is a static app — it is **not**
real authentication; the password is visible in the source). It exists to keep
each person's saved progress separate.

- Enter **any name** and the shared password **`dsa2024`**.
- Your progress is saved under that name, so different people can keep separate
  progress while signing in with the same common password.

Change the shared password in [`js/AuthService.js`](js/AuthService.js).

## Moving your progress between origins/devices

Because progress lives in the browser's `localStorage` (which is per-origin),
use the **Export** button to download a backup, then **Import** it on the other
site/browser.

## Project structure

```
index.html          # app shell + login gate
styles.css          # design system
data.js             # problem dataset (levels + problems)
js/
  util.js           # helpers
  AuthService.js    # client-side login gate
  StorageService.js # per-user localStorage persistence + export/import
  RankService.js    # rank ladder logic
  AchievementService.js
  CodeRunner.js     # sandboxed Web Worker runner + benchmark
  MonacoEditor.js   # Monaco wrapper (with textarea fallback)
  tests.js          # hidden validation fixtures
  views.js          # presentation layer
  AppController.js  # orchestration
```

## License

MIT
