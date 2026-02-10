import { logout } from "./api-auth.js";
const auth = {
  isAuthenticated() {
    if (typeof window == "undefined") return false;
    const jwt = sessionStorage.getItem("jwt");
    if (jwt) {
      try {
        return JSON.parse(jwt);
      } catch (err) {
        console.error("Invalid JWT in sessionStorage:", err);
        sessionStorage.removeItem("jwt");
        return false;
      }
    }
    return false;
  },
  authenticate(jwt, cb) {
    if (typeof window !== "undefined")
      sessionStorage.setItem("jwt", JSON.stringify(jwt));
    cb();
  },
  clearJWT(cb) {
    if (typeof window !== "undefined") sessionStorage.removeItem("jwt");
    cb(); //optional
    logout().then((data) => {
      document.cookie = "t=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;";
    });
  },
};
export default auth;
