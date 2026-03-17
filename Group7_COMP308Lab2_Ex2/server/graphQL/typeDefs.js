// typeDefs.js is a file that contains the GraphQL 
// schema definition language (SDL) that defines the types, 
// queries, and mutations that the GraphQL server supports. 
// The schema is defined using the GraphQL schema definition 
// language (SDL).
const typeDefs = `#graphql
  type Player {
    playerId: ID!
    username: String!
    email: String!
    avatarIMG: String!
    favouriteGames: [Game!]
  }

  type AuthPayload {
    player: Player!
    message: String!
  }

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
<<<<<<< Updated upstream:Group7_COMP308Lab2_Ex2/server/graphQL/typeDefs.js
    players: [Player!]!
    player(playerId: ID!): Player
    games: [Game!]!
    game(gameId: ID!): Game
    gamesByGenre(genre: String!): [Game!]!
    gamesByPlatform(platform: String!): [Game!]!
    gamesByDeveloper(developer: String!): [Game!]!
    gamesByYear(releaseYear: Int!): [Game!]!
=======
    users: [User!]!
    user(userId: ID!): User

    gameProgressList: [GameProgress!]!
    gameProgress(progressId: ID!): GameProgress
    gameProgressByUser(userId: ID!): GameProgress
    leaderboard(limit: Int = 10): [GameProgress!]!
>>>>>>> Stashed changes:Group7_COMP308Lab3_Ex2/server/graphQL/typeDefs.js
  }

  type Mutation {
    addPlayer(
      username: String!
      password: String!
      email: String!
      avatarIMG: String
      favouriteGames: [ID!]
    ): Player!
    
    updatePlayer(
      playerId: ID!
      username: String
      email: String
      password: String
      avatarIMG: String
      favouriteGames: [ID!]
    ): Player!
    
    login(email: String!, password: String!): AuthPayload!

    deletePlayer(playerId: ID!): Boolean!
    deletePlayerByEmail(email: String!): Boolean!

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

<<<<<<< Updated upstream:Group7_COMP308Lab2_Ex2/server/graphQL/typeDefs.js
    deleteGame(gameId: ID!): Boolean!
    deleteGameByTitle(title: String!): Boolean!

    addFavouriteGame(playerId: ID!, gameId: ID!): Player!
    removeFavouriteGame(playerId: ID!, gameId: ID!): Player!
=======
    deleteGameProgress(progressId: ID!): Boolean!
    deleteGameProgressByUser(userId: ID!): Boolean!
>>>>>>> Stashed changes:Group7_COMP308Lab3_Ex2/server/graphQL/typeDefs.js
  }
`;  

export default typeDefs;
