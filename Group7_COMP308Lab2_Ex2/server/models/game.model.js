import mongoose from "mongoose";

const GameSchema = new mongoose.Schema({
  title: {
    type: String,
    trim: true,
    required: "Title is required",
  },
  genre: {
    type: String,
    trim: true,
    required: "Genre is required",
  },
    platform: {
    type: String,
    trim: true
  },
  releaseYear: {
    type: Number,
  },
  developer: {
    type: String,
    trim: true
  },
  rating: {
    type: Number,
    min: 0,
    max: 10
  },
  description: {
    type: String,
    trim: true
  },
  created: {
    type: Date,
    default: Date.now,
  },
  updated: {
    type: Date,
    default: Date.now,
  },
});

export default mongoose.model("Game", GameSchema);
