import dotenv from "dotenv";
import cors from "cors";
import express from "express";
import { ApolloServer } from "@apollo/server";
import configureMongoose from "../../config/mongoose.js";
import GameProgress from "../graphQL/models/game.model.js";

dotenv.config({ quiet: true });

const app = express();
const PORT = Number(process.env.GAME_SERVICE_PORT || 4004);
const allowedOrigins = (process.env.GAME_CORS_ORIGINS || "http://localhost:5173,http://localhost:5175")
  .split(",")
  .map((origin) => origin.trim())
  .filter(Boolean);

const typeDefs = `#graphql
  type GameProgress {
    progressId: ID!
    userId: ID!
    level: Int!
    experiencePoints: Int!
    score: Int!
    rank: Int
    achievements: [String!]!
    progress: String!
    lastPlayed: String
    updatedAt: String
  }

  type Query {
    gameProgressList: [GameProgress!]!
    gameProgress(progressId: ID!): GameProgress
    gameProgressByUser(userId: ID!): GameProgress
    leaderboard(limit: Int = 10): [GameProgress!]!
  }

  type Mutation {
    addGameProgress(
      userId: ID!
      level: Int = 1
      experiencePoints: Int = 0
      score: Int = 0
      rank: Int
      achievements: [String!]
      progress: String = "Not started"
      lastPlayed: String
    ): GameProgress!

    updateGameProgress(
      progressId: ID!
      level: Int
      experiencePoints: Int
      score: Int
      rank: Int
      achievements: [String!]
      progress: String
      lastPlayed: String
    ): GameProgress!

    deleteGameProgress(progressId: ID!): Boolean!
    deleteGameProgressByUser(userId: ID!): Boolean!
  }
`;

const resolvers = {
  Query: {
    gameProgressList: async () => await GameProgress.find().sort({ updatedAt: -1 }),
    gameProgress: async (_, { progressId }) => await GameProgress.findById(progressId),
    gameProgressByUser: async (_, { userId }) => await GameProgress.findOne({ userId }),
    leaderboard: async (_, { limit = 10 }) =>
      await GameProgress.find().sort({ score: -1, level: -1, experiencePoints: -1 }).limit(limit),
  },
  Mutation: {
    addGameProgress: async (
      _,
      { userId, level, experiencePoints, score, rank, achievements, progress, lastPlayed }
    ) => {
      const payload = {
        userId,
        level,
        experiencePoints,
        score,
        rank,
        achievements,
        progress,
        ...(lastPlayed ? { lastPlayed: new Date(lastPlayed) } : {}),
      };

      const newGameProgress = new GameProgress(payload);
      return await newGameProgress.save();
    },
    updateGameProgress: async (
      _,
      { progressId, level, experiencePoints, score, rank, achievements, progress, lastPlayed }
    ) => {
      const updateData = {
        ...(level !== undefined ? { level } : {}),
        ...(experiencePoints !== undefined ? { experiencePoints } : {}),
        ...(score !== undefined ? { score } : {}),
        ...(rank !== undefined ? { rank } : {}),
        ...(achievements !== undefined ? { achievements } : {}),
        ...(progress !== undefined ? { progress } : {}),
        ...(lastPlayed ? { lastPlayed: new Date(lastPlayed) } : {}),
      };

      return await GameProgress.findByIdAndUpdate(progressId, updateData, { new: true });
    },
    deleteGameProgress: async (_, { progressId }) => {
      const result = await GameProgress.findByIdAndDelete(progressId);
      return !!result;
    },
    deleteGameProgressByUser: async (_, { userId }) => {
      const result = await GameProgress.findOneAndDelete({ userId });
      return !!result;
    },
  },
};

const start = async () => {
  await configureMongoose();

  const apolloServer = new ApolloServer({ typeDefs, resolvers });
  await apolloServer.start();

  app.use(cors({ origin: allowedOrigins, credentials: true }));
  app.use(express.json());

  app.get("/health", (_, res) => {
    res.json({ status: "ok", service: "game-progress-microservice" });
  });

  app.post("/graphql", async (req, res) => {
    try {
      const { query, variables, operationName } = req.body;
      const result = await apolloServer.executeOperation({ query, variables, operationName });

      if (result.body.kind === "single") {
        return res.json(result.body.singleResult);
      }

      if (result.body.kind === "incremental") {
        return res.json(result.body.initialResult);
      }

      return res.status(400).json({ error: "Unknown response type" });
    } catch (error) {
      return res.status(500).json({ error: error.message });
    }
  });

  app.listen(PORT, () => {
    console.log(`Game progress microservice running at http://localhost:${PORT}`);
  });
};

start().catch((error) => {
  console.error("Game progress microservice failed to start", error);
  process.exit(1);
});
