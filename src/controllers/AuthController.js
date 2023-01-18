const ApiError = require("../exceptions/api-error");
const AuthService = require("../services/AuthService");
const {validationResult} = require("express-validator");

class AuthController {
    async swapUserWithBot(req, res, next) {
        try {
            const errors = validationResult(req);
            if (!errors.isEmpty()) throw ApiError.BadRequest('Неверные данные!', {errors: errors.errors});

            const botId = req.body.botId;
            const isUpdated = await AuthService.swapUserWithBot(botId);
            if (!isUpdated) throw ApiError.BadRequest(`Бот #${botId} не существует!`)

            res.json({
                message: `Новый юзер зашёл за бота #${botId}!`
            });
        }
        catch (e) {
            next(e);
        }
    }

    async getUserProfileByAccountId(req, res, next) {
        try {
            const errors = validationResult(req);
            if (!errors.isEmpty()) throw ApiError.BadRequest('Неверные данные!', {errors: errors.errors});

            const {strategy, accountId} = req.params;
            const existingAccount = AuthService.getUserProfileByAccountId(strategy, accountId);
            if (!existingAccount) throw ApiError.BadRequest(`Не был найден игровой профиль привязанный к аккаунту #${accountId}!`);

            res.json({
                message: `Id игрового профиля привязанного к аккаунту #${accountId}:`,
                details: {
                    userId: existingAccount.userId
                },
            });
        }
        catch (e) {
            next(e);
        }
    }

    async linkupUserProfile(req, res, next) {
        try {
            const errors = validationResult(req);
            if (!errors.isEmpty()) throw ApiError.BadRequest('Неверные данные!', {errors: errors.errors});

            const {id} = req.body.user, {strategy, accountId} = req.body.linkup;
            const existingAccount = await AuthService.getUserProfileByAccountId(strategy, accountId);

            if (existingAccount) {
                if (existingAccount.userId === id) throw ApiError.BadRequest(`Игровой профиль #${id} уже привязан к аккаунту #${strategy}!`);
                throw ApiError.BadRequest(`К аккаунту #${strategy} уже привязан другой игровой профиль!`)
            }

            const isUpdated = await AuthService.linkupUserProfile(id, strategy, accountId);
            if (!isUpdated) throw ApiError.BadRequest(`Юзер #${id} не существует!`);

            res.json({
                message: `Игровой профиль #${id} успешно привязан к аккаунту ${strategy + ' #' + accountId}!`
            });
        }
        catch (e) {
            next(e);
        }
    }

    async reloadUserProfile(req, res, next) {
        try {
            const errors = validationResult(req);
            if (!errors.isEmpty()) throw ApiError.BadRequest('Неверные данные!', {errors: errors.errors});

            const {id} = req.body.user, {strategy, accountId} = req.body.linkup;
            const isUpdated = await AuthService.reloadUserProfile(id, strategy, accountId);
            if (!isUpdated) throw ApiError.BadRequest('К этому аккаунту не привязан никакой игровой профиль, перепривязка невозможна!');

            res.json({
                message: `К аккаунту ${strategy + " #" + accountId} был перепривязан новый игровой профиль #${id}!`
            });
        }
        catch (e) {
            next(e);
        }
    }
}

module.exports = new AuthController();