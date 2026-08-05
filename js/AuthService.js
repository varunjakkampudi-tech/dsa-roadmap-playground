/**
 * AuthService — lightweight client-side login gate.
 *
 * IMPORTANT: GitHub Pages is fully static (no server), so this is NOT real
 * security — credentials live in the source and are visible to anyone. Its only
 * job is to (a) separate each user's saved progress into its own namespace, and
 * (b) act as a simple sign-in gate. Do not store anything sensitive here.
 */
window.DSA = window.DSA || {};

DSA.AuthService = class AuthService {
  constructor() {
    // ONE shared password everyone uses. Pick any username — your progress is
    // saved under that name, so different people can keep separate progress
    // while signing in with the same common password.
    this.COMMON_PASSWORD = "dsa2024";
    this.SESSION_KEY = "dsa_auth_user";
  }

  currentUser() {
    try { return localStorage.getItem(this.SESSION_KEY) || null; } catch (_) { return null; }
  }

  login(user, pass) {
    user = (user || "").trim().toLowerCase();
    if (!user) user = "guest";
    // sanitize username to a safe storage-friendly key
    user = user.replace(/[^a-z0-9_.-]/g, "").slice(0, 24) || "guest";
    if (pass === this.COMMON_PASSWORD) {
      localStorage.setItem(this.SESSION_KEY, user);
      return true;
    }
    return false;
  }

  logout() {
    localStorage.removeItem(this.SESSION_KEY);
  }
};
