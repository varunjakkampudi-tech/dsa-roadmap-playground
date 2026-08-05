/**
 * AppController — orchestration layer (the "brain").
 * Wires the DOM, coordinates services (storage, runner, ranks) and views.
 * Holds the only mutable UI state (current selection, open levels).
 */
window.DSA = window.DSA || {};

(function () {
  const { util, StorageService, CodeRunner, RankService, AchievementService, views } = DSA;

  class AppController {
    constructor(levels, user, auth) {
      this.levels = levels;
      this.total = levels.reduce((n, lv) => n + lv.problems.length, 0);
      this.user = user || "";
      this.auth = auth || null;

      // services (storage namespaced per signed-in user)
      this.storage = new StorageService("dsa_playground_v2", this.user);
      this.runner = new CodeRunner();

      // ui state
      this.current = null;
      this.currentLevel = null;
      this.openLevels = new Set();

      // lookup maps
      this.problemById = {};
      this.levelByProblemId = {};
      levels.forEach((lv) =>
        lv.problems.forEach((p) => {
          this.problemById[p.id] = p;
          this.levelByProblemId[p.id] = lv;
        })
      );

      this._cacheDom();
      this._initViews();
      this._bindEvents();
    }

    _cacheDom() {
      const $ = (id) => document.getElementById(id);
      this.el = {
        sidebar: $("sidebar"),
        emptyState: $("emptyState"), detail: $("problemDetail"),
        badge: $("problemBadge"), difficulty: $("problemDifficulty"),
        title: $("problemTitle"), prompt: $("problemPrompt"),
        exInput: $("exampleInput"), exOutput: $("exampleOutput"),
        editor: $("codeEditor"), editorTitle: $("editorTitle"),
        monacoHost: $("monacoHost"), formatBtn: $("formatBtn"),
        runBtn: $("runBtn"), completeBtn: $("completeBtn"),
        checkBtn: $("checkBtn"),
        resetCodeBtn: $("resetCodeBtn"), clearOutputBtn: $("clearOutputBtn"),
        resetAllBtn: $("resetAllBtn"), output: $("output"),
        overallText: $("overallText"), overallFill: $("overallFill"),
        xpText: $("xpText"), streakText: $("streakText"),
        gutter: $("gutter"), maximizeBtn: $("maximizeBtn"),
        resizeHandle: $("resizeHandle"), outputPanel: $("outputPanel"),
        layout: document.querySelector(".layout"),
        center: document.querySelector(".center"),
        toastContainer: $("toastContainer"),
        exportBtn: $("exportBtn"), importBtn: $("importBtn"), importInput: $("importInput"),
        summaryBtn: $("summaryBtn"),
        logoutBtn: $("logoutBtn"), userName: $("userName"),
      };
    }

    _initViews() {
      this.sidebarView = new views.SidebarView(this.el.sidebar);
      this.problemView = new views.ProblemView({
        emptyState: this.el.emptyState, detail: this.el.detail,
        badge: this.el.badge, difficulty: this.el.difficulty,
        title: this.el.title, prompt: this.el.prompt,
        exInput: this.el.exInput, exOutput: this.el.exOutput,
        signature: document.getElementById("problemSignature"),
        signatureCode: document.getElementById("signatureCode"),
      });
      this.editorView = new DSA.MonacoEditor(this.el.monacoHost, this.el.editorTitle, {
        onRun: () => this.run(),
        onChange: (val) => this._autosave(val),
      });
      this.outputView = new views.OutputView(this.el.output);
      this.progressView = new views.ProgressView(this.el.overallText, this.el.overallFill);
      this.toast = new views.ToastView(this.el.toastContainer);
      this.tabsView = new views.SolutionTabsView(document.getElementById("solutionTabs"));
      this.perfView = new views.PerfView(document.getElementById("perfPanel"));
    }

    _bindEvents() {
      this.el.runBtn.addEventListener("click", () => this.run());
      this.el.checkBtn.addEventListener("click", () => this.check());
      this.el.clearOutputBtn.addEventListener("click", () => this.outputView.clear());
      this.el.completeBtn.addEventListener("click", () => this.toggleComplete());
      this.el.resetCodeBtn.addEventListener("click", () => this.resetCode());
      if (this.el.resetAllBtn) this.el.resetAllBtn.addEventListener("click", () => this.resetAll());
      this.el.maximizeBtn.addEventListener("click", () => this.toggleMaximize());
      this.el.formatBtn.addEventListener("click", () => this.editorView.format());
      if (this.el.userName) this.el.userName.textContent = this.user || "guest";
      const avatar = document.getElementById("userAvatar");
      if (avatar) avatar.textContent = (this.user || "g").charAt(0).toUpperCase();
      if (this.el.logoutBtn) this.el.logoutBtn.addEventListener("click", () => this._logout());
      if (this.el.exportBtn) this.el.exportBtn.addEventListener("click", () => this._exportProgress());
      if (this.el.summaryBtn) this.el.summaryBtn.addEventListener("click", () => this._downloadSummary());
      if (this.el.importBtn) this.el.importBtn.addEventListener("click", () => this.el.importInput.click());
      if (this.el.importInput) this.el.importInput.addEventListener("change", (e) => this._importProgress(e));
      this._initResize();
      window.addEventListener("beforeunload", () => this._persistCode());
    }

    _logout() {
      this._persistCode();
      if (this.auth) this.auth.logout();
      location.reload();
    }

    _downloadSummary() {
      const md = DSA.ReportService.buildMarkdown(this.storage, this.levels, this.user);
      const blob = new Blob([md], { type: "text/markdown;charset=utf-8" });
      const a = document.createElement("a");
      a.href = URL.createObjectURL(blob);
      a.download = "dsa-progress-report-" + (this.user || "guest") + ".md";
      document.body.appendChild(a);
      a.click();
      a.remove();
      this.toast.show({ icon: "📄", title: "Summary downloaded", msg: a.download });
    }

    _exportProgress() {
      const data = this.storage.exportState();
      const blob = new Blob([data], { type: "application/json" });
      const a = document.createElement("a");
      a.href = URL.createObjectURL(blob);
      a.download = "dsa-progress-" + (this.user || "guest") + ".json";
      document.body.appendChild(a);
      a.click();
      a.remove();
      this.toast.show({ icon: "⬇", title: "Progress exported", msg: a.download });
    }

    _importProgress(e) {
      const file = e.target.files && e.target.files[0];
      if (!file) return;
      const reader = new FileReader();
      reader.onload = () => {
        try {
          this.storage.importState(reader.result);
          this.toast.show({ icon: "✅", title: "Progress imported", msg: "Reloading…" });
          setTimeout(() => location.reload(), 700);
        } catch (err) {
          this.toast.show({ icon: "⚠", title: "Import failed", msg: err.message });
        }
      };
      reader.readAsText(file);
      e.target.value = "";
    }

    // Focus mode: hide files + question + output, give the editor everything.
    toggleMaximize() {
      const on = this.el.layout.classList.toggle("focus");
      this.el.maximizeBtn.textContent = on ? "⇲ Exit" : "⇱ Focus";
      this.editorView.focus();
    }

    // Drag the handle to resize the output panel.
    _initResize() {
      const handle = this.el.resizeHandle, panel = this.el.outputPanel;
      let startY = 0, startH = 0, dragging = false;
      const onMove = (e) => {
        if (!dragging) return;
        const dy = startY - e.clientY;
        const max = this.el.center.clientHeight - 160;
        const h = Math.min(max, Math.max(90, startH + dy));
        panel.style.flexBasis = h + "px";
      };
      const onUp = () => { dragging = false; document.body.style.cursor = ""; window.removeEventListener("pointermove", onMove); window.removeEventListener("pointerup", onUp); };
      handle.addEventListener("pointerdown", (e) => {
        dragging = true; startY = e.clientY; startH = panel.getBoundingClientRect().height;
        document.body.style.cursor = "row-resize";
        window.addEventListener("pointermove", onMove);
        window.addEventListener("pointerup", onUp);
      });
    }

    // ---- rendering ----
    renderSidebar() {
      this.sidebarView.render({
        levels: this.levels,
        storage: this.storage,
        activeId: this.current ? this.current.id : null,
        openLevels: this.openLevels,
        onSelectProblem: (id) => this.selectProblem(id),
        onToggleLevel: (id) => this.toggleLevel(id),
      });
    }

    refreshProgress() {
      this.progressView.update(this.storage.completedCount(), this.total);
    }

    refreshStats() {
      this.el.xpText.textContent = this.storage.getXp() + " XP";
      const s = this.storage.getStreak();
      this.el.streakText.textContent = s + (s === 1 ? " Day Streak" : " Day Streak");
    }

    // ---- interactions ----
    toggleLevel(id) {
      const isOpen = this.openLevels.has(id);
      isOpen ? this.openLevels.delete(id) : this.openLevels.add(id);
      // cheap: just toggle the class instead of rebuilding the whole sidebar
      const el = this.el.sidebar.querySelector('.level[data-level-id="' + id + '"]');
      if (el) el.classList.toggle("open", !isOpen);
      else this.renderSidebar();
    }

    // Move the active highlight without rebuilding the sidebar.
    _highlightActive(id) {
      const prev = this.el.sidebar.querySelectorAll(".problem-item.active");
      prev.forEach((el) => el.classList.remove("active"));
      const item = this.el.sidebar.querySelector('.problem-item[data-problem-id="' + id + '"]');
      if (item) {
        item.classList.add("active");
        const lvl = item.closest(".level");
        if (lvl) lvl.classList.add("open");
      } else {
        this.renderSidebar();
      }
    }

    selectProblem(id) {
      this._persistCode();
      this.current = this.problemById[id];
      this.currentLevel = this.levelByProblemId[id];
      if (!this.current) return;
      this.openLevels.add(this.currentLevel.id);

      const rank = RankService.forLevel(this.currentLevel.id);
      this.problemView.show(this.current, this.currentLevel, rank);

      this.activeSlot = this.storage.getActiveSolution(this.current.id);
      this.editorView.setEnabled(true);
      this._loadActiveSolution();
      this._renderTabs();

      ["runBtn", "resetCodeBtn", "maximizeBtn", "formatBtn"].forEach((k) => (this.el[k].disabled = false));
      const hasTests = !!(DSA.TESTS && DSA.TESTS[this.current.id]);
      this.el.checkBtn.disabled = false;
      this.el.checkBtn.title = hasTests ? "Validate against test cases" : "No automated tests for this problem";
      // Completion is EARNED by passing tests — hide the manual button when the
      // problem has tests. Keep it only for problems without automated tests.
      this.el.completeBtn.classList.toggle("hidden", hasTests);
      this.el.completeBtn.disabled = false;
      this._updateCompleteBtn();
      this.outputView.clear();
      this._highlightActive(id);
      this._renderPerf();
    }

    _renderPerf() {
      if (!this.current) return;
      const slots = this.storage.getSolutions(this.current.id);
      const times = {};
      slots.forEach((s) => { const t = this.storage.getTime(this.current.id, s); if (t != null) times[s] = t; });
      this.perfView.render({ slots, times, activeSlot: this.activeSlot });
    }

    // ---- solutions (multiple attempts per problem) ----
    _loadActiveSolution() {
      const file = util.fileName(this.current, this.activeSlot);
      this.editorView.setFile(file);
      const saved = this.storage.getCode(file);
      this.editorView.setValue(saved != null ? saved : "");
    }

    _renderTabs() {
      this.tabsView.render({
        slots: this.storage.getSolutions(this.current.id),
        active: this.activeSlot,
        onSelect: (slot) => this.switchSolution(slot),
        onAdd: () => this.addSolution(),
        onClose: (slot) => this.removeSolution(slot),
      });
    }

    switchSolution(slot) {
      if (!this.current || slot === this.activeSlot) return;
      this._persistCode();
      this.activeSlot = slot;
      this.storage.setActiveSolution(this.current.id, slot);
      this._loadActiveSolution();
      this._renderTabs();
      this._renderPerf();
      this.editorView.focus();
    }

    addSolution() {
      if (!this.current) return;
      this._persistCode();
      this.activeSlot = this.storage.addSolution(this.current.id);
      this._loadActiveSolution();
      this._renderTabs();
      this._renderPerf();
      this.editorView.focus();
    }

    removeSolution(slot) {
      if (!this.current) return;
      const slots = this.storage.getSolutions(this.current.id);
      if (slots.length <= 1) return;
      if (!confirm("Delete this solution? Its code will be removed.")) return;
      this.storage.clearCode(util.fileName(this.current, slot));
      this.storage.removeSolution(this.current.id, slot);
      this.activeSlot = this.storage.getActiveSolution(this.current.id);
      this._loadActiveSolution();
      this._renderTabs();
      this._renderPerf();
    }

    toggleComplete() {
      if (!this.current) return;
      const nowDone = this.storage.toggleComplete(this.current.id);
      this._updateCompleteBtn();
      if (nowDone) {
        this._onSolved();
      } else {
        this.renderSidebar();
        this.refreshProgress();
      }
    }

    /** Reward pipeline fired whenever a problem transitions to solved. */
    _onSolved() {
      const p = this.current, lv = this.currentLevel;
      const xp = AchievementService.xpForLevel(lv.id);
      const gained = this.storage.awardXp(p.id, xp);
      this.storage.touchStreak();

      this._updateCompleteBtn();
      this.renderSidebar();
      this.refreshProgress();
      this.refreshStats();

      this.el.completeBtn.classList.remove("pulse");
      void this.el.completeBtn.offsetWidth;
      this.el.completeBtn.classList.add("pulse");
      DSA.confetti();

      if (gained) this.toast.show({ icon: "✅", title: p.title + " solved!", msg: "+" + xp + " XP" });
      const unlocked = AchievementService.evaluate(this.storage, this.levels);
      unlocked.forEach((a, i) =>
        setTimeout(() => this.toast.show({ icon: a.icon, title: a.title, msg: a.desc, gold: true, duration: 4600 }), (i + 1) * 550)
      );
      this.refreshStats();
    }

    run() {
      if (!this.current) return;
      this._persistCode();
      this.el.runBtn.disabled = true;
      this._setLabel(this.el.runBtn, "running…");
      this.outputView.meta("Running " + this.current.title + "…");

      this.runner.run(this.editorView.getValue(), (result) => {
        this.el.runBtn.disabled = false;
        this._setLabel(this.el.runBtn, "Run");
        this.outputView.clear();
        if (!result.logs.length) this.outputView.line("(no output — did you console.log anything?)", "meta");
        result.logs.forEach((l) => this.outputView.line(l.text, l.type));
        if (result.ok) {
          this.outputView.line("Finished in " + util.fmtTime(result.timeMs), "success");
          if (result.timeMs != null) { this.storage.setTime(this.current.id, this.activeSlot, result.timeMs); this._renderPerf(); }
        }
      });
    }

    // Structural helpers (ListNode/TreeNode/Node + builders) injected before the
    // user's code so test cases can construct lists/trees/graphs. Only the
    // constructors the user didn't already define are added.
    _helperPreamble(code) {
      const defines = (name) => new RegExp("(?:class|function)\\s+" + name + "\\b|\\b" + name + "\\s*=[^=]").test(code);
      let p = "";
      if (!defines("ListNode")) p += "function ListNode(val,next){this.val=(val===undefined?0:val);this.next=(next===undefined?null:next);}\n";
      if (!defines("TreeNode")) p += "function TreeNode(val,left,right){this.val=(val===undefined?0:val);this.left=(left===undefined?null:left);this.right=(right===undefined?null:right);}\n";
      if (!defines("Node")) p += "function Node(val,neighbors){this.val=(val===undefined?0:val);this.neighbors=(neighbors===undefined?[]:neighbors);}\n";
      p += "function _L(a){let d=null;for(let i=a.length-1;i>=0;i--)d=new ListNode(a[i],d);return d;}\n";
      p += "function _LA(h){let o=[],g=0;while(h&&g++<100000){o.push(h.val);h=h.next;}return o;}\n";
      p += "function _T(a){if(!a||!a.length)return null;let root=new TreeNode(a[0]);let q=[root],i=1;while(i<a.length){let n=q.shift();if(a[i]!=null){n.left=new TreeNode(a[i]);q.push(n.left);}i++;if(i<a.length&&a[i]!=null){n.right=new TreeNode(a[i]);q.push(n.right);}i++;}return root;}\n";
      p += "function _TA(r){let o=[],q=[r];while(q.length){let n=q.shift();if(n){o.push(n.val);q.push(n.left,n.right);}else o.push(null);}while(o.length&&o[o.length-1]===null)o.pop();return o;}\n";
      p += "function _cyc(a,pos){let ns=a.map(function(v){return new ListNode(v);});for(let i=0;i<ns.length-1;i++)ns[i].next=ns[i+1];if(pos>=0&&ns.length)ns[ns.length-1].next=ns[pos];return ns[0]||null;}\n";
      p += "function _graph(adj){if(!adj.length)return null;let ns=adj.map(function(_,i){return new Node(i+1);});adj.forEach(function(nb,i){ns[i].neighbors=nb.map(function(x){return ns[x-1];});});return ns[0];}\n";
      p += "function _gser(node){if(!node)return [];let all=[];(function dfs(n){if(all.indexOf(n)>=0)return;all.push(n);n.neighbors.forEach(dfs);})(node);all.sort(function(a,b){return a.val-b.val;});return all.map(function(n){return n.neighbors.map(function(x){return x.val;}).sort(function(a,b){return a-b;});});}\n";
      return p;
    }

    check() {
      if (!this.current) return;
      this._persistCode();
      const tests = (DSA.TESTS || {})[this.current.id];
      if (!tests) {
        this.outputView.meta("No automated tests for this problem yet — compare your output with the example above, then Mark Complete.");
        return;
      }
      this.el.checkBtn.disabled = true;
      this._setLabel(this.el.checkBtn, "checking…");

      const userCode = this.editorView.getValue();
      const code = this._helperPreamble(userCode) + userCode;
      this.runner.check(code, tests, (result) => {
        this.el.checkBtn.disabled = false;
        this._setLabel(this.el.checkBtn, "Check");
        this.outputView.clear();
        result.logs.forEach((l) => this.outputView.line(l.text, l.type));
        if (result.results) {
          const allPass = this.outputView.renderResults(result.results);
          if (result.timeMs != null) {
            this.outputView.line("⏱ " + util.fmtTime(result.timeMs) + " / run", "meta");
            this.storage.setTime(this.current.id, this.activeSlot, result.timeMs);
            this._renderPerf();
          }
          if (allPass && !this.storage.isComplete(this.current.id)) {
            this.storage.toggleComplete(this.current.id);
            this._onSolved();
          }
        }
      });
    }

    resetCode() {
      if (!this.current) return;
      this.editorView.setValue("");
      this.storage.clearCode(util.fileName(this.current, this.activeSlot));
    }

    resetAll() {
      if (!confirm("⚠️ Reset EVERYTHING?\n\nThis clears all solved progress, XP, streaks, and every solution you've written. This cannot be undone.")) return;
      if (!confirm("Are you absolutely sure? This is your last chance — click OK to permanently erase all your data.")) return;
      this.storage.reset();
      if (this.current) this.editorView.setValue("");
      this._updateCompleteBtn();
      this.renderSidebar();
      this.refreshProgress();
      this.refreshStats();
      this.toast.show({ icon: "🗑️", title: "All progress reset", msg: "You're starting fresh." });
    }

    // ---- helpers ----
    _autosave(val) {
      if (!this.current) return;
      clearTimeout(this._saveTimer);
      const file = util.fileName(this.current, this.activeSlot);
      this._saveTimer = setTimeout(() => this.storage.setCode(file, val), 400);
    }

    _persistCode() {
      if (this.current) this.storage.setCode(util.fileName(this.current, this.activeSlot), this.editorView.getValue());
    }

    _updateCompleteBtn() {
      if (!this.current) return;
      const done = this.storage.isComplete(this.current.id);
      this._setLabel(this.el.completeBtn, done ? "Completed" : "Mark Complete");
      this.el.completeBtn.classList.toggle("btn-primary", done);
      this.el.completeBtn.classList.toggle("btn-outline", !done);
    }

    // set a button's text label without clobbering its leading SVG icon
    _setLabel(btn, text) {
      const label = btn.querySelector(".btn-label");
      if (label) label.textContent = text;
      else btn.textContent = text;
    }

    init() {
      this.renderSidebar();
      this.refreshProgress();
      this.refreshStats();
    }
  }

  DSA.AppController = AppController;

  // ---- boot with login gate ----
  document.addEventListener("DOMContentLoaded", () => {
    const auth = new DSA.AuthService();
    const overlay = document.getElementById("loginOverlay");
    const form = document.getElementById("loginForm");
    const userInput = document.getElementById("loginUser");
    const passInput = document.getElementById("loginPass");
    const errorEl = document.getElementById("loginError");

    let started = false;
    const start = (user) => {
      if (started) return;
      started = true;
      overlay.classList.add("hidden");
      new AppController(window.LEVELS || [], user, auth).init();
    };

    const existing = auth.currentUser();
    if (existing) {
      start(existing);
    } else {
      overlay.classList.remove("hidden");
      setTimeout(() => userInput && userInput.focus(), 50);
    }

    if (form) {
      form.addEventListener("submit", (e) => {
        e.preventDefault();
        const ok = auth.login(userInput.value, passInput.value);
        if (ok) {
          errorEl.classList.add("hidden");
          start(auth.currentUser());
        } else {
          errorEl.classList.remove("hidden");
          passInput.value = "";
          passInput.focus();
        }
      });
    }
  });
})();
