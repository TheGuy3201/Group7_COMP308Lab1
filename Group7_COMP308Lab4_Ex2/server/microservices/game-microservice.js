import dotenv from "dotenv";
import cors from "cors";
import express from "express";
import { ApolloServer } from "@apollo/server";
import configureMongoose from "../../config/mongoose.js";
import GameProgress from "../graphQL/models/gameProgress.model.js";
import { generateAdaptiveStrategy } from "./ai-strategy-agent.js";

dotenv.config({ quiet: true });

const app = express();
const PORT = Number(process.env.GAME_SERVICE_PORT || 4004);
const allowedOrigins = (process.env.GAME_CORS_ORIGINS || "http://localhost:5173,http://localhost:5175")
  .split(",")
  .map((origin) => origin.trim())
  .filter(Boolean);

const typeDefs = `#graphql
  type LevelFailure {
    level: Int!
    failCount: Int!
    lastFailedAt: String
  }

  type GameProgress {
    progressId: ID!
    userId: ID!
    level: Int!
    experiencePoints: Int!
    score: Int!
    rank: Int
    achievements: [String!]!
    levelFailures: [LevelFailure!]!
    progress: String!
    lastPlayed: String
    updatedAt: String
  }

  input AIHintInput {
    userId: ID!
    question: String!
    level: Int
  }

  type AIHintResponse {
    response: String!
    hints: [String!]!
    alternativeStrategies: [String!]!
    proactiveSuggestion: String
    failCount: Int!
    level: Int!
    modelConfidence: Float!
    retrievedDocs: [String!]!
  }

  type Query {
    gameProgressList: [GameProgress!]!
    gameProgress(progressId: ID!): GameProgress
    gameProgressByUser(userId: ID!): GameProgress
    leaderboard(limit: Int = 10): [GameProgress!]!
    aiStrategy(input: AIHintInput!): AIHintResponse!
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

    recordLevelFailure(userId: ID!, level: Int!): GameProgress!

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
    aiStrategy: async (_, { input }) => {
      try {
        const { userId, question, level } = input;
        if (!question || !question.trim()) {
          throw new Error("Question cannot be empty.");
        }
        console.log(`[Game Service] aiStrategy request for userId=${userId}, level=${level}`);
        const progress = await GameProgress.findOne({ userId });

        if (!progress) {
          const fallback = await generateAdaptiveStrategy({
            question,
            level,
            playerProgress: { level: level || 1, experiencePoints: 0, score: 0 },
            failCount: 0,
          });
          return fallback;
        }

        const strategyLevel = Number(level || progress.level || 1);
        const failEntry = (progress.levelFailures || []).find((item) => Number(item.level) === strategyLevel);
        const failCount = Number(failEntry?.failCount || 0);

        return await generateAdaptiveStrategy({
          question,
          level: strategyLevel,
          playerProgress: progress,
          failCount,
        });
      } catch (error) {
        console.error("[Game Service] aiStrategy resolver error:", error.message);
        throw error;
      }
    },
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
        levelFailures: [],
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
    recordLevelFailure: async (_, { userId, level }) => {
      const safeLevel = Math.max(1, Number(level || 1));
      let progress = await GameProgress.findOne({ userId });

      if (!progress) {
        progress = new GameProgress({
          userId,
          level: safeLevel,
          experiencePoints: 0,
          score: 0,
          achievements: [],
          levelFailures: [{ level: safeLevel, failCount: 1, lastFailedAt: new Date() }],
          progress: `Attempting Level ${safeLevel}`,
          lastPlayed: new Date(),
        });
        return await progress.save();
      }

      const failures = progress.levelFailures || [];
      const existing = failures.find((entry) => Number(entry.level) === safeLevel);

      if (existing) {
        existing.failCount = Number(existing.failCount || 0) + 1;
        existing.lastFailedAt = new Date();
      } else {
        failures.push({ level: safeLevel, failCount: 1, lastFailedAt: new Date() });
      }

      progress.levelFailures = failures;
      progress.progress = `Attempting Level ${safeLevel}`;
      progress.lastPlayed = new Date();

      return await progress.save();
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
