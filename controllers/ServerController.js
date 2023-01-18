const ApiError = require("../exceptions/api-error");
const ServerService = require("../services/ServerService");
const {validationResult} = require("express-validator");

class ServerController {
    async generateServer(req, res, next) {
        try {
            const errors = validationResult(req);
            if (!errors.isEmpty()) throw ApiError.BadRequest('Неверные данные!', {errors: errors.errors});

            const server = await ServerService.generateServer(req.body.regionId);
            if (!server) throw ApiError.InternalServerError('Неизвестная ошибка сервера при создании игрового сервера!');

            res.json({
                message: 'Сервер успешно создан!', details: {
                    server
                }
            });
        }
        catch (e) {
            next(e);
        }
    }

    async getAllServers(req, res, next) {
        try {
            const errors = validationResult(req);
            if (!errors.isEmpty()) throw ApiError.BadRequest('Неверные данные!', {errors: errors.errors});

            const servers = await ServerService.getAllServers();

            res.json({
                message: `Список серверов:`, details: {
                    servers
                }
            });
        }
        catch (e) {
            next(e);
        }
    }

    async getServerCountries(req, res, next) {
        try {
            const errors = validationResult(req);
            if (!errors.isEmpty()) throw ApiError.BadRequest('Неверные данные!', {errors: errors.errors});

            const id = req.params.id, server = await ServerService.getServerCountries(id);

            if (!server) throw ApiError.BadRequest(`Сервера #${id} не существует!`);

            res.json({
                message: `Страны сервера #${id}:`,
                details: {
                    countries: server.region.countries
                }
            });
        }
        catch (e) {
            next(e);
        }
    }

    async getLeaguesInServerCountry(req, res, next) {
        try {
            const serverId = req.params.server_id, countryId = req.params.country_id,
                leagues = await ServerService.getLeaguesInServerCountry(serverId, countryId);

            if (!leagues.length) throw ApiError.BadRequest(`Лиги на таких сервере и стране не найдены!`);

            res.json({
                message: `Лиги сервера #${serverId} и страны #${countryId}:`, details: {
                    leagues
                }
            });
        }
        catch (e) {
            next(e);
        }
    }

    async getLeagueUsers(req, res, next) {
        try {
            const leagueId = req.params.league_id, leagueUsers = await ServerService.getLeagueUsers(leagueId);

            if (!leagueUsers.length) throw ApiError.BadRequest(`Такой лиги не существует!`);

            res.json({
                message: `Юзеры лиги #${leagueId}:`, details: {
                    leagueUsers
                }
            });
        }
        catch (e) {
            next(e);
        }
    }
}

module.exports = new ServerController();