import dotenv from "dotenv";
import cors from "cors";
import express from "express";
import { ApolloServer } from "@apollo/server";
import configureMongoose from "../../config/mongoose.js";
import GameProgress from "../graphQL/models/gameProgress.model.js";
import AIHint from "../graphQL/models/aiHint.model.js";
import { generateAdaptiveStrategy } from "./ai-strategy-agent.js";
import { searchHintsByProgress } from "./hint-search-service.js";

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
    ragEnabled: Boolean!
  }

  type PlayerProgress {
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
    recentHints: [String!]!
  }

  type AIResponse {
    message: String!
    level: Int!
    userId: ID!
    hintId: ID
    relevantHints: [String!]!
  }

  type Query {
    gameProgressList: [GameProgress!]!
    gameProgress(progressId: ID!): GameProgress
    gameProgressByUser(userId: ID!): GameProgress
    leaderboard(limit: Int = 10): [GameProgress!]!
    aiStrategy(input: AIHintInput!): AIHintResponse!
    gameAIQuery(input: String!): AIResponse!
    playerProgress(userId: ID!): PlayerProgress!
    gameHint(level: Int!): String!
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

const getFailCountForLevel = (progress, level) => {
  const failEntry = (progress?.levelFailures || []).find((item) => Number(item.level) === Number(level));
  return Number(failEntry?.failCount || 0);
};

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
    gameAIQuery: async (_, { input }) => {
      const question = String(input || "").trim();
      if (!question) {
        throw new Error("Input cannot be empty.");
      }

      const progress = await GameProgress.findOne().sort({ updatedAt: -1 });
      const currentLevel = Math.max(1, Number(progress?.level || 1));
      const failCount = getFailCountForLevel(progress, currentLevel);
      const relevantHints = await searchHintsByProgress({
        level: currentLevel,
        question,
        playerProgress: progress,
      });

      const aiResult = await generateAdaptiveStrategy({
        question,
        level: currentLevel,
        playerProgress: progress || { level: currentLevel, experiencePoints: 0, score: 0 },
        failCount,
      });

      const storedHint = await AIHint.create({
        userId: String(progress?.userId || "anonymous"),
        level: currentLevel,
        input: question,
        hint: aiResult.response,
        retrievedHints: relevantHints,
      });

      return {
        message: aiResult.response,
        level: currentLevel,
        userId: String(progress?.userId || "anonymous"),
        hintId: storedHint.hintId,
        relevantHints,
      };
    },
    playerProgress: async (_, { userId }) => {
      const progress = await GameProgress.findOne({ userId: String(userId) });

      if (!progress) {
        throw new Error(`No progress found for userId ${userId}`);
      }

      const recentHintDocs = await AIHint.find({ userId: String(userId) })
        .sort({ createdAt: -1 })
        .limit(3);

      return {
        ...progress.toObject(),
        recentHints: recentHintDocs.map((doc) => doc.hint),
      };
    },
    gameHint: async (_, { level }) => {
      const safeLevel = Math.max(1, Number(level || 1));
      const existing = await AIHint.findOne({ level: safeLevel }).sort({ createdAt: -1 });

      if (existing) {
        return existing.hint;
      }

      const progressAtLevel = await GameProgress.findOne({ level: safeLevel }).sort({ updatedAt: -1 });
      const relevantHints = await searchHintsByProgress({
        level: safeLevel,
        question: `Need a hint for level ${safeLevel}`,
        playerProgress: progressAtLevel,
      });

      const generated =
        relevantHints[0] ||
        `For level ${safeLevel}, prioritize defensive timing and consistent movement over risky bursts.`;

      await AIHint.create({
        userId: String(progressAtLevel?.userId || "system"),
        level: safeLevel,
        input: `Auto-generated hint for level ${safeLevel}`,
        hint: generated,
        retrievedHints: relevantHints,
      });

      return generated;
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
