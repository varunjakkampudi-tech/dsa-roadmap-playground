/**
 * util — shared pure helpers (no DOM, no state).
 * Kept dependency-free so every layer can use it.
 */
window.DSA = window.DSA || {};

DSA.util = {
  /** Escape a string for safe innerHTML insertion. */
  escapeHtml(s) {
    return String(s).replace(/[&<>"']/g, (c) =>
      ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
  },

  /** kebab-case slug of a title. */
  slug(text) {
    return String(text)
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/(^-|-$)/g, "");
  },

  /** Filename used to persist a problem's code, e.g. "prime-number-check.js".
   *  Slot 1 keeps the plain name (backward compatible); slot N -> "...-N.js". */
  fileName(problem, slot) {
    const base = DSA.util.slug(problem.title);
    slot = slot || 1;
    return base + (slot === 1 ? "" : "-" + slot) + ".js";
  },

  /** Human-friendly duration from milliseconds. */
  fmtTime(ms) {
    if (ms == null || isNaN(ms)) return "—";
    if (ms < 1) return (ms * 1000).toFixed(1) + " µs";
    if (ms < 1000) return ms.toFixed(3) + " ms";
    return (ms / 1000).toFixed(2) + " s";
  },

  /**
   * Extract the expected function/class signature from a starter snippet so the
   * UI can tell the user exactly what to name their function. Returns the LAST
   * declaration (targets come after helper constructors like ListNode/TreeNode).
   */
  signatureOf(starter) {
    if (!starter) return "";
    const re = /(?:function\s+([A-Za-z_$][\w$]*)\s*\(([^)]*)\))|(?:(?:const|let|var)\s+([A-Za-z_$][\w$]*)\s*=\s*(?:async\s*)?\(([^)]*)\)\s*=>)|(?:class\s+([A-Za-z_$][\w$]*))/g;
    let m, last = "";
    while ((m = re.exec(starter))) {
      if (m[1]) last = m[1] + "(" + m[2].trim() + ")";
      else if (m[3]) last = m[3] + "(" + m[4].trim() + ")";
      else if (m[5]) last = "class " + m[5];
    }
    return last;
  },
};
