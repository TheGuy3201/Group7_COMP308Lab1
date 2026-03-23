import mongoose from "mongoose";

const gameProgressSchema = new mongoose.Schema(
  {
    userId: { type: String, required: true },
    level: { type: Number, required: true, default: 1 },
    experiencePoints: { type: Number, required: true, default: 0 },
    score: { type: Number, required: true, default: 0 },
    rank: { type: Number },
    achievements: { type: [String], default: [] },
    progress: { type: String, default: "Not started" },
    lastPlayed: { type: Date },
  },
  { timestamps: true }
);

// Virtual ID
gameProgressSchema.virtual("progressId").get(function () {
  return this._id.toString();
});

gameProgressSchema.set("toJSON", { virtuals: true });
gameProgressSchema.set("toObject", { virtuals: true });

export default mongoose.model("GameProgress", gameProgressSchema);