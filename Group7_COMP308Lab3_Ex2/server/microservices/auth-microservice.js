import dotenv from "dotenv";
import cors from "cors";
import express from "express";
import jwt from "jsonwebtoken";
import configureMongoose from "../../config/mongoose.js";
import User from "../graphQL/models/user.model.js";

dotenv.config();

const app = express();
const PORT = Number(process.env.AUTH_SERVICE_PORT || 4001);
const JWT_SECRET = process.env.JWT_SECRET || "dev-secret";
const TOKEN_EXPIRES_IN = process.env.JWT_EXPIRES_IN || "2h";
const allowedOrigins = (process.env.AUTH_CORS_ORIGINS || "http://localhost:5173,http://localhost:5175")
  .split(",")
  .map((origin) => origin.trim())
  .filter(Boolean);

app.use(cors({ origin: allowedOrigins, credentials: true }));
app.use(express.json());

const sanitizeUser = (userDoc) => ({
  userId: userDoc.userId,
  username: userDoc.username,
  email: userDoc.email,
  role: userDoc.role,
  createdAt: userDoc.createdAt,
});

const createAuthResponse = (userDoc) => {
  const user = sanitizeUser(userDoc);
  const token = jwt.sign(
    {
      sub: user.userId,
      email: user.email,
      username: user.username,
    },
    JWT_SECRET,
    { expiresIn: TOKEN_EXPIRES_IN }
  );

  return {
    token,
    user,
    message: "Authentication successful",
  };
};

app.get("/health", (_, res) => {
  res.json({ status: "ok", service: "auth-microservice" });
});

app.post("/api/auth/register", async (req, res) => {
  try {
    const { username, email, password } = req.body;

    if (!username || !email || !password) {
      return res.status(400).json({ message: "username, email and password are required" });
    }

    const existing = await User.findOne({ $or: [{ username }, { email }] });
    if (existing) {
      return res.status(409).json({ message: "User already exists" });
    }

    const created = await new User({ username, email, password }).save();
    return res.status(201).json(createAuthResponse(created));
  } catch (error) {
    return res.status(500).json({ message: error.message || "Register failed" });
  }
});

app.post("/api/auth/login", async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ message: "email and password are required" });
    }

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(401).json({ message: "Invalid email or password" });
    }

    const valid = await user.comparePassword(password);
    if (!valid) {
      return res.status(401).json({ message: "Invalid email or password" });
    }

    return res.json(createAuthResponse(user));
  } catch (error) {
    return res.status(500).json({ message: error.message || "Login failed" });
  }
});

const start = async () => {
  await configureMongoose();
  app.listen(PORT, () => {
    console.log(`Auth microservice running at http://localhost:${PORT}`);
  });
};

start().catch((error) => {
  console.error("Failed to start auth microservice", error);
  process.exit(1);
});
