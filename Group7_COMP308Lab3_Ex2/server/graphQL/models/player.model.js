import mongoose from 'mongoose';
import bcrypt from 'bcrypt';

const playerSchema = new mongoose.Schema({
  username: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  avatarIMG: { type: String, default: '/assets/images/game.png' },
  favouriteGames: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Game' }],
  createdAt: { type: Date, default: Date.now }
});

// Virtual getter for playerId that returns _id as a string
playerSchema.virtual('playerId').get(function() {
  return this._id.toString();
});

playerSchema.set('toObject', { virtuals: true });
playerSchema.set('toJSON', { virtuals: true });

// Hash password before saving
playerSchema.pre('save', async function(next) {
  // Only hash if password is modified or new
  if (!this.isModified('password')) return next();
  
  try {
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
    next();
  } catch (error) {
    next(error);
  }
});

// Method to compare passwords for login
playerSchema.methods.comparePassword = async function(candidatePassword) {
  return await bcrypt.compare(candidatePassword, this.password);
};

export default mongoose.model('Player', playerSchema);