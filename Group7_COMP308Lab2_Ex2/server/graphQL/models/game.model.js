import mongoose from 'mongoose';

const gameProgressSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    level: { type: Number, required: true, default: 1, min: 1 },
    experiencePoints: { type: Number, required: true, default: 0, min: 0 },
    score: { type: Number, required: true, default: 0, min: 0 },
    rank: { type: Number },
    achievements: { type: [String], default: [] },
    progress: { type: String, default: 'Not started' },
    lastPlayed: { type: Date, default: Date.now },
  },
  {
    timestamps: { createdAt: false, updatedAt: true },
  }
);

// Virtual getter for progressId that returns _id as a string
gameProgressSchema.virtual('progressId').get(function() {
  return this._id.toString();
});

gameProgressSchema.set('toObject', { virtuals: true });
gameProgressSchema.set('toJSON', { virtuals: true });

export default mongoose.model('GameProgress', gameProgressSchema);