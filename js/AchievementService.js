/**
 * AchievementService — gamification rules (pure-ish domain logic).
 * Evaluates milestones/streaks/rank-completion against storage + levels,
 * unlocks any newly-earned badges, and returns them so the UI can celebrate.
 */
window.DSA = window.DSA || {};

DSA.AchievementService = (function () {
  const RankService = DSA.RankService;

  // XP per solved problem, scaled by rank difficulty.
  const XP_BY_RANK = { bronze: 10, silver: 15, gold: 20, platinum: 25, diamond: 35, grandmaster: 50 };
  function xpForLevel(levelId) {
    return XP_BY_RANK[RankService.forLevel(levelId).key] || 10;
  }

  // Milestone badges by total solved count.
  const COUNT_BADGES = [
    { at: 1,  key: "first_blood", icon: "🩸", title: "First Blood",   desc: "Solved your first problem!" },
    { at: 5,  key: "warming_up",  icon: "🔥", title: "Warming Up",    desc: "5 problems solved." },
    { at: 10, key: "double_digits", icon: "💪", title: "Double Digits", desc: "10 problems solved." },
    { at: 25, key: "quarter",     icon: "🚀", title: "Quarter Century", desc: "25 problems solved." },
    { at: 50, key: "half_way",    icon: "🏅", title: "Halfway Hero",   desc: "50 problems solved." },
    { at: 90, key: "century",     icon: "🏆", title: "Roadmap Master", desc: "All core problems solved!" },
  ];

  const STREAK_BADGES = [
    { at: 3, key: "streak_3", icon: "⚡", title: "On Fire",       desc: "3-day streak!" },
    { at: 7, key: "streak_7", icon: "🌟", title: "Unstoppable",   desc: "7-day streak!" },
  ];

  /**
   * Unlock and return newly-earned badges.
   * @returns {Array<{icon,title,desc}>}
   */
  function evaluate(storage, levels) {
    const earned = [];
    const count = storage.completedCount();
    const streak = storage.getStreak();

    const tryUnlock = (b) => {
      if (!storage.isUnlocked(b.key)) { storage.unlock(b.key); earned.push(b); }
    };

    COUNT_BADGES.forEach((b) => { if (count >= b.at) tryUnlock(b); });
    STREAK_BADGES.forEach((b) => { if (streak >= b.at) tryUnlock(b); });

    // Rank mastery: all problems within a rank completed.
    RankService.RANKS.forEach((rank) => {
      const inRank = levels.filter((l) => RankService.forLevel(l.id).key === rank.key);
      if (!inRank.length) return;
      const allDone = inRank.every((l) => l.problems.every((p) => storage.isComplete(p.id)));
      if (allDone) {
        tryUnlock({
          key: "rank_" + rank.key,
          icon: rank.emoji,
          title: rank.tier + " Rank Cleared",
          desc: "Mastered every " + rank.title + " challenge!",
        });
      }
    });

    return earned;
  }

  return { evaluate, xpForLevel };
})();
