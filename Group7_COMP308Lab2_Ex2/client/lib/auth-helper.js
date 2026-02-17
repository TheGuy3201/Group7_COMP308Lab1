// auth-helper.js - Manages JWT authentication tokens
// This file handles storing and retrieving authentication tokens from localStorage

const auth = {
  // Check if user is authenticated by looking for JWT token
  isAuthenticated() {
    if (typeof window == "undefined") return false;

    if (sessionStorage.getItem("jwt")) {
      return JSON.parse(sessionStorage.getItem("jwt"));
    } else {
      return false;
    }
  },

  // Store JWT token after successful login
  authenticate(jwt, cb) {
    if (typeof window !== "undefined") {
      sessionStorage.setItem("jwt", JSON.stringify(jwt));
    }
    cb();
  },

  // Clear JWT token on logout
  clearJWT(cb) {
    if (typeof window !== "undefined") {
      sessionStorage.removeItem("jwt");
    }
    cb();
  },
};

export default auth;
