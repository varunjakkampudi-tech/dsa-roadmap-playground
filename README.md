# DSA Roadmap Playground

An interactive, in-browser playground to learn and practice Data Structures &
Algorithms — write modern ES6 JavaScript, run it safely, and validate your
solution against hidden test cases. Built with **vanilla JS + the Monaco editor**
(the engine behind VS Code), no build step required.

**Live demo:** https://varunjakkampudi-tech.github.io/dsa-roadmap-playground/

## Features

- **30 levels · 94 problems** across a Beginner → Top-Tier roadmap (arrays,
  strings, hashing, stacks/queues, trees, graphs, DP, backtracking, and more).
- **Monaco editor** with syntax highlighting, IntelliSense/function suggestions,
  and code formatting.
- **Run & validate** — execute code in a sandboxed Web Worker (with an
  infinite-loop timeout) and auto-complete a problem when all tests pass.
- **Multiple solutions per problem** with independent tabs.
- **Execution timing** — benchmark each solution and see which is fastest.
- **Gamification** — XP, daily streaks, achievement badges, confetti, and a
  colour-coded rank ladder (Bronze → Grandmaster).
- **Per-user login** (client-side) with isolated progress.
- **Export / Import** your progress as a JSON backup to move it across
  browsers/devices.
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
real authentication; credentials are visible in the source). It exists to keep
each user's saved progress separate.

- `admin` / `admin123`
- `varun` / `varun123`

Edit users in [`js/AuthService.js`](js/AuthService.js).

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
