const { Router } = require("express");
const LeagueController = require("../controllers/LeagueController");
const { check } = require("express-validator");

const LeagueApiRouter = Router();

LeagueApiRouter.get(
  "/league_by_invite_code/:invite_code",
  [
    check("invite_code")
      .isString()
      .withMessage("Поле <invite_code> должно быть типа string!"),
  ],
  LeagueController.getLeagueByInviteCode
);

module.exports = LeagueApiRouter;
