import mongoose from 'mongoose';

const gameSchema = new mongoose.Schema({
  title: { type: String, required: true, unique: true },
  genre: { type: String, required: true },
  platform: { type: String },
  releaseYear: { type: Number },
  developer: { type: String },
  rating: { type: Number, min: 0, max: 10 },
  description: { type: String },
  createdAt: { type: Date, default: Date.now }
});

// Virtual getter for gameId that returns _id as a string
gameSchema.virtual('gameId').get(function() {
  return this._id.toString();
});

gameSchema.set('toObject', { virtuals: true });
gameSchema.set('toJSON', { virtuals: true });

export default mongoose.model('Game', gameSchema);