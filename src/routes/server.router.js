const { Router } = require("express");
const ServerController = require("../controllers/ServerController");
const { check } = require("express-validator");

const ServerApiRouter = Router();

ServerApiRouter.post(
  "/",
  [
    check("regionId")
      .isInt()
      .withMessage("Поле <regionId> должно быть типа integer!")
      .toInt(),
  ],
  ServerController.generateServer
);

ServerApiRouter.get("/list", ServerController.getAllServers);

ServerApiRouter.get(
  "/:id/country/list",
  [
    check("id")
      .isInt()
      .withMessage("Поле <id> должно быть типа integer!")
      .toInt(),
  ],
  ServerController.getServerCountries
);

ServerApiRouter.get(
  "/:server_id/country/:country_id/league/list",
  [
    check("server_id")
      .isInt()
      .withMessage("Поле <server_id> должно быть типа integer!")
      .toInt(),
    check("country_id")
      .isInt()
      .withMessage("Поле <country_id> должно быть типа integer!")
      .toInt(),
  ],
  ServerController.getLeaguesInServerCountry
);

ServerApiRouter.get(
  "/league/:league_id/users/list",
  [
    check("league_id")
      .isInt()
      .withMessage("Поле <league_id> должно быть типа integer!")
      .toInt(),
  ],
  ServerController.getLeagueUsers
);

module.exports = ServerApiRouter;
