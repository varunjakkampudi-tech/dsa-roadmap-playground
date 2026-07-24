/**
 * StorageService — persistence layer.
 * Single responsibility: read/write user progress, code, and gamification state
 * (XP, streak, achievements) to localStorage. Nothing else touches localStorage.
 */
window.DSA = window.DSA || {};

DSA.StorageService = class StorageService {
  constructor(key = "dsa_playground_v2", user = "") {
    // Each user gets an isolated namespace so their work never mixes.
    this.key = user ? key + "__" + user : key;
    this.state = this._load();
  }

  _defaults() {
    return { completed: {}, code: {}, awarded: {}, unlocked: {}, xp: 0, streak: 0, lastActive: null, solutions: {}, active: {}, times: {} };
  }

  _load() {
    let saved = {};
    try { saved = JSON.parse(localStorage.getItem(this.key)) || {}; } catch (_) { saved = {}; }
    return Object.assign(this._defaults(), saved); // migrate: fill any missing fields
  }

  _persist() {
    localStorage.setItem(this.key, JSON.stringify(this.state));
  }

  // ---- code (keyed by filename) ----
  getCode(file) { return this.state.code[file]; }
  setCode(file, value) { this.state.code[file] = value; this._persist(); }
  clearCode(file) { delete this.state.code[file]; this._persist(); }

  // ---- completion (keyed by problem id) ----
  isComplete(id) { return !!this.state.completed[id]; }
  toggleComplete(id) {
    this.state.completed[id] = !this.state.completed[id];
    this._persist();
    return this.state.completed[id];
  }
  completedCount() { return Object.values(this.state.completed).filter(Boolean).length; }

  // ---- XP (awarded once per problem) ----
  getXp() { return this.state.xp; }
  isAwarded(id) { return !!this.state.awarded[id]; }
  awardXp(id, amount) {
    if (this.state.awarded[id]) return false;
    this.state.awarded[id] = true;
    this.state.xp += amount;
    this._persist();
    return true;
  }

  // ---- daily streak ----
  getStreak() { return this.state.streak; }
  touchStreak() {
    const today = new Date().toDateString();
    const last = this.state.lastActive;
    if (last !== today) {
      const y = new Date(); y.setDate(y.getDate() - 1);
      this.state.streak = last === y.toDateString() ? this.state.streak + 1 : 1;
      this.state.lastActive = today;
      this._persist();
    }
    return this.state.streak;
  }

  // ---- achievements ----
  isUnlocked(key) { return !!this.state.unlocked[key]; }
  unlock(key) { this.state.unlocked[key] = true; this._persist(); }

  // ---- multiple solutions per problem ----
  getSolutions(problemId) {
    const s = this.state.solutions[problemId];
    return s && s.length ? s.slice() : [1];
  }
  getActiveSolution(problemId) {
    const slots = this.getSolutions(problemId);
    const a = this.state.active[problemId];
    return slots.indexOf(a) !== -1 ? a : slots[0];
  }
  setActiveSolution(problemId, slot) {
    this.state.active[problemId] = slot;
    this._persist();
  }
  addSolution(problemId) {
    const slots = this.getSolutions(problemId);
    const id = (slots.length ? Math.max.apply(null, slots) : 0) + 1;
    slots.push(id);
    this.state.solutions[problemId] = slots;
    this.state.active[problemId] = id;
    this._persist();
    return id;
  }
  removeSolution(problemId, slot) {
    let slots = this.getSolutions(problemId).filter((s) => s !== slot);
    if (!slots.length) slots = [1];
    this.state.solutions[problemId] = slots;
    if (this.getActiveSolution(problemId) === slot) this.state.active[problemId] = slots[0];
    delete this.state.times[problemId + ":" + slot];
    this._persist();
    return slots;
  }

  // ---- per-solution execution time (ms/run) ----
  setTime(problemId, slot, ms) {
    this.state.times[problemId + ":" + slot] = ms;
    this._persist();
  }
  getTime(problemId, slot) {
    const v = this.state.times[problemId + ":" + slot];
    return v == null ? null : v;
  }

  // ---- lifecycle ----
  reset() { this.state = this._defaults(); this._persist(); }

  // ---- backup / restore (carry progress across origins & devices) ----
  exportState() {
    return JSON.stringify(this.state, null, 2);
  }
  importState(json) {
    const obj = typeof json === "string" ? JSON.parse(json) : json;
    if (!obj || typeof obj !== "object") throw new Error("Invalid backup file");
    this.state = Object.assign(this._defaults(), obj);
    this._persist();
  }
};
