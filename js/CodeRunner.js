/**
 * CodeRunner — execution/sandbox layer.
 * Runs user JS inside a Web Worker (Blob-based, so it works over file://),
 * captures console.* output, terminates runaway/infinite-loop code, and can
 * optionally validate the code against a list of assertions.
 *
 * Plain run:   new DSA.CodeRunner().run(code, ({ ok, logs }) => {});
 * Validation:  new DSA.CodeRunner().check(code, tests, ({ ok, logs, results }) => {});
 */
window.DSA = window.DSA || {};

DSA.CodeRunner = class CodeRunner {
  constructor(timeoutMs = 4000) {
    this.timeoutMs = timeoutMs;
  }

  // Source that runs INSIDE the worker.
  static get workerSource() {
    return `
      function fmt(v) {
        if (v === null) return 'null';
        if (v === undefined) return 'undefined';
        if (typeof v === 'string') return JSON.stringify(v);
        if (typeof v === 'function') return v.toString();
        if (typeof v === 'bigint') return v.toString() + 'n';
        try { return JSON.stringify(v, (k, val) => typeof val === 'bigint' ? val.toString() + 'n' : val); }
        catch (e) { return String(v); }
      }
      // deep-sort arrays so order-insensitive comparisons work
      function sortDeep(v) {
        if (Array.isArray(v)) {
          var c = v.map(sortDeep);
          c.sort(function (a, b) { var sa = JSON.stringify(a), sb = JSON.stringify(b); return sa < sb ? -1 : sa > sb ? 1 : 0; });
          return c;
        }
        return v;
      }
      function eq(a, b, unordered) {
        var na = unordered ? sortDeep(a) : a;
        var nb = unordered ? sortDeep(b) : b;
        return JSON.stringify(na) === JSON.stringify(nb);
      }

      self.onmessage = function (e) {
        var payload = e.data || {};
        var code = payload.code || "";
        var tests = payload.tests || null;

        var logs = [];
        var push = function (type, args) { logs.push({ type: type, text: Array.prototype.map.call(args, function(v){ return typeof v === 'string' ? v : fmt(v); }).join(' ') }); };
        var sandboxConsole = {
          log:   function () { push('log', arguments); },
          info:  function () { push('log', arguments); },
          debug: function () { push('log', arguments); },
          warn:  function () { push('log', arguments); },
          error: function () { push('error', arguments); },
          table: function () { push('log', arguments); },
        };

        try {
          if (tests && tests.length) {
            // NOTE: no "use strict" — supports every style the user might write:
            // function decls, arrow consts, classes, prototype constructors, and
            // even implicit globals such as  twoSum = () => {}  without const.
            var body = code + String.fromCharCode(10) + ';return (function(){ var __o = [];';
            for (var i = 0; i < tests.length; i++) {
              body += 'try { __o.push({ actual: (' + tests[i].call + ') }); } catch (err) { __o.push({ error: String(err && err.message || err) }); }';
            }
            body += ' return __o; })();';

            var actuals = new Function('console', body)(sandboxConsole);
            var results = tests.map(function (t, idx) {
              var a = actuals[idx] || {};
              if ('error' in a) return { call: t.call, pass: false, error: a.error };
              var pass = eq(a.actual, t.expected, t.unordered);
              return { call: t.call, pass: pass, expected: fmt(t.expected), actual: fmt(a.actual) };
            });
            var ok = results.every(function (r) { return r.pass; });

            // Benchmark: repeat the test calls to get a stable per-run average (ms).
            var timeMs = null;
            if (ok) {
              try {
                var callsSrc = '';
                for (var c = 0; c < tests.length; c++) callsSrc += '(' + tests[c].call + ');';
                var noop = function () {};
                var benchConsole = { log: noop, info: noop, debug: noop, warn: noop, error: noop, table: noop };
                var benchBody = code + String.fromCharCode(10) + ';return (function(){ var reps=0,t0=performance.now(),el=0; do { for(var b=0;b<50;b++){ ' + callsSrc + ' } reps+=50; el=performance.now()-t0; } while(el<40 && reps<5000); return el/reps; })();';
                timeMs = new Function('console', benchBody)(benchConsole);
              } catch (e) { timeMs = null; }
            }

            self.postMessage({ ok: ok, logs: logs, results: results, timeMs: timeMs });
          } else {
            var fn = new Function('console', code);
            var rt0 = performance.now();
            fn(sandboxConsole);
            var runMs = performance.now() - rt0;
            self.postMessage({ ok: true, logs: logs, timeMs: runMs });
          }
        } catch (err) {
          logs.push({ type: 'error', text: (err && err.name ? err.name + ': ' : '') + (err && err.message ? err.message : String(err)) });
          self.postMessage({ ok: false, logs: logs });
        }
      };
    `;
  }

  _spawn(payload, onDone) {
    let worker;
    try {
      const blob = new Blob([CodeRunner.workerSource], { type: "application/javascript" });
      worker = new Worker(URL.createObjectURL(blob));
    } catch (err) {
      onDone({ ok: false, logs: [{ type: "error", text: "Could not start runner: " + err.message }] });
      return;
    }

    const timer = setTimeout(() => {
      worker.terminate();
      onDone({
        ok: false,
        logs: [{ type: "meta", text: "⏱ Timed out after " + (this.timeoutMs / 1000) + "s — possible infinite loop. Execution terminated." }],
      });
    }, this.timeoutMs);

    worker.onmessage = (e) => { clearTimeout(timer); worker.terminate(); onDone(e.data); };
    worker.onerror = (e) => { clearTimeout(timer); worker.terminate(); onDone({ ok: false, logs: [{ type: "error", text: e.message || "Runtime error" }] }); };
    worker.postMessage(payload);
  }

  run(code, onDone) {
    this._spawn({ code, tests: null }, onDone);
  }

  check(code, tests, onDone) {
    this._spawn({ code, tests }, onDone);
  }
};
