/**
 * MonacoEditor — rich code editor wrapper (the VS Code engine, via CDN).
 * Provides syntax highlighting, IntelliSense/function suggestions, and formatting.
 * Exposes the same small interface the controller expects (setFile/getValue/
 * setValue/setEnabled/focus/format) and buffers calls made before Monaco finishes
 * loading. Falls back to a plain textarea if the CDN is unreachable (offline).
 */
window.DSA = window.DSA || {};

DSA.MonacoEditor = class MonacoEditor {
  constructor(host, titleEl, { onRun, onChange } = {}) {
    this.host = host;
    this.titleEl = titleEl;
    this.onRun = onRun;
    this.onChange = onChange;

    this.editor = null;
    this.ready = false;
    this.isFallback = false;
    this._buffer = "";
    this._enabled = false;

    this._load();
  }

  _load() {
    const BASE = "https://cdn.jsdelivr.net/npm/monaco-editor@0.52.2/min";
    const VS = BASE + "/vs";
    if (!window.require || typeof window.require.config !== "function") {
      return this._fallback();
    }

    // Cross-origin worker setup that works over file:// — a blob proxy that
    // importScripts the CDN worker bundle. baseUrl must point to the folder
    // CONTAINING `vs` so language workers resolve to <BASE>/vs/language/...
    window.MonacoEnvironment = {
      getWorkerUrl: function () {
        return URL.createObjectURL(new Blob(
          ["self.MonacoEnvironment={baseUrl:'" + BASE + "/'};importScripts('" + VS + "/base/worker/workerMain.js');"],
          { type: "text/javascript" }
        ));
      },
    };

    const guard = setTimeout(() => { if (!this.ready) this._fallback(); }, 9000);
    try {
      window.require.config({ paths: { vs: VS } });
      window.require(
        ["vs/editor/editor.main"],
        () => { clearTimeout(guard); this._create(); },
        () => { clearTimeout(guard); this._fallback(); }
      );
    } catch (e) {
      clearTimeout(guard);
      this._fallback();
    }
  }

  _create() {
    // Playground-friendly: keep syntax errors, drop noisy "undefined var" squiggles.
    try {
      monaco.languages.typescript.javascriptDefaults.setDiagnosticsOptions({
        noSemanticValidation: true,
        noSyntaxValidation: false,
      });
    } catch (_) { /* ignore */ }

    monaco.editor.defineTheme("dsa-dark", {
      base: "vs-dark", inherit: true, rules: [],
      colors: {
        "editor.background": "#0c1120",
        "editorGutter.background": "#0a0e1a",
        "editorLineNumber.foreground": "#4d5578",
        "editor.lineHighlightBackground": "#131829",
      },
    });
    monaco.editor.defineTheme("dsa-light", {
      base: "vs", inherit: true, rules: [],
      colors: {
        "editor.background": "#fbfcff",
        "editorGutter.background": "#f3f4fb",
        "editorLineNumber.foreground": "#a8adcc",
        "editor.lineHighlightBackground": "#f2f3fb",
      },
    });

    // Follow the app's light/dark theme and react to the toggle.
    const themeFor = () =>
      document.documentElement.getAttribute("data-theme") === "dark" ? "dsa-dark" : "dsa-light";
    window.addEventListener("themechange", () => {
      try { monaco.editor.setTheme(themeFor()); } catch (_) { /* ignore */ }
    });

    this.editor = monaco.editor.create(this.host, {
      value: this._buffer,
      language: "javascript",
      theme: themeFor(),
      automaticLayout: true,
      fontFamily: "'JetBrains Mono', 'Cascadia Code', Consolas, monospace",
      fontSize: 13.5,
      lineHeight: 22,
      minimap: { enabled: false },
      scrollBeyondLastLine: false,
      tabSize: 4,
      indentSize: 4,
      insertSpaces: true,
      detectIndentation: false,
      renderLineHighlight: "line",
      smoothScrolling: false,
      cursorBlinking: "blink",
      cursorSmoothCaretAnimation: "off",
      suggestOnTriggerCharacters: true,
      quickSuggestions: true,
      formatOnPaste: true,
      padding: { top: 10, bottom: 10 },
      readOnly: !this._enabled,
      scrollbar: { verticalScrollbarSize: 11, horizontalScrollbarSize: 11 },
    });

    this.editor.addCommand(monaco.KeyMod.CtrlCmd | monaco.KeyCode.Enter, () => {
      if (this.onRun) this.onRun();
    });
    this.editor.onDidChangeModelContent(() => {
      if (this.onChange) this.onChange(this.getValue());
    });

    this.ready = true;
  }

  _fallback() {
    if (this.ready) return;
    this.isFallback = true;
    this.ready = true;
    this.host.innerHTML = "";
    const ta = document.createElement("textarea");
    ta.className = "code-editor fallback";
    ta.spellcheck = false;
    ta.setAttribute("wrap", "off");
    ta.value = this._buffer;
    ta.disabled = !this._enabled;
    ta.addEventListener("keydown", (e) => {
      if ((e.ctrlKey || e.metaKey) && e.key === "Enter") { e.preventDefault(); if (this.onRun) this.onRun(); }
      if (e.key === "Tab") {
        e.preventDefault();
        const s = ta.selectionStart, en = ta.selectionEnd;
        ta.value = ta.value.slice(0, s) + "    " + ta.value.slice(en);
        ta.selectionStart = ta.selectionEnd = s + 4;
      }
    });
    ta.addEventListener("input", () => { if (this.onChange) this.onChange(ta.value); });
    this.host.appendChild(ta);
    this._ta = ta;
  }

  // ---- public interface (matches the controller's expectations) ----
  setFile(name) { this.titleEl.textContent = name; }

  getValue() {
    if (this.isFallback) return this._ta.value;
    return this.editor ? this.editor.getValue() : this._buffer;
  }

  setValue(v) {
    this._buffer = v || "";
    if (this.isFallback) this._ta.value = this._buffer;
    else if (this.editor) this.editor.setValue(this._buffer);
  }

  setEnabled(on) {
    this._enabled = on;
    if (this.isFallback) this._ta.disabled = !on;
    else if (this.editor) this.editor.updateOptions({ readOnly: !on });
  }

  focus() {
    if (this.isFallback) { this._ta && this._ta.focus(); }
    else if (this.editor) this.editor.focus();
  }

  format() {
    const code = this.getValue();
    if (!code.trim()) return;
    // Prettier (loaded from CDN) actually re-wraps single-line code; Monaco's
    // built-in formatter only fixes spacing and keeps everything on one line.
    if (window.prettier && window.prettierPlugins) {
      try {
        Promise.resolve(
          window.prettier.format(code, {
            parser: "babel",
            plugins: Object.values(window.prettierPlugins),
            semi: true,
            singleQuote: false,
            tabWidth: 4,
            printWidth: 80,
          })
        )
          .then((out) => { if (typeof out === "string") this._applyFormatted(out); })
          .catch(() => this._monacoFormat());
        return;
      } catch (_) { /* fall through */ }
    }
    this._monacoFormat();
  }

  _applyFormatted(text) {
    text = text.replace(/\n+$/, "");
    if (this.isFallback) {
      this._ta.value = text;
      if (this.onChange) this.onChange(text);
      return;
    }
    const ed = this.editor;
    if (!ed) return;
    const model = ed.getModel();
    if (!model) return;
    // executeEdits (not setValue) so Ctrl+Z can undo the format
    ed.pushUndoStop();
    ed.executeEdits("format", [{ range: model.getFullModelRange(), text }]);
    ed.pushUndoStop();
  }

  _monacoFormat() {
    if (this.editor) {
      const a = this.editor.getAction("editor.action.formatDocument");
      if (a) a.run();
    }
  }
};
