/**
 * Presentation layer — view classes.
 * Each view owns a slice of the DOM and knows how to render it.
 * Views are "dumb": they receive data + callbacks and never touch services/state.
 */
window.DSA = window.DSA || {};

(function () {
  const { escapeHtml } = DSA.util;
  const RankService = DSA.RankService;

  /** Sidebar: rank-grouped, color-coded levels + problems. */
  class SidebarView {
    constructor(container) {
      this.container = container;
    }

    /**
     * @param {Object} vm
     *  levels, storage, activeId, openLevels:Set,
     *  onSelectProblem(id), onToggleLevel(id)
     */
    render(vm) {
      const { levels, storage, activeId, openLevels } = vm;
      this.container.innerHTML = "";

      let lastRankKey = null;
      levels.forEach((lv) => {
        const rank = RankService.forLevel(lv.id);

        // Insert a rank header when the tier changes.
        if (rank.key !== lastRankKey) {
          this.container.appendChild(this._rankHeader(rank, levels, storage));
          lastRankKey = rank.key;
        }

        this.container.appendChild(this._levelCard(lv, rank, vm));
      });
    }

    _rankHeader(rank, levels, storage) {
      // progress within this rank
      const inRank = levels.filter((l) => RankService.forLevel(l.id).key === rank.key);
      let done = 0, total = 0;
      inRank.forEach((l) => l.problems.forEach((p) => { total++; if (storage.isComplete(p.id)) done++; }));

      const header = document.createElement("div");
      header.className = "rank-header";
      header.style.setProperty("--rank", rank.color);
      header.style.setProperty("--rank-bg", rank.bg);
      header.innerHTML = `
        <span class="rank-emoji">${rank.emoji}</span>
        <span class="rank-titles">
          <span class="rank-tier">${escapeHtml(rank.tier)}</span>
          <span class="rank-name">${escapeHtml(rank.title)}</span>
        </span>
        <span class="rank-progress">${done}/${total}</span>
      `;
      return header;
    }

    _levelCard(lv, rank, vm) {
      const { storage, activeId, openLevels, onSelectProblem, onToggleLevel } = vm;
      const doneCount = lv.problems.filter((p) => storage.isComplete(p.id)).length;
      const levelDone = doneCount === lv.problems.length;
      const isOpen = openLevels.has(lv.id);

      const level = document.createElement("div");
      level.className = "level" + (levelDone ? " done" : "") + (isOpen ? " open" : "");
      level.style.setProperty("--rank", rank.color);
      level.dataset.levelId = lv.id;

      const header = document.createElement("div");
      header.className = "level-header";
      header.innerHTML = `
        <span class="level-num">${lv.id}</span>
        <div class="level-info">
          <div class="level-name">${escapeHtml(lv.name)}</div>
          <div class="level-meta">${escapeHtml(lv.difficulty)}</div>
        </div>
        <span class="level-count">${doneCount}/${lv.problems.length}</span>
        <span class="level-chevron">▶</span>
      `;
      header.addEventListener("click", () => onToggleLevel(lv.id));
      level.appendChild(header);

      const list = document.createElement("div");
      list.className = "problem-list";
      const inner = document.createElement("div");
      inner.className = "pl-inner";
      lv.problems.forEach((p) => {
        const done = storage.isComplete(p.id);
        const item = document.createElement("div");
        item.className =
          "problem-item" + (done ? " completed" : "") + (activeId === p.id ? " active" : "");
        item.dataset.problemId = p.id;
        item.innerHTML = `
          <span class="problem-check">${done ? "✓" : ""}</span>
          <span class="problem-name">${escapeHtml(p.title)}</span>
        `;
        item.addEventListener("click", () => onSelectProblem(p.id));
        inner.appendChild(item);
      });
      list.appendChild(inner);
      level.appendChild(list);
      return level;
    }
  }

  /** Problem detail panel. */
  class ProblemView {
    constructor(refs) { this.refs = refs; }

    _set(id, value, wrapId) {
      const el = document.getElementById(id);
      if (el) el.textContent = value || "";
      if (wrapId) {
        const w = document.getElementById(wrapId);
        if (w) w.classList.toggle("hidden", !(value && String(value).trim()));
      }
    }

    show(problem, level, rank) {
      const r = this.refs;
      r.emptyState.classList.add("hidden");
      r.detail.classList.remove("hidden");
      r.detail.classList.remove("enter");
      void r.detail.offsetWidth;
      r.detail.classList.add("enter");
      r.detail.scrollTop = 0;

      // header: category badge + question number
      r.badge.textContent = (level.icon ? level.icon + " " : "") + level.name;
      r.badge.style.background = rank.color;
      this._set("problemQnum", "Q" + (problem.num || "") + " / 75");

      // difficulty pill (color by difficulty) + pattern pill
      const diff = problem.difficulty || level.difficulty || "Easy";
      r.difficulty.textContent = diff;
      r.difficulty.className = "difficulty diff-" + diff.toLowerCase();
      this._set("problemPattern", problem.pattern, null);
      const pp = document.getElementById("problemPattern");
      if (pp) pp.classList.toggle("hidden", !(problem.pattern && problem.pattern.trim()));

      r.title.textContent = problem.title;
      this._set("problemWhy", problem.why, "problemWhyWrap");

      r.prompt.textContent = problem.prompt;
      r.exInput.textContent = problem.input || "—";
      r.exOutput.textContent = problem.output || "—";

      this._set("problemConstraints", problem.constraints, "constraintsWrap");
      this._set("problemBrute", problem.brute, "bruteWrap");
      this._set("problemOptimal", problem.optimal, "optimalWrap");
      this._set("problemIntuition", problem.intuition, "intuitionWrap");
      this._set("problemDryRun", problem.dryRun, "dryRunWrap");

      this._set("problemTime", problem.time, null);
      this._set("problemSpace", problem.space, null);
      const cx = document.getElementById("complexityWrap");
      if (cx) cx.classList.toggle("hidden", !((problem.time && problem.time.trim()) || (problem.space && problem.space.trim())));

      this._set("problemMistakes", problem.mistakes, "mistakesWrap");
      this._renderFollowups(problem.followups);
      this._renderSolution(problem.solutionPy);
      this._set("problemTakeaway", problem.takeaway, "takeawayWrap");

      // expected function/class name to guide the JS attempt
      const sig = DSA.util.signatureOf(problem.starter);
      if (sig && r.signature && r.signatureCode) {
        r.signatureCode.textContent = sig;
        r.signature.classList.remove("hidden");
      } else if (r.signature) {
        r.signature.classList.add("hidden");
      }
    }

    _renderFollowups(text) {
      const wrap = document.getElementById("followupsWrap");
      const host = document.getElementById("problemFollowups");
      if (!host || !wrap) return;
      const items = (text || "")
        .split(/\n|(?=•)/)
        .map((s) => s.replace(/^[•\-\s]+/, "").trim())
        .filter(Boolean);
      if (!items.length) { wrap.classList.add("hidden"); host.innerHTML = ""; return; }
      wrap.classList.remove("hidden");
      host.innerHTML = "<ul class='followup-list'>" +
        items.map((i) => "<li>" + escapeHtml(i) + "</li>").join("") + "</ul>";
    }

    _renderSolution(code) {
      const wrap = document.getElementById("solutionWrap");
      const pre = document.getElementById("problemSolution");
      const toggle = document.getElementById("solutionToggle");
      if (!wrap || !pre) return;
      if (!code || !code.trim()) { wrap.classList.add("hidden"); return; }
      wrap.classList.remove("hidden");
      const codeEl = pre.querySelector("code") || pre;
      codeEl.textContent = code;
      pre.classList.add("hidden");
      if (toggle) {
        toggle.textContent = "Show";
        toggle.onclick = () => {
          const hidden = pre.classList.toggle("hidden");
          toggle.textContent = hidden ? "Show" : "Hide";
        };
      }
    }
  }

  /** Code editor (textarea) with filename tab, line-number gutter + key handling. */
  class EditorView {
    constructor(textarea, titleEl, { onRun, gutter } = {}) {
      this.ta = textarea;
      this.titleEl = titleEl;
      this.gutter = gutter || null;

      this.ta.addEventListener("keydown", (e) => {
        if (e.key === "Tab") {
          e.preventDefault();
          const s = this.ta.selectionStart, en = this.ta.selectionEnd;
          this.ta.value = this.ta.value.slice(0, s) + "  " + this.ta.value.slice(en);
          this.ta.selectionStart = this.ta.selectionEnd = s + 2;
          this._renderGutter();
        }
        if ((e.ctrlKey || e.metaKey) && e.key === "Enter") {
          e.preventDefault();
          if (onRun) onRun();
        }
      });
      this.ta.addEventListener("input", () => this._renderGutter());
      this.ta.addEventListener("scroll", () => {
        if (this.gutter) this.gutter.scrollTop = this.ta.scrollTop;
      });
    }
    _renderGutter() {
      if (!this.gutter) return;
      const lines = Math.max(1, this.ta.value.split("\n").length);
      // only rebuild when line count changes
      if (this.gutter.childElementCount !== lines) {
        let html = "";
        for (let i = 1; i <= lines; i++) html += i + "\n";
        this.gutter.textContent = html;
      }
      this.gutter.scrollTop = this.ta.scrollTop;
    }
    setFile(name) { this.titleEl.textContent = name; }
    getValue() { return this.ta.value; }
    setValue(v) { this.ta.value = v; this._renderGutter(); }
    setEnabled(on) { this.ta.disabled = !on; }
    focus() { this.ta.focus(); }
  }

  /** Toast notifications (bottom-right, auto-dismiss, stacked). */
  class ToastView {
    constructor(container) { this.container = container; }
    show({ icon = "🎉", title = "", msg = "", gold = false, duration = 3600 } = {}) {
      const t = document.createElement("div");
      t.className = "toast" + (gold ? " gold" : "");
      t.innerHTML =
        '<span class="toast-ic">' + icon + "</span>" +
        '<span class="toast-body"><span class="toast-title"></span><span class="toast-msg"></span></span>';
      t.querySelector(".toast-title").textContent = title;
      t.querySelector(".toast-msg").textContent = msg;
      this.container.appendChild(t);
      requestAnimationFrame(() => t.classList.add("in"));
      const kill = () => {
        t.classList.remove("in");
        t.addEventListener("transitionend", () => t.remove(), { once: true });
        setTimeout(() => t.remove(), 400);
      };
      const timer = setTimeout(kill, duration);
      t.addEventListener("click", () => { clearTimeout(timer); kill(); });
    }
  }

  /** Output console. */
  class OutputView {
    constructor(pre) { this.pre = pre; }
    clear() { this.pre.innerHTML = ""; }
    line(text, type) {
      const div = document.createElement("div");
      div.className = "out-line" +
        (type === "error" ? " out-error" : type === "meta" ? " out-meta" : type === "success" ? " out-success" : "");
      div.textContent = text;
      this.pre.appendChild(div);
      this.pre.scrollTop = this.pre.scrollHeight;
    }
    meta(text) { this.clear(); this.line(text, "meta"); }

    /** Render validation results as a header + per-assertion pass/fail lines. */
    renderResults(results) {
      const passed = results.filter((r) => r.pass).length;
      const all = passed === results.length;
      const header = document.createElement("div");
      header.className = "out-line test-summary " + (all ? "pass" : "fail");
      header.textContent = (all ? "✔ All tests passed" : "✖ " + passed + "/" + results.length + " tests passed") +
        "  (" + passed + "/" + results.length + ")";
      this.pre.appendChild(header);
      results.forEach((r) => {
        if (r.pass) {
          this.line(r.call + "  →  " + r.actual, "success");
        } else if (r.error) {
          this.line(r.call + "  →  threw: " + r.error, "error");
        } else {
          this.line(r.call + "  →  got " + r.actual + "   expected " + r.expected, "error");
        }
      });
      this.pre.scrollTop = this.pre.scrollHeight;
      return all;
    }
  }

  /** Overall progress bar. */
  class ProgressView {
    constructor(textEl, fillEl) { this.textEl = textEl; this.fillEl = fillEl; }
    update(done, total) {
      this.textEl.textContent = done + " / " + total;
      this.fillEl.style.width = (total ? (done / total) * 100 : 0) + "%";
    }
  }

  /** Solution tabs (multiple attempts per problem, VS Code style). */
  class SolutionTabsView {
    constructor(container) { this.container = container; }
    render({ slots, active, onSelect, onAdd, onClose }) {
      this.container.innerHTML = "";
      slots.forEach((slot, idx) => {
        const tab = document.createElement("div");
        tab.className = "sol-tab" + (slot === active ? " active" : "");
        const name = document.createElement("span");
        name.className = "sol-name";
        name.textContent = "Solution " + (idx + 1);
        tab.appendChild(name);
        if (slots.length > 1) {
          const x = document.createElement("button");
          x.className = "sol-close"; x.textContent = "×"; x.title = "Delete this solution";
          x.addEventListener("click", (e) => { e.stopPropagation(); onClose(slot); });
          tab.appendChild(x);
        }
        tab.addEventListener("click", () => onSelect(slot));
        this.container.appendChild(tab);
      });
      const add = document.createElement("button");
      add.className = "sol-add"; add.textContent = "+"; add.title = "Add another solution";
      add.addEventListener("click", onAdd);
      this.container.appendChild(add);
    }
  }

  /** Performance panel: per-solution run times, with the fastest highlighted. */
  class PerfView {
    constructor(container) { this.container = container; }
    render({ slots, times, activeSlot }) {
      const timed = slots.filter((s) => times[s] != null);
      if (!timed.length) { this.container.classList.add("hidden"); this.container.innerHTML = ""; return; }
      this.container.classList.remove("hidden");

      let fastest = null, best = Infinity;
      timed.forEach((s) => { if (times[s] < best) { best = times[s]; fastest = s; } });

      let rows = "";
      slots.forEach((s, idx) => {
        const t = times[s];
        const isFast = s === fastest && timed.length > 1;
        rows +=
          '<div class="perf-row' + (s === activeSlot ? " active" : "") + (isFast ? " fastest" : "") + '">' +
            '<span class="perf-name">Solution ' + (idx + 1) + "</span>" +
            '<span class="perf-time">' + (t != null ? DSA.util.fmtTime(t) : "—") + "</span>" +
            (isFast ? '<span class="perf-badge">⚡ Fastest</span>' : "") +
          "</div>";
      });

      this.container.innerHTML =
        '<div class="perf-head">⏱ Performance <span class="perf-sub">avg / run</span></div>' + rows;
    }
  }

  DSA.views = { SidebarView, ProblemView, EditorView, OutputView, ProgressView, ToastView, SolutionTabsView, PerfView };
})();
