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

    async getBotByCountry(req, res, next) {
        try {
            const errors = validationResult(req);
            if (!errors.isEmpty()) throw ApiError.BadRequest('Неверные данные!', {errors: errors.errors});

            const { regionId, countryId } = req.body
            const {id: botId} = await AuthService.getBotByCountry(regionId, countryId);
            
            res.json({
                message: `ID бота по из страны #${countryId}:`,
                details: {
                    userId: botId
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

            const { email, password, accountId, countryId } = req.body
            const existingAccount = await AuthService.getUserProfileByAccountId(accountId);

            if (existingAccount) {
                if (existingAccount.userId === accountId) throw ApiError.BadRequest(`Игровой профиль #${accountId} уже привязан!`);
                throw ApiError.BadRequest(`К аккаунту #${accountId} уже привязан другой игровой профиль!`)
            }

            const isUpdated = await AuthService.linkupUserProfile(email, password, accountId, countryId);
            if (!isUpdated) throw ApiError.BadRequest(`Юзер #${accountId} не существует!`);

            res.json({
                message: `Игровой профиль #${accountId} успешно привязан к аккаунту!`
            });
        }
        catch (e) {
            next(e);
        }
    }

    async login(req, res, next) {
        try {
            const errors = validationResult(req);
            if (!errors.isEmpty()) throw ApiError.BadRequest('Неверные данные!', {errors: errors.errors});

            const { email, password } = req.body

            const isLogined = await AuthService.login(email, password);
            if (!isLogined) throw ApiError.BadRequest(`Юзер не существует!`);

            res.json({
                message: `Вход успешно выполнен`,
                data: {
                  isLogined
                }
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