const list = async (signal) => {
  try {
    let response = await fetch("/api/games/", {
      method: "GET",
      signal: signal,
    });
    if (!response.ok) {
      return { error: `HTTP error! status: ${response.status}` };
    }
    return await response.json();
  } catch (err) {
    if (err.name === 'AbortError') {
      return { error: 'Request aborted' };
    }
    console.log(err);
    return { error: err.message };
  }
};

const read = async (params, signal) => {
  try {
    let response = await fetch("/api/games/" + params.gameId, {
      method: "GET",
      signal: signal,
    });
    if (!response.ok) {
      return { error: `HTTP error! status: ${response.status}` };
    }
    return await response.json();
  } catch (err) {
    if (err.name === 'AbortError') {
      return { error: 'Request aborted' };
    }
    console.log(err);
    return { error: err.message };
  }
};

const create = async (game, credentials) => {
  try {
    let response = await fetch("/api/games/", {
      method: "POST",
      headers: {
        Accept: "application/json",
        "Content-Type": "application/json",
        Authorization: "Bearer " + credentials.t,
      },
      body: JSON.stringify(game),
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

const update = async (params, credentials, game) => {
  try {
    let response = await fetch("/api/games/" + params.gameId, {
      method: "PUT",
      headers: {
        Accept: "application/json",
        "Content-Type": "application/json",
        Authorization: "Bearer " + credentials.t,
      },
      body: JSON.stringify(game),
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

const remove = async (params, credentials) => {
  try {
    let response = await fetch("/api/games/" + params.gameId, {
      method: "DELETE",
      headers: {
        Accept: "application/json",
        "Content-Type": "application/json",
        Authorization: "Bearer " + credentials.t,
      },
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

export { list, read, create, update, remove };
