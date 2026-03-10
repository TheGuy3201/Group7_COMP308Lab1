import dotenv from "dotenv";
import cors from "cors";
import express from "express";
import { ApolloServer } from "@apollo/server";
import configureMongoose from "../../config/mongoose.js";
import Game from "../graphQL/models/game.model.js";

dotenv.config({ quiet: true });

const app = express();
const PORT = Number(process.env.GAME_SERVICE_PORT || 4004);
const allowedOrigins = (process.env.GAME_CORS_ORIGINS || "http://localhost:5173,http://localhost:5175")
  .split(",")
  .map((origin) => origin.trim())
  .filter(Boolean);

const typeDefs = `#graphql
  type Game {
    gameId: ID!
    title: String!
    genre: String!
    platform: String
    releaseYear: Int
    developer: String
    rating: Float
    description: String
  }

  type Query {
    games: [Game!]!
    game(gameId: ID!): Game
    gamesByGenre(genre: String!): [Game!]!
    gamesByPlatform(platform: String!): [Game!]!
    gamesByDeveloper(developer: String!): [Game!]!
    gamesByYear(releaseYear: Int!): [Game!]!
    searchGames(searchTerm: String!): [Game!]!
  }

  type Mutation {
    addGame(
      title: String!
      genre: String!
      platform: String
      releaseYear: Int
      developer: String
      rating: Float
      description: String
    ): Game!

    updateGame(
      gameId: ID!
      title: String
      genre: String
      platform: String
      releaseYear: Int
      developer: String
      rating: Float
      description: String
    ): Game!

    deleteGame(gameId: ID!): Boolean!
    deleteGameByTitle(title: String!): Boolean!
  }
`;

const resolvers = {
  Query: {
    games: async () => await Game.find(),
    game: async (_, { gameId }) => await Game.findById(gameId),
    gamesByGenre: async (_, { genre }) => await Game.find({ genre }),
    gamesByPlatform: async (_, { platform }) => await Game.find({ platform }),
    gamesByDeveloper: async (_, { developer }) => await Game.find({ developer }),
    gamesByYear: async (_, { releaseYear }) => await Game.find({ releaseYear }),
    searchGames: async (_, { searchTerm }) =>
      await Game.find({
        $or: [
          { title: { $regex: searchTerm, $options: "i" } },
          { genre: { $regex: searchTerm, $options: "i" } },
          { platform: { $regex: searchTerm, $options: "i" } },
        ],
      }),
  },
  Mutation: {
    addGame: async (_, { title, genre, platform, releaseYear, developer, rating, description }) => {
      const newGame = new Game({ title, genre, platform, releaseYear, developer, rating, description });
      return await newGame.save();
    },
    updateGame: async (_, { gameId, title, genre, platform, releaseYear, developer, rating, description }) =>
      await Game.findByIdAndUpdate(
        gameId,
        { title, genre, platform, releaseYear, developer, rating, description },
        { new: true }
      ),
    deleteGame: async (_, { gameId }) => {
      const result = await Game.findByIdAndDelete(gameId);
      return !!result;
    },
    deleteGameByTitle: async (_, { title }) => {
      const result = await Game.findOneAndDelete({ title });
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
    res.json({ status: "ok", service: "game-microservice" });
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
    console.log(`Game microservice running at http://localhost:${PORT}`);
  });
};

start().catch((error) => {
  console.error("Game microservice failed to start", error);
  process.exit(1);
});
