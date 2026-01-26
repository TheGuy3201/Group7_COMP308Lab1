import Game from "../models/game.model.js";
import extend from "lodash/extend.js";
import errorHandler from "./error.controller.js";

const create = async (req, res) => {
  const game = new Game(req.body);
  try {
    await game.save();
    return res.status(200).json({
      message: "Successfully created game!",
    });
  } catch (err) {
    return res.status(400).json({
      error: errorHandler.getErrorMessage(err),
    });
  }
};

const list = async (req, res) => {
  try {
    let games = await Game.find().select("title genre platform releaseYear developer rating description updated created");
    res.json(games);
  } catch (err) {
    return res.status(400).json({
      error: errorHandler.getErrorMessage(err),
    });
  }
};

const gameByID = async (req, res, next, id) => {
  try {
    let game = await Game.findById(id);
    if (!game)
      return res.status(400).json({
        error: "Game not found",
      });
    req.game = game;
    next();
  } catch (err) {
    return res.status(400).json({
      error: "Could not retrieve game",
    });
  }
};

const read = (req, res) => {
  return res.json(req.game);
};

const update = async (req, res) => {
  try {
    let game = req.game;
    game = extend(game, req.body);
    game.updated = Date.now();
    await game.save();
    res.json(game);
  } catch (err) {
    return res.status(400).json({
      error: errorHandler.getErrorMessage(err),
    });
  }
};

const remove = async (req, res) => {
  try {
    let game = req.game;
    let deletedGame = await game.deleteOne();
    res.json(deletedGame);
  } catch (err) {
    return res.status(400).json({
      error: errorHandler.getErrorMessage(err),
    });
  }
};

export default { create, gameByID, read, list, remove, update };
