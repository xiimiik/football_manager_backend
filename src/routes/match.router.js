const {Router} = require('express');
const MatchController = require('../controllers/MatchController');
const {check} = require("express-validator");


const MatchApiRouter = Router();

//!отрефаторить и сделать валидацию
MatchApiRouter.put('/setTeam', [
    check('userId').isInt().withMessage('Поле <userId> должно быть типа integer!').toInt(),
    check('teamJson').isJSON().withMessage('Поле <teamJson> должно быть в виде json!'),
], MatchController.setTeamOnMatch);


MatchApiRouter.put('/setTactic', [
    check('userId').isInt().withMessage('Поле <userId> должно быть типа integer!').toInt(),
    check('tacticJson').isJSON().withMessage('Поле <tacticJson> должно быть в виде json!'),
], MatchController.setTacticOnMatch);

MatchApiRouter.get('/info/:id', [
    check('id').isInt().withMessage('Поле <id> должно быть типа integer!').toInt(),
], MatchController.getMatchInfo);

MatchApiRouter.get('/league/:id/leaderboard', [
    check('id').isInt().withMessage('Поле <id> должно быть типа integer!').toInt(),
], MatchController.getLeagueLeaderboard);


module.exports = MatchApiRouter;