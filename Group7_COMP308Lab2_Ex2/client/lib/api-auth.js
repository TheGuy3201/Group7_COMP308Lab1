const login = async (user) => {
  try {
    let response = await fetch("/auth/login/", {
      method: "POST",
      headers: {
        Accept: "application/json",
        "Content-Type": "application/json",
      },
      credentials: "include",
      body: JSON.stringify(user),
    });
    if (!response.ok) {
      const text = await response.text();
      return { error: text || `HTTP error! status: ${response.status}` };
    }
    return await response.json();
  } catch (err) {
    console.log(err);
    return { error: err.message };
  }
};
const logout = async () => {
  try {
    let response = await fetch("/auth/logout/", { method: "GET" });
    if (!response.ok) {
      return { error: `HTTP error! status: ${response.status}` };
    }
    return await response.json();
  } catch (err) {
    console.log(err);
    return { error: err.message };
  }
};
export { login, logout };
