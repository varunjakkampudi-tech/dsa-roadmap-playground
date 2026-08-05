/**
 * RankService — gamification/domain rules for the "rank ladder".
 * Maps a level number to a colored, motivational rank tier.
 * Pure logic — no DOM. High-contrast colors chosen for AA readability on white.
 */
window.DSA = window.DSA || {};

DSA.RankService = (function () {
  // Each rank: dark `color` (text/border) on light `bg` = strong contrast.
  // Categories are grouped into learning tiers by their position (id).
  const RANKS = [
    { key: "foundations", tier: "Foundations",    title: "Pattern Foundations",  emoji: "🌱", color: "#15803d", bg: "#dcfce7", min: 1,  max: 6 },
    { key: "core",        tier: "Core Structures", title: "Data-Structure Core",  emoji: "🧱", color: "#1d4ed8", bg: "#dbe7ff", min: 7,  max: 11 },
    { key: "advanced",    tier: "Advanced",        title: "Algorithmic Depth",    emoji: "🚀", color: "#6d28d9", bg: "#ede9fe", min: 12, max: 14 },
    { key: "mastery",     tier: "Mastery",         title: "Interview Mastery",    emoji: "👑", color: "#a16207", bg: "#fef3c7", min: 15, max: 16 },
    { key: "extended",    tier: "Advanced Topics", title: "Trie · DSU · Graphs · Design", emoji: "🧠", color: "#0e7490", bg: "#d3f6fb", min: 17, max: 60 },
  ];

  const LAST = RANKS[RANKS.length - 1];

  function forLevel(levelId) {
    return RANKS.find((r) => levelId >= r.min && levelId <= r.max) || LAST;
  }

  return { RANKS, forLevel };
})();
