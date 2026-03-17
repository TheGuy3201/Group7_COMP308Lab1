// resolvers.js Code for the resolvers of the GraphQL server
<<<<<<< Updated upstream:Group7_COMP308Lab2_Ex2/server/graphQL/resolvers.js
import Player from './models/player.model.js';
import Game from './models/game.model.js';
=======
import User from './models/user.model.js';
import GameProgress from './models/game.model.js';
>>>>>>> Stashed changes:Group7_COMP308Lab3_Ex2/server/graphQL/resolvers.js
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
<<<<<<< Updated upstream:Group7_COMP308Lab2_Ex2/server/graphQL/resolvers.js
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
=======

    // -----GAME PROGRESS-----
    gameProgressList: async () => {
      return await GameProgress.find().sort({ updatedAt: -1 });
    },

    gameProgress: async (_, { progressId }) => {
      return await GameProgress.findById(progressId);
    },

    gameProgressByUser: async (_, { userId }) => {
      return await GameProgress.findOne({ userId });
    },

    leaderboard: async (_, { limit = 10 }) => {
      return await GameProgress.find()
        .sort({ score: -1, level: -1, experiencePoints: -1 })
        .limit(limit);
    }
>>>>>>> Stashed changes:Group7_COMP308Lab3_Ex2/server/graphQL/resolvers.js
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
    // -----GAME PROGRESS-----
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
    }
  }
};

export default resolvers;