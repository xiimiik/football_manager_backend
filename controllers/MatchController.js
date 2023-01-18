const ApiError = require("../exceptions/api-error");
const MatchService = require("../services/MatсhService");
const {validationResult} = require("express-validator");

class MatchController {
    async setTeamOnMatch(req, res, next) {
        try {
            const errors = validationResult(req);
            if (!errors.isEmpty()) throw ApiError.BadRequest('Неверные данные!', {errors: errors.errors});

            const {userId, teamJson} = req.body;

            let isUpdated = await MatchService.setMatchTeam(userId, teamJson);
            if (!isUpdated) throw ApiError.BadRequest(`Юзер #${userId} не существует!`);

            res.json({
                message: `Юзер #${userId} обновил состав на следующий матч!`
            });
        }
        catch (e) {
            next(e);
        }
    }

    async setTacticOnMatch(req, res, next) {
        try {
            const errors = validationResult(req);
            if (!errors.isEmpty()) throw ApiError.BadRequest('Неверные данные!', {errors: errors.errors});

            const {userId, tacticJson} = req.body;

            let isUpdated = await MatchService.setMatchTactic(userId, tacticJson);
            if (!isUpdated) throw ApiError.BadRequest(`Юзер #${userId} не существует!`);

            res.json({
                message: `Юзер #${userId} обновил тактику на следующий матч!`
            });
        }
        catch (e) {
            next(e);
        }
    }

    async getMatchInfo(req, res, next) {
        try {
            const errors = validationResult(req);
            if (!errors.isEmpty()) throw ApiError.BadRequest('Неверные данные!', {errors: errors.errors});

            const {id} = req.params;

            let match = await MatchService.getMatchInfo(id);
            if (!match) throw ApiError.BadRequest(`Матч #${id} не был найден!`);

            res.json({
                message: `Информация по матчу #${id}:`,
                details: {
                    match
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

            const leagueId = req.params.id,
                users = await MatchService.getLeagueLeaderboard(leagueId);

            if (users === null) throw ApiError.BadRequest('Такая лига не была найдена!');
            if (users === []) throw ApiError.BadRequest(`Ещё не было сыграно ни одного матча в лиге #${leagueId}!`);

            res.json({
                message: `Рейтиновая таблица лиги #${leagueId}:`,
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

module.exports = new MatchController();