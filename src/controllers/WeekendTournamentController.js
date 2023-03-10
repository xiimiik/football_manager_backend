const {validationResult} = require("express-validator");
const ApiError = require("../exceptions/api-error");
const WeekendTournamentService = require("../services/WeekendTournamentService");

class WeekendTournamentController {
    async getUserWeekendLeague(req, res, next) {
        try {
            const errors = validationResult(req);
            if (!errors.isEmpty()) throw ApiError.BadRequest('Неверные данные!', {errors: errors.errors});

            const id = req.params.id;
            let weekendLeague = await WeekendTournamentService.getUserWeekendLeague(id);

            res.json({
                message: `Лига на выходных юзера #${id}:`,
                details: {
                    weekendLeague
                }
            });
        }
        catch (e) {
            next(e);
        }
    }

    async getUserWeekendMatches(req, res, next) {
        try {
            const errors = validationResult(req);
            if (!errors.isEmpty()) throw ApiError.BadRequest('Неверные данные!', {errors: errors.errors});

            const id = req.params.id;
            let weekendLeagueMatches = await WeekendTournamentService.getUserWeekendMatches(id);

            res.json({
                message: `Матчи юзера #${id} на выходной лиге:`,
                details: {
                    weekendLeagueMatches
                }
            });
        }
        catch (e) {
            next(e);
        }
    }

    async getWeekendMatchesByPhase(req, res, next) {
        try {
            const errors = validationResult(req);
            if (!errors.isEmpty()) throw ApiError.BadRequest('Неверные данные!', {errors: errors.errors});

            const phase = req.params.phase_id,
                phaseMatches = await WeekendTournamentService.getWeekendMatchesByPhase(phase);

            if (!phaseMatches.length) throw ApiError.BadRequest('Матчи такой фазы не были найдены!');

            res.json({
                message: `Список матчей фазы ${phase}:`,
                details: {
                    phaseMatches
                }
            });
        }
        catch (e) {
            next(e);
        }
    }

    async getLeagueLeaderboard(req, res, next) {
      try {
          const errors = validationResult(req);
          if (!errors.isEmpty()) throw ApiError.BadRequest('Неверные данные!', {errors: errors.errors});

          const users = await WeekendTournamentService.getLeagueLeaderboard(+req.params.userId);

          if (users === null) throw ApiError.BadRequest('Такая лига не была найдена!');
          if (users === []) throw ApiError.BadRequest(`Ещё не было сыграно ни одного матча в лиге #${leagueId}!`);

          res.json({
              message: `Рейтиновая таблица:`,
              details: {
                  users
              }
          });
      }
      catch (e) {
          next(e);
      }
  }
}

module.exports = new WeekendTournamentController();