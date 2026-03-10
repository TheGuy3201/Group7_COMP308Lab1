// resolvers.js Code for the resolvers of the GraphQL server
import Player from './models/player.model.js';
import Game from './models/game.model.js';
import bcrypt from 'bcrypt';

const DEFAULT_AVATAR_IMG = '/assets/images/game.png';

const resolvers = {
  Player: {
    avatarIMG: (player) => player.avatarIMG || DEFAULT_AVATAR_IMG,
  },

  Query: {

    // -----PLAYERS-----
    players: async () => {
      return await Player.find().populate('favouriteGames');
    },

    player: async (_, { playerId }) => {
      return await Player.findById(playerId).populate('favouriteGames');
    },

    // -----GAMES-----
    games: async () => {
      return await Game.find();
    },

    game: async (_, { gameId }) => {
      return await Game.findById(gameId);
    },

    gamesByGenre: async (_, { genre }) => {
      return await Game.find({ genre });
    },

    gamesByPlatform: async (_, { platform }) => {
      return await Game.find({ platform });
    },

    gamesByDeveloper: async (_, { developer }) => {
      return await Game.find({ developer });
    },

    gamesByYear: async (_, { releaseYear }) => {
      return await Game.find({ releaseYear });
    },

    
    searchGames: async (_, { searchTerm }) => {
      return await Game.find({
        $or: [
          { title: { $regex: searchTerm, $options: "i" } },
          { genre: { $regex: searchTerm, $options: "i" } },
          { platform: { $regex: searchTerm, $options: "i" } }
        ]
      });
    }
  },

  Mutation: {
    // -----PLAYERS-----
    addPlayer: async (_, { username, password, email, avatarIMG, favouriteGames }) => {
      const newPlayer = new Player({
        username,
        password,
        email,
        avatarIMG: avatarIMG || DEFAULT_AVATAR_IMG,
        favouriteGames: favouriteGames || []
      });
      return await newPlayer.save();
    },
    updatePlayer: async (_, { playerId, password, username, email, avatarIMG, favouriteGames }) => {
      const updateData = { username, email, avatarIMG, favouriteGames };
      if (password) {
        const salt = await bcrypt.genSalt(10);
        updateData.password = await bcrypt.hash(password, salt);
      }
      return await Player.findByIdAndUpdate(
        playerId,
        updateData,
        { new: true }
      ).populate('favouriteGames');
    },
    deletePlayer: async (_, { playerId }) => {
      const result = await Player.findByIdAndDelete(playerId);
      return !!result;
    },
    deletePlayerByEmail: async (_, { email }) => {
      const result = await Player.findOneAndDelete({ email });
      return !!result;
    },
    //-----GAMES-----
    addGame: async (_, { title, genre, platform, releaseYear, developer, rating, description }) => {
      const newGame = new Game({
        title,
        genre,
        platform,
        releaseYear,
        developer,
        rating,
        description
      });
      return await newGame.save();
    },
    updateGame: async (_, { gameId, title, genre, platform, releaseYear, developer, rating, description }) => {
      return await Game.findByIdAndUpdate(
        gameId,
        { title, genre, platform, releaseYear, developer, rating, description },
        { new: true }
      );
    },
    deleteGame: async (_, { gameId }) => {
      const result = await Game.findByIdAndDelete(gameId);
      return !!result;
    },
    deleteGameByTitle: async (_, { title }) => {
      const result = await Game.findOneAndDelete({ title });
      return !!result;
    },
    addFavouriteGame: async (_, { playerId, gameId }) => {
      return await Player.findByIdAndUpdate(
        playerId,
        { $addToSet: { favouriteGames: gameId } },
        { new: true }
      ).populate('favouriteGames');
    },
    removeFavouriteGame: async (_, { playerId, gameId }) => {
      return await Player.findByIdAndUpdate(
        playerId,
        { $pull: { favouriteGames: gameId } },
        { new: true }
      ).populate('favouriteGames');
    },
    login: async (_, { email, password }) => {
      const player = await Player.findOne({ email }).populate('favouriteGames');
      
      if (!player) {
        throw new Error('Invalid email or password');
      }
      
      const isValidPassword = await player.comparePassword(password);
      
      if (!isValidPassword) {
        throw new Error('Invalid email or password');
      }
      
      return {
        player,
        message: 'Login successful'
      };
    },
  }
};

export default resolvers;