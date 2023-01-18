const {Router} = require('express');
const WeekendTournamentController = require('../controllers/WeekendTournamentController');
const {check} = require("express-validator");

const WeekendTournamentApiRouter = Router();


WeekendTournamentApiRouter.get('/user/:id/weekend_league', [
    check('id').isInt().withMessage('Поле <id> должно быть типа integer!').toInt(),
], WeekendTournamentController.getUserWeekendLeague);

WeekendTournamentApiRouter.get('/user/:id/weekend_matches', [
    check('id').isInt().withMessage('Поле <id> должно быть типа integer!').toInt(),
], WeekendTournamentController.getUserWeekendMatches);

WeekendTournamentApiRouter.get('/phase/:phase_id/matches', [
    check('phase_id').isInt().withMessage('Поле <phase_id> должно быть типа integer!').toInt(),
], WeekendTournamentController.getWeekendMatchesByPhase);


module.exports = WeekendTournamentApiRouter;