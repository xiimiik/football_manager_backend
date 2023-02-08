const { Router } = require("express");
const UserController = require("../controllers/UserController");
const { check } = require("express-validator");

const UserApiRouter = Router();

UserApiRouter.get(
  "/:id",
  [
    check("id")
      .isInt()
      .withMessage("Поле <id> должно быть типа integer!")
      .toInt(),
  ],
  UserController.getInfo
);

UserApiRouter.get(
  "/progress/:id",
  [
    check("id")
      .isInt()
      .withMessage("Поле <id> должно быть типа integer!")
      .toInt(),
  ],
  UserController.getProgress
);

UserApiRouter.get(
  "/leagueMatches/:id",
  [
    check("id")
      .isInt()
      .withMessage("Поле <id> должно быть типа integer!")
      .toInt(),
  ],
  UserController.getLeagueMatches
);

UserApiRouter.put(
  "/updateProfile/:id",
  [
    check("id")
      .isInt()
      .withMessage("Поле <id> должно быть типа integer!")
      .toInt(),
    check("name").isString().withMessage("Поле <name> должно быть строкой!"),
    check("abbr")
      .isString()
      .withMessage("Поле <abbr> должно быть строкой максимум из 5 символов!")
      .bail()
      .isLength({ min: undefined, max: 5 })
      .withMessage("Поле <abbr> должно быть строкой максимум из 5 символов!"),
    check("logo").isString().withMessage("Поле <logo> должно быть строкой!"),
  ],
  UserController.updateProfile
);

UserApiRouter.get(
  "/getMoney/:id",
  [
    check("id")
      .isInt()
      .withMessage("Поле <id> должно быть типа integer!")
      .toInt(),
  ],
  UserController.getMoney
);

UserApiRouter.put(
  "/updateMoney/:id",
  [
    check("id")
      .isInt()
      .withMessage("Поле <id> должно быть типа integer!")
      .toInt(),
    check("moneyType")
      .isString()
      .withMessage("Поле <moneyType> должно быть типа string!"),
    check("amount")
      .isInt()
      .withMessage("Поле <amount> должно быть типа integer!")
      .toInt(),
  ],
  UserController.updateMoney
);

UserApiRouter.put(
  "/updateAvatar/:id",
  [
    check("id")
      .isInt()
      .withMessage("Поле <id> должно быть типа integer!")
      .toInt(),
    check("avatar")
      .isInt({ min: 1, max: 5 })
      .withMessage("Поле <avatar> должно быть типа integer и {1-5}!")
      .toInt(),
  ],
  UserController.updateAvatar
);

UserApiRouter.put(
  "/updatePlayers/:id",
  [
    check("id")
      .isInt()
      .withMessage("Поле <id> должно быть типа integer!")
      .toInt(),
    check("playersJson")
      .isJSON()
      .withMessage("Поле <playersJson> должно быть в виде json!"),
  ],
  UserController.updatePlayers
);

UserApiRouter.put(
  "/updateUserPlayer/:id",
  [
    check("id")
      .isInt()
      .withMessage("Поле <id> должно быть типа integer!")
      .toInt(),
  ],
  UserController.updatePlayer
);

UserApiRouter.put(
  "/updateWaitingPlayers/:id",
  [
    check("id")
      .isInt()
      .withMessage("Поле <id> должно быть типа integer!")
      .toInt(),
    check("waitingPlayersJson")
      .isJSON()
      .withMessage("Поле <waitingPlayersJson> должно быть в виде json!"),
  ],
  UserController.updateWaitingPlayers
);

UserApiRouter.put(
  "/updateTempPlayer/:id",
  [
    check("id")
      .isInt()
      .withMessage("Поле <id> должно быть типа integer!")
      .toInt(),
    check("tempPlayer")
      .isJSON()
      .withMessage("Поле <tempPlayer> должно быть в виде json!"),
  ],
  UserController.updateTempPlayer
);

UserApiRouter.get(
  "/checkTempPlayer/:id",
  [
    check("id")
      .isInt()
      .withMessage("Поле <id> должно быть типа integer!")
      .toInt(),
  ],
  UserController.checkTempPlayer
);

UserApiRouter.put(
  "/updateTempAction/:id",
  [
    check("id")
      .isInt()
      .withMessage("Поле <id> должно быть типа integer!")
      .toInt(),
    check("tempAction")
      .isJSON()
      .withMessage("Поле <tempAction> должно быть в виде json!"),
  ],
  UserController.updateTempAction
);

UserApiRouter.get(
  "/checkTempAction/:id",
  [
    check("id")
      .isInt()
      .withMessage("Поле <id> должно быть типа integer!")
      .toInt(),
  ],
  UserController.checkTempAction
);

UserApiRouter.put(
  "/updateTempDialogs/:id",
  [
    check("id")
      .isInt()
      .withMessage("Поле <id> должно быть типа integer!")
      .toInt(),
    check("tempDialogs")
      .isJSON()
      .withMessage("Поле <tempDialogs> должно быть в виде json!"),
  ],
  UserController.updateTempDialogs
);

UserApiRouter.get(
  "/checkTempDialogs/:id",
  [
    check("id")
      .isInt()
      .withMessage("Поле <id> должно быть типа integer!")
      .toInt(),
  ],
  UserController.checkTempDialogs
);

UserApiRouter.get(
  "/:id/last_match",
  [
    check("id")
      .isInt()
      .withMessage("Поле <id> должно быть типа integer!")
      .toInt(),
  ],
  UserController.getLastPlayedMatch
);

module.exports = UserApiRouter;
