// resolvers.js Code for the resolvers of the GraphQL server
import User from './models/user.model.js';
import Game from './models/game.model.js';
import bcrypt from 'bcrypt';

const resolvers = {
  Query: {
    // -----USERS-----
    users: async () => {
      return await User.find();
    },

    user: async (_, { userId }) => {
      return await User.findById(userId);
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
    // -----USERS-----
    addUser: async (_, { username, password, email, role, createdAt }) => {
      const newUser = new User({
        username,
        password,
        email,
        role,
        createdAt
      });
      return await newUser.save();
    },
    updateUser: async (_, { userId, password, username, email, role, createdAt }) => {
      const updateData = { username, email, role, createdAt };
      if (password) {
        const salt = await bcrypt.genSalt(10);
        updateData.password = await bcrypt.hash(password, salt);
      }
      return await User.findByIdAndUpdate(
        userId,
        updateData,
        { new: true }
      );
    },
    deleteUser: async (_, { userId }) => {
      const result = await User.findByIdAndDelete(userId);
      return !!result;
    },
    deleteUserByEmail: async (_, { email }) => {
      const result = await User.findOneAndDelete({ email });
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
    login: async (_, { email, password }) => {
      const user = await User.findOne({ email });
      
      if (!user) {
        throw new Error('Invalid email or password');
      }
      
      const isValidPassword = await user.comparePassword(password);
      
      if (!isValidPassword) {
        throw new Error('Invalid email or password');
      }
      
      return {
        user: user,
        message: 'Login successful'
      };
    },
  }
};

export default resolvers;