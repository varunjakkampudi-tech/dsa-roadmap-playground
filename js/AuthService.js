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
    // username -> password (edit here to add users / change passwords)
    this.USERS = {
      admin: "admin123",
      varun: "varun123",
    };
    this.SESSION_KEY = "dsa_auth_user";
  }

  currentUser() {
    try { return localStorage.getItem(this.SESSION_KEY) || null; } catch (_) { return null; }
  }

  login(user, pass) {
    user = (user || "").trim().toLowerCase();
    if (Object.prototype.hasOwnProperty.call(this.USERS, user) && this.USERS[user] === pass) {
      localStorage.setItem(this.SESSION_KEY, user);
      return true;
    }
    return false;
  }

  logout() {
    localStorage.removeItem(this.SESSION_KEY);
  }
};
