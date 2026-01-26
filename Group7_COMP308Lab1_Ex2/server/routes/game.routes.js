import express from "express";
import gameCtrl from "../controllers/game.controller.js";
import authCtrl from "../controllers/auth.controller.js";

const router = express.Router();

router.route("/api/games").post(gameCtrl.create);
router.route("/api/games").get(gameCtrl.list);

router
  .route("/api/games/:gameId")
  .get(gameCtrl.read)
  .put(authCtrl.requireLogin, gameCtrl.update)
  .delete(authCtrl.requireLogin, gameCtrl.remove);

router.param("gameId", gameCtrl.gameByID);

export default router;
