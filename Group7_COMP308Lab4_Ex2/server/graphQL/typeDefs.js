// typeDefs.js is a file that contains the GraphQL 
// schema definition language (SDL) that defines the types, 
// queries, and mutations that the GraphQL server supports. 
// The schema is defined using the GraphQL schema definition 
// language (SDL).
const typeDefs = `#graphql
  type User {
    userId: ID!
    username: String!
    email: String!
    role: String!
    createdAt: String!
  }

  type AuthPayload {
    user: User!
    message: String!
  }

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
    users: [User!]!
    user(userId: ID!): User
    games: [Game!]!
    game(gameId: ID!): Game
    gamesByGenre(genre: String!): [Game!]!
    gamesByPlatform(platform: String!): [Game!]!
    gamesByDeveloper(developer: String!): [Game!]!
    gamesByYear(releaseYear: Int!): [Game!]!

    searchGames(searchTerm: String!): [Game!]!
  }

  type Mutation {
    addUser(
      username: String!
      password: String!
      email: String!
      role: String
      createdAt: String
    ): User!
    
    updateUser(
      userId: ID!
      username: String
      email: String
      password: String
      role: String
      createdAt: String
    ): User!
    
    login(email: String!, password: String!): AuthPayload!

    deleteUser(userId: ID!): Boolean!
    deleteUserByEmail(email: String!): Boolean!

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

export default typeDefs;
