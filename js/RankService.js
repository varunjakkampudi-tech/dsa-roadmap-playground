/**
 * RankService — gamification/domain rules for the "rank ladder".
 * Maps a level number to a colored, motivational rank tier.
 * Pure logic — no DOM. High-contrast colors chosen for AA readability on white.
 */
window.DSA = window.DSA || {};

DSA.RankService = (function () {
  // Each rank: dark `color` (text/border) on light `bg` = strong contrast.
  const RANKS = [
    { key: "bronze",      tier: "Bronze",   title: "Code Rookie",           emoji: "🥉", color: "#b45309", bg: "#fdecd7", min: 1,  max: 5 },
    { key: "silver",      tier: "Silver",   title: "Algorithm Explorer",    emoji: "🥈", color: "#475569", bg: "#e6ecf3", min: 6,  max: 10 },
    { key: "gold",        tier: "Gold",     title: "Problem Slayer",        emoji: "🥇", color: "#a16207", bg: "#fdf4d3", min: 11, max: 15 },
    { key: "platinum",    tier: "Platinum", title: "Data-Structure Ninja",  emoji: "💠", color: "#0e7490", bg: "#d3f6fb", min: 16, max: 20 },
    { key: "diamond",     tier: "Diamond",  title: "Optimization Master",   emoji: "🔷", color: "#1d4ed8", bg: "#dbe7ff", min: 21, max: 25 },
    { key: "grandmaster", tier: "Elite",    title: "Algorithm Grandmaster", emoji: "👑", color: "#6d28d9", bg: "#ebe2fe", min: 26, max: 30 },
  ];

  const LAST = RANKS[RANKS.length - 1];

  function forLevel(levelId) {
    return RANKS.find((r) => levelId >= r.min && levelId <= r.max) || LAST;
  }

  return { RANKS, forLevel };
})();
