const ApiError = require("../exceptions/api-error");
const LeagueService = require("../services/LeagueService");

class LeagueController {
    async getLeagueByInviteCode(req, res, next) {
        try {
            const inviteCode = req.params.invite_code;

            const league = await LeagueService.getLeagueByInviteCode(inviteCode);
            if (!league) throw ApiError.BadRequest('Неверный код!');

            res.json({
                message: 'League by invite code:',
                details: {
                    league
                }
            });
        }
        catch (e) {
            next(e);
        }
    }
}

module.exports = new LeagueController();