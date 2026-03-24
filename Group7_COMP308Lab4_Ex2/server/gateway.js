import dotenv from "dotenv";
import cors from "cors";
import express from "express";

dotenv.config({ quiet: true });

const app = express();
const PORT = Number(process.env.GATEWAY_PORT || 4002);
const AUTH_SERVICE_URL = process.env.AUTH_SERVICE_URL || "http://localhost:4001";
const USER_SERVICE_URL = process.env.USER_SERVICE_URL || "http://localhost:4003";
const GAME_SERVICE_URL = process.env.GAME_SERVICE_URL || "http://localhost:4004";

app.use(cors({ origin: true, credentials: true }));
app.use(express.json());

const proxyJsonRequest = async (targetUrl, req, res) => {
  try {
    const response = await fetch(targetUrl, {
      method: req.method,
      headers: {
        "Content-Type": "application/json",
        authorization: req.headers.authorization || "",
      },
      body: req.method === "GET" ? undefined : JSON.stringify(req.body || {}),
    });

    const contentType = response.headers.get("content-type") || "";
    const payload = contentType.includes("application/json")
      ? await response.json()
      : await response.text();

    return res.status(response.status).send(payload);
  } catch (error) {
    return res.status(502).json({ message: `Gateway proxy error: ${error.message}` });
  }
};

app.get("/health", (_, res) => {
  res.json({ status: "ok", service: "gateway" });
});

app.post("/api/auth/login", (req, res) => {
  return proxyJsonRequest(`${AUTH_SERVICE_URL}/api/auth/login`, req, res);
});

app.post("/api/auth/register", (req, res) => {
  return proxyJsonRequest(`${AUTH_SERVICE_URL}/api/auth/register`, req, res);
});

app.post("/api/auth/logout", (req, res) => {
  return proxyJsonRequest(`${AUTH_SERVICE_URL}/api/auth/logout`, req, res);
});

const routeGraphqlTarget = (query = "") => {
  const normalized = String(query);

  const authOps = ["signup", "login(", "logout", "health"];

  const userOps = [
    "users",
    "user(",
    "addUser",
    "updateUser",
    "deleteUser",
    "deleteUserByEmail",
  ];

  const gameOps = [
    "gameProgressList",
    "gameProgress(",
    "gameProgressByUser",
    "playerProgress",
    "leaderboard",
    "aiStrategy",
    "gameAIQuery",
    "gameHint",
    "addGameProgress",
    "updateGameProgress",
    "recordLevelFailure",
    "deleteGameProgress",
    "deleteGameProgressByUser",
  ];

  if (authOps.some((op) => normalized.includes(op))) {
    return `${AUTH_SERVICE_URL}/graphql`;
  }

  if (userOps.some((op) => normalized.includes(op))) {
    return `${USER_SERVICE_URL}/graphql`;
  }

  if (gameOps.some((op) => normalized.includes(op))) {
    return `${GAME_SERVICE_URL}/graphql`;
  }

  return null;
};

app.post("/graphql", (req, res) => {
  const targetUrl = routeGraphqlTarget(req.body?.query);
  if (!targetUrl) {
    return res.status(400).json({
      message:
        "Gateway could not route this GraphQL operation. Ensure it targets user or game progress microservices.",
    });
  }

  return proxyJsonRequest(targetUrl, req, res);
});

app.listen(PORT, () => {
  console.log(`Gateway running at http://localhost:${PORT}`);
});
