/**
 * RankService — gamification/domain rules for the "rank ladder".
 * Maps a level number to a colored, motivational rank tier.
 * Pure logic — no DOM. High-contrast colors chosen for AA readability on white.
 */
window.DSA = window.DSA || {};

DSA.RankService = (function () {
  // Each rank: dark `color` (text/border) on light `bg` = strong contrast.
  // The 14 pattern categories are grouped into four learning tiers.
  const RANKS = [
    { key: "foundations", tier: "Foundations",    title: "Pattern Foundations",  emoji: "🌱", color: "#15803d", bg: "#dcfce7", min: 1,  max: 5 },
    { key: "core",        tier: "Core Structures", title: "Data-Structure Core",  emoji: "🧱", color: "#1d4ed8", bg: "#dbe7ff", min: 6,  max: 9 },
    { key: "advanced",    tier: "Advanced",        title: "Algorithmic Depth",    emoji: "🚀", color: "#6d28d9", bg: "#ede9fe", min: 10, max: 12 },
    { key: "mastery",     tier: "Mastery",         title: "Interview Mastery",    emoji: "👑", color: "#a16207", bg: "#fef3c7", min: 13, max: 14 },
  ];

  const LAST = RANKS[RANKS.length - 1];

  function forLevel(levelId) {
    return RANKS.find((r) => levelId >= r.min && levelId <= r.max) || LAST;
  }

  return { RANKS, forLevel };
})();
