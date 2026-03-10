import dotenv from "dotenv";
import cors from "cors";
import express from "express";
import { ApolloServer } from "@apollo/server";
import bcrypt from "bcrypt";
import configureMongoose from "../../config/mongoose.js";
import User from "../graphQL/models/user.model.js";

dotenv.config();

const app = express();
const PORT = Number(process.env.USER_SERVICE_PORT || 4003);
const allowedOrigins = (process.env.USER_CORS_ORIGINS || "http://localhost:5173,http://localhost:5175")
  .split(",")
  .map((origin) => origin.trim())
  .filter(Boolean);

const typeDefs = `#graphql
  type User {
    userId: ID!
    username: String!
    email: String!
    password: String!
    role: String!
    createdAt: String!
  }

  type Query {
    users: [User!]!
    user(userId: ID!): User
  }

  type Mutation {
    addUser(
      username: String!
      password: String!
      email: String!
      role: String!
      createdAt: String!
    ): User!

    updateUser(
      userId: ID!
      username: String
      email: String
      password: String
      role: String
      createdAt: String
    ): User!

    deleteUser(userId: ID!): Boolean!
    deleteUserByEmail(email: String!): Boolean!
    addFavouriteGame(userId: ID!, gameId: ID!): User!
    removeFavouriteGame(userId: ID!, gameId: ID!): User!
  }
`;

const resolvers = {
  Query: {
    users: async () => await User.find(),
    user: async (_, { userId }) => await User.findById(userId),
  },
  Mutation: {
    addUser: async (_, { username, password, email, role, createdAt }) => {
      const newUser = new User({ username, password, email, role, createdAt });
      return await newUser.save();
    },
    updateUser: async (_, { userId, password, username, email, role, createdAt }) => {
      const updateData = { username, email, role, createdAt };
      if (password) {
        const salt = await bcrypt.genSalt(10);
        updateData.password = await bcrypt.hash(password, salt);
      }
      return await User.findByIdAndUpdate(userId, updateData, { new: true }).populate("favouriteGames");
    },
    deleteUser: async (_, { userId }) => {
      const result = await User.findByIdAndDelete(userId);
      return !!result;
    },
    deleteUserByEmail: async (_, { email }) => {
      const result = await User.findOneAndDelete({ email });
      return !!result;
    },
    addFavouriteGame: async (_, { userId, gameId }) => {
      return await User.findByIdAndUpdate(
        userId,
        { $addToSet: { favouriteGames: gameId } },
        { new: true }
      ).populate("favouriteGames");
    },
    removeFavouriteGame: async (_, { userId, gameId }) => {
      return await User.findByIdAndUpdate(
        userId,
        { $pull: { favouriteGames: gameId } },
        { new: true }
      ).populate("favouriteGames");
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
    res.json({ status: "ok", service: "user-microservice" });
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
    console.log(`User microservice running at http://localhost:${PORT}`);
  });
};

start().catch((error) => {
  console.error("User microservice failed to start", error);
  process.exit(1);
});
