/**
 * ReportService — builds a downloadable Markdown progress report from the
 * user's saved data (levels, problems, XP, streak, difficulty breakdown).
 * Pure logic — no DOM.
 */
window.DSA = window.DSA || {};

DSA.ReportService = (function () {
  const RankService = DSA.RankService;
  const util = DSA.util;

  // Map a level's learning tier to a coarse difficulty bucket.
  function bucket(levelId) {
    const key = RankService.forLevel(levelId).key;
    if (key === "foundations") return "Easy";
    if (key === "core" || key === "advanced") return "Medium";
    return "Hard";
  }

  function hasCode(storage, problem) {
    return storage.getSolutions(problem.id).some((s) => {
      const c = storage.getCode(util.fileName(problem, s));
      return c && c.trim().length > 0;
    });
  }

  // ✅ solved · 🟡 attempted (code written) · ⬜ not started
  function marker(storage, problem) {
    if (storage.isComplete(problem.id)) return "✅";
    if (hasCode(storage, problem)) return "🟡";
    return "⬜";
  }

  function bar(pct, width) {
    const filled = Math.round((pct / 100) * width);
    return "█".repeat(filled) + "░".repeat(Math.max(0, width - filled));
  }

  function cap(s) { return (s || "guest").charAt(0).toUpperCase() + (s || "guest").slice(1); }

  function buildMarkdown(storage, levels, user) {
    const now = new Date();
    const dateStr = now.toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" });

    let totalProblems = 0, completedProblems = 0, completedLevels = 0, solutionsWritten = 0;
    const diff = { Easy: { d: 0, t: 0 }, Medium: { d: 0, t: 0 }, Hard: { d: 0, t: 0 } };

    levels.forEach((lv) => {
      let lvDone = 0;
      lv.problems.forEach((p) => {
        totalProblems++;
        const b = bucket(lv.id); diff[b].t++;
        if (storage.isComplete(p.id)) { completedProblems++; lvDone++; diff[b].d++; }
        if (hasCode(storage, p)) solutionsWritten++;
      });
      if (lvDone === lv.problems.length) completedLevels++;
    });

    const pct = totalProblems ? Math.round((completedProblems / totalProblems) * 100) : 0;
    const L = [];

    L.push("# DSA Progress Report", "");
    L.push("## Candidate", "", "Name: " + cap(user), "", "Last Updated: " + dateStr, "", "---", "");

    L.push("# Overall Progress", "");
    L.push("Levels Completed: " + completedLevels + " / " + levels.length);
    L.push("Problems Completed: " + completedProblems + " / " + totalProblems);
    L.push("Solutions Written: " + solutionsWritten);
    L.push("XP: " + storage.getXp() + "    Streak: " + storage.getStreak() + " day(s)", "");
    L.push("Overall Completion:");
    L.push(bar(pct, 24) + " " + pct + "%", "", "---", "");

    levels.forEach((lv) => {
      const done = lv.problems.filter((p) => storage.isComplete(p.id)).length;
      const all = done === lv.problems.length, any = done > 0;
      const icon = all ? "✅" : any ? "🟡" : "⬜";
      const status = all ? "COMPLETED" : any ? "IN PROGRESS" : "NOT STARTED";
      L.push("# Level " + lv.id + " — " + lv.name + " " + icon, "");
      L.push("Status: " + status + "  (" + done + "/" + lv.problems.length + ")", "");
      L.push("Problems");
      lv.problems.forEach((p) => L.push(marker(storage, p) + " " + p.title));
      L.push("", "---", "");
    });

    L.push("# Statistics", "");
    L.push("Total Solved: " + completedProblems);
    L.push("Easy:   " + diff.Easy.d + " / " + diff.Easy.t);
    L.push("Medium: " + diff.Medium.d + " / " + diff.Medium.t);
    L.push("Hard:   " + diff.Hard.d + " / " + diff.Hard.t, "", "---", "");

    L.push("# Patterns Mastered", "");
    levels.forEach((lv) => {
      const done = lv.problems.filter((p) => storage.isComplete(p.id)).length;
      const icon = done === lv.problems.length ? "✅" : done > 0 ? "🟡" : "⬜";
      L.push(icon + " " + lv.name);
    });
    L.push("", "---", "");

    L.push("# Topics Needing Revision", "");
    const inProg = levels.filter((lv) => {
      const d = lv.problems.filter((p) => storage.isComplete(p.id)).length;
      return d > 0 && d < lv.problems.length;
    });
    if (inProg.length) inProg.forEach((lv) => L.push("- " + lv.name));
    else L.push("- None — great job!");
    L.push("", "---", "");

    L.push("# Next Goal", "");
    const next = levels.find((lv) => lv.problems.some((p) => !storage.isComplete(p.id)));
    if (next) {
      L.push("Finish Level " + next.id + " — " + next.name, "", "Problems");
      next.problems.filter((p) => !storage.isComplete(p.id)).forEach((p, i) => L.push((i + 1) + ". " + p.title));
    } else {
      L.push("All levels complete — you are interview ready! 🎉");
    }
    L.push("");

    return L.join("\n");
  }

  return { buildMarkdown };
})();
