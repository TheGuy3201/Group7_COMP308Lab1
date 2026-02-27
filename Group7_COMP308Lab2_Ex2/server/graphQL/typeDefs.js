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
    players: [Player!]!
    player(playerId: ID!): Player
    games: [Game!]!
    game(gameId: ID!): Game
    gamesByGenre(genre: String!): [Game!]!
    gamesByPlatform(platform: String!): [Game!]!
    gamesByDeveloper(developer: String!): [Game!]!
    gamesByYear(releaseYear: Int!): [Game!]!

    searchGames(searchTerm: String!): [Game!]!
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

    addFavouriteGame(playerId: ID!, gameId: ID!): Player!
    removeFavouriteGame(playerId: ID!, gameId: ID!): Player!
  }
`;  

export default typeDefs;
