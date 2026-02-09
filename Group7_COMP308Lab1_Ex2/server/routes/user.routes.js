import express from "express";
import userCtrl from "../controllers/user.controller.js";
import authCtrl from "../controllers/auth.controller.js";
const router = express.Router();
router.route("/api/users").post(userCtrl.create);
router.route("/api/users").get(userCtrl.list);

router
  .route("/api/users/:userId")
  .get(authCtrl.requireLogin, userCtrl.read)
  .put(authCtrl.requireLogin, authCtrl.hasAuthorization, userCtrl.update)
  .delete(authCtrl.requireLogin, authCtrl.hasAuthorization, userCtrl.remove);

router.param("userId", userCtrl.userByID);
export default router;
