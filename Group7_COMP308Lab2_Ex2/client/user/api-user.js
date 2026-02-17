
const API_BASE = "/api/users";

const handleResponse = async (response) => {
  try {
    if (!response.ok) {
      const text = await response.text();
      return { error: text || `HTTP error! status: ${response.status}` };
    }
    const data = await response.json();
    return data;
  } catch (err) {
    console.error("Failed to parse response JSON:", err);
    return { error: err.message };
  }
};

const handleError = (err) => {
  if (err.name === 'AbortError') {
    return { error: 'Request aborted' };
  }
  console.error("API call failed:", err);
  return { error: err.message };
};

const create = async (user) => {
  try {
    const response = await fetch(API_BASE, {
      method: "POST",
      headers: {
        Accept: "application/json",
        "Content-Type": "application/json",
      },
      body: JSON.stringify(user),
    });
    return await handleResponse(response);
  } catch (err) {
    return handleError(err);
  }
};

const list = async (signal) => {
  try {
    const response = await fetch(API_BASE, {
      method: "GET",
      signal,
    });
    return await handleResponse(response);
  } catch (err) {
    return handleError(err);
  }
};

const read = async ({ userId }, { t }, signal) => {
  try {
    const response = await fetch(`${API_BASE}/${userId}`, {
      method: "GET",
      signal,
      headers: {
        Accept: "application/json",
        "Content-Type": "application/json",
        Authorization: `Bearer ${t}`,
      },
    });
    return await handleResponse(response);
  } catch (err) {
    return handleError(err);
  }
};

const update = async ({ userId }, { t }, user) => {
  try {
    const response = await fetch(`${API_BASE}/${userId}`, {
      method: "PUT",
      headers: {
        Accept: "application/json",
        "Content-Type": "application/json",
        Authorization: `Bearer ${t}`,
      },
      body: JSON.stringify(user),
    });
    return await handleResponse(response);
  } catch (err) {
    return handleError(err);
  }
};

const remove = async ({ userId }, { t }) => {
  try {
    const response = await fetch(`${API_BASE}/${userId}`, {
      method: "DELETE",
      headers: {
        Accept: "application/json",
        "Content-Type": "application/json",
        Authorization: `Bearer ${t}`,
      },
    });
    return await handleResponse(response);
  } catch (err) {
    return handleError(err);
  }
};

const getUserGames = async ({ userId }, { t }, signal) => {
  try {
    const response = await fetch(`${API_BASE}/${userId}/games`, {
      method: "GET",
      signal,
      headers: {
        Accept: "application/json",
        "Content-Type": "application/json",
        Authorization: `Bearer ${t}`,
      },
    });
    return await handleResponse(response);
  } catch (err) {
    return handleError(err);
  }
};

const addGameToCollection = async ({ userId }, { t }, gameId) => {
  try {
    const response = await fetch(`${API_BASE}/${userId}/collection/add`, {
      method: "PUT",
      headers: {
        Accept: "application/json",
        "Content-Type": "application/json",
        Authorization: `Bearer ${t}`,
      },
      body: JSON.stringify({ gameId }),
    });
    return await handleResponse(response);
  } catch (err) {
    return handleError(err);
  }
};

const removeGameFromCollection = async ({ userId }, { t }, gameId) => {
  try {
    const response = await fetch(`${API_BASE}/${userId}/collection/remove`, {
      method: "PUT",
      headers: {
        Accept: "application/json",
        "Content-Type": "application/json",
        Authorization: `Bearer ${t}`,
      },
      body: JSON.stringify({ gameId }),
    });
    return await handleResponse(response);
  } catch (err) {
    return handleError(err);
  }
};

export { create, list, read, update, remove, getUserGames, addGameToCollection, removeGameFromCollection };
