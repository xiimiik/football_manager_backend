const { Router } = require("express");
const AuthController = require("../controllers/AuthController");
const { check } = require("express-validator");

const AuthApiRouter = Router();

AuthApiRouter.post(
  "/user_swap_bot",
  [
    check("botId")
      .isInt()
      .withMessage("Поле <botId> должно быть типа integer!")
      .toInt(),
  ],
  AuthController.swapUserWithBot
);

AuthApiRouter.get(
  "/profileIdBy/:strategy/:accountId",
  [
    check("strategy")
      .isString()
      .withMessage("Поле <strategy> должно быть типа string!"),
    check("accountId")
      .isString()
      .withMessage("Поле <accountId> должно быть типа string!"),
  ],
  AuthController.getUserProfileByAccountId
);

AuthApiRouter.post(
  "/linkup",
  [
    check("user.id")
      .isInt()
      .withMessage("Поле <user.id> должно быть типа integer!")
      .toInt(),
    check("linkup").custom((linkup) => {
      if (typeof linkup.strategy !== "string")
        throw new Error("Поле <linkup.strategy> должно быть типа string!");
      if (typeof linkup.accountId !== "string")
        throw new Error("Поле <linkup.accountId> должно быть типа string!");
      return true;
    }),
  ],
  AuthController.linkupUserProfile
);

AuthApiRouter.post(
  "/reloadProfile",
  [
    check("user.id")
      .isInt()
      .withMessage("Поле <user.id> должно быть типа integer!")
      .toInt(),
    check("linkup").custom((linkup) => {
      if (typeof linkup.strategy !== "string")
        throw new Error("Поле <linkup.strategy> должно быть типа string!");
      if (typeof linkup.accountId !== "string")
        throw new Error("Поле <linkup.accountId> должно быть типа string!");
      return true;
    }),
  ],
  AuthController.reloadUserProfile
);

module.exports = AuthApiRouter;
